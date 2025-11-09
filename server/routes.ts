import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFoodListingSchema, insertSensorDataSchema, insertOrganizationSchema, insertSupplierSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import OpenAI from "openai";
import { z } from "zod";

// Lazy initialization of OpenAI client
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

// Chat message validation schema
const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(2000),
});

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(20),
});

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count++;
  return true;
}

const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Food Listings Routes
  
  // Get all available food listings
  app.get("/api/food-listings", async (req, res) => {
    try {
      const listings = await storage.getAvailableFoodListings();
      res.json(listings);
    } catch (error) {
      console.error("Error fetching food listings:", error);
      res.status(500).json({ error: "Failed to fetch food listings" });
    }
  });

  // Get single food listing
  app.get("/api/food-listings/:id", async (req, res) => {
    try {
      const listing = await storage.getFoodListing(req.params.id);
      if (!listing) {
        return res.status(404).json({ error: "Food listing not found" });
      }
      res.json(listing);
    } catch (error) {
      console.error("Error fetching food listing:", error);
      res.status(500).json({ error: "Failed to fetch food listing" });
    }
  });

  // Create new food listing with image upload
  app.post("/api/food-listings", upload.single("image"), async (req, res) => {
    try {
      const data = {
        ...req.body,
        pickupTimeStart: new Date(req.body.pickupTimeStart),
        pickupTimeEnd: new Date(req.body.pickupTimeEnd),
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude),
        freshnessScore: parseInt(req.body.freshnessScore) || 85,
        qualityScore: parseInt(req.body.qualityScore) || 85,
        defectsDetected: req.body.defectsDetected ? JSON.parse(req.body.defectsDetected) : [],
        aiAnalysis: req.body.aiAnalysis ? JSON.parse(req.body.aiAnalysis) : null,
      };

      if (req.file) {
        data.imageUrl = `/uploads/${req.file.filename}`;
      }

      const validated = insertFoodListingSchema.parse(data);
      const listing = await storage.createFoodListing(validated);
      
      // Send notifications to nearby organizations
      await storage.notifyNearbyOrganizations(listing);
      
      res.status(201).json(listing);
    } catch (error: any) {
      console.error("Error creating food listing:", error);
      res.status(400).json({ error: error.message || "Failed to create food listing" });
    }
  });

  // Update food listing (e.g., claim food)
  app.patch("/api/food-listings/:id", async (req, res) => {
    try {
      // Only allow updating specific fields to prevent uncontrolled updates
      const allowedUpdates = ["status"];
      const updates: any = {};
      
      for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
          updates[key] = req.body[key];
        }
      }

      const updated = await storage.updateFoodListing(req.params.id, updates);
      if (!updated) {
        return res.status(404).json({ error: "Food listing not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating food listing:", error);
      res.status(500).json({ error: "Failed to update food listing" });
    }
  });

  // Delete food listing
  app.delete("/api/food-listings/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteFoodListing(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Food listing not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting food listing:", error);
      res.status(500).json({ error: "Failed to delete food listing" });
    }
  });

  // Sensor Data Routes
  
  // Get sensor data for a listing
  app.get("/api/sensor-data/:listingId", async (req, res) => {
    try {
      const data = await storage.getSensorDataForListing(req.params.listingId);
      res.json(data);
    } catch (error) {
      console.error("Error fetching sensor data:", error);
      res.status(500).json({ error: "Failed to fetch sensor data" });
    }
  });

  // Create sensor data reading
  app.post("/api/sensor-data", async (req, res) => {
    try {
      const validated = insertSensorDataSchema.parse(req.body);
      const data = await storage.createSensorData(validated);
      res.status(201).json(data);
    } catch (error: any) {
      console.error("Error creating sensor data:", error);
      res.status(400).json({ error: error.message || "Failed to create sensor data" });
    }
  });

  // Organization Routes
  
  // Get all organizations
  app.get("/api/organizations", async (req, res) => {
    try {
      const type = req.query.type as string;
      const organizations = type 
        ? await storage.getOrganizationsByType(type)
        : await storage.getAllOrganizations();
      res.json(organizations);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      res.status(500).json({ error: "Failed to fetch organizations" });
    }
  });

  // Get single organization
  app.get("/api/organizations/:id", async (req, res) => {
    try {
      const organization = await storage.getOrganization(req.params.id);
      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }
      res.json(organization);
    } catch (error) {
      console.error("Error fetching organization:", error);
      res.status(500).json({ error: "Failed to fetch organization" });
    }
  });

  // Register new organization
  app.post("/api/organizations", async (req, res) => {
    try {
      const validated = insertOrganizationSchema.parse(req.body);
      const organization = await storage.createOrganization(validated);
      res.status(201).json(organization);
    } catch (error: any) {
      console.error("Error creating organization:", error);
      res.status(400).json({ error: error.message || "Failed to create organization" });
    }
  });

  // Supplier Routes
  
  // Get all suppliers
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getAllSuppliers();
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ error: "Failed to fetch suppliers" });
    }
  });

  // Get single supplier
  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const supplier = await storage.getSupplier(req.params.id);
      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      console.error("Error fetching supplier:", error);
      res.status(500).json({ error: "Failed to fetch supplier" });
    }
  });

  // Get supplier by user ID
  app.get("/api/suppliers/user/:userId", async (req, res) => {
    try {
      const supplier = await storage.getSupplierByUserId(req.params.userId);
      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found for this user" });
      }
      res.json(supplier);
    } catch (error) {
      console.error("Error fetching supplier:", error);
      res.status(500).json({ error: "Failed to fetch supplier" });
    }
  });

  // Register new supplier
  app.post("/api/suppliers", async (req, res) => {
    try {
      const validated = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validated);
      res.status(201).json(supplier);
    } catch (error: any) {
      console.error("Error creating supplier:", error);
      res.status(400).json({ error: error.message || "Failed to create supplier" });
    }
  });

  // AI Supplier Analysis Route
  app.get("/api/suppliers/:id/analysis", async (req, res) => {
    try {
      const supplier = await storage.getSupplier(req.params.id);
      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }

      // Calculate current safety rating
      const safetyRating = storage.calculateSupplierSafetyRating(supplier);
      
      // Update supplier with new rating
      await storage.updateSupplier(supplier.id, { safetyRating });

      const analysis = {
        supplierId: supplier.id,
        businessName: supplier.businessName,
        safetyRating: safetyRating,
        verification: {
          licenseValid: supplier.licenseExpiryDate ? supplier.licenseExpiryDate > new Date() : false,
          licenseNumber: supplier.licenseNumber,
          licenseExpiryDate: supplier.licenseExpiryDate,
          verificationStatus: supplier.verificationStatus
        },
        performance: {
          totalListings: supplier.totalListings,
          successfulDeliveries: supplier.successfulDeliveries,
          successRate: supplier.totalListings > 0 ? supplier.successfulDeliveries / supplier.totalListings : 0
        },
        reputation: {
          googleRating: supplier.googleRating,
          googlePlaceId: supplier.googlePlaceId,
          accountAge: Math.floor((Date.now() - supplier.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        },
        riskFactors: [
          ...(supplier.licenseExpiryDate && supplier.licenseExpiryDate <= new Date() ? ["Expired license"] : []),
          ...(supplier.googleRating && supplier.googleRating < 3.5 ? ["Low Google rating"] : []),
          ...(supplier.successfulDeliveries < 5 ? ["Limited delivery history"] : []),
          ...(supplier.verificationStatus !== "verified" ? ["Unverified account"] : [])
        ],
        recommendations: safetyRating >= 4.0 ? ["Highly recommended supplier"] :
                        safetyRating >= 3.0 ? ["Proceed with normal caution"] :
                        ["Extra verification recommended", "Consider requesting additional documentation"]
      };

      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing supplier:", error);
      res.status(500).json({ error: "Failed to analyze supplier" });
    }
  });

  // Notification Routes
  
  // Get notifications for an organization
  app.get("/api/notifications/:orgId", async (req, res) => {
    try {
      const notifications = await storage.getNotificationsForOrganization(req.params.orgId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const success = await storage.markNotificationAsRead(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error updating notification:", error);
      res.status(500).json({ error: "Failed to update notification" });
    }
  });

  // AI Chat Assistant Route
  app.post("/api/chat", async (req, res) => {
    try {
      // Check rate limit
      const clientIp = req.ip || req.socket.remoteAddress || "unknown";
      if (!checkRateLimit(clientIp)) {
        return res.status(429).json({ 
          error: "Too many requests. Please try again in a minute." 
        });
      }

      // Validate request body
      const validationResult = chatRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request format",
          details: validationResult.error.issues 
        });
      }

      const { messages } = validationResult.data;

      // Check if OpenAI is configured
      let client: OpenAI;
      try {
        client = getOpenAIClient();
      } catch (error: any) {
        console.error("OpenAI not configured:", error.message);
        return res.status(503).json({ 
          error: "AI chat service is not available. Please contact support." 
        });
      }

      const systemPrompt = `You are an AI assistant for FoodLoop AI, a platform that reduces food waste by connecting food donors with recipients. 

Your role is to help users:
- Post surplus food listings with proper details
- Understand food quality and freshness scores
- Learn about optimal pickup times and food safety
- Navigate the platform features
- Answer questions about food waste reduction

Key features of FoodLoop AI:
- AI-powered quality inspection using computer vision
- Real-time IoT sensor monitoring (temperature, humidity)
- Smart matching between donors and recipients
- Impact tracking (meals provided, CO2 prevented, pounds saved)

Be helpful, concise, and encouraging. Focus on food waste reduction and community impact.`;

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const assistantMessage = completion.choices[0].message;
      res.json({ message: assistantMessage });
    } catch (error: any) {
      console.error("Error in chat:", error);
      
      // Handle OpenAI-specific errors
      if (error.status === 401) {
        return res.status(503).json({ error: "AI service authentication failed" });
      }
      if (error.status === 429) {
        return res.status(503).json({ error: "AI service is busy. Please try again." });
      }
      
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Serve uploaded images
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads"), {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
    }
  }));

  const httpServer = createServer(app);

  return httpServer;
}
