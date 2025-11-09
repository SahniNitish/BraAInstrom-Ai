import { type User, type InsertUser, type FoodListing, type InsertFoodListing, type SensorData, type InsertSensorData, type Organization, type InsertOrganization, type Supplier, type InsertSupplier, type Notification, type InsertNotification } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Food Listings
  getFoodListing(id: string): Promise<FoodListing | undefined>;
  getAllFoodListings(): Promise<FoodListing[]>;
  getAvailableFoodListings(): Promise<FoodListing[]>;
  createFoodListing(listing: InsertFoodListing): Promise<FoodListing>;
  updateFoodListing(id: string, listing: Partial<FoodListing>): Promise<FoodListing | undefined>;
  deleteFoodListing(id: string): Promise<boolean>;
  
  // Sensor Data
  getSensorDataForListing(listingId: string): Promise<SensorData[]>;
  createSensorData(data: InsertSensorData): Promise<SensorData>;
  
  // Organizations
  getOrganization(id: string): Promise<Organization | undefined>;
  getAllOrganizations(): Promise<Organization[]>;
  getOrganizationsByType(type: string): Promise<Organization[]>;
  createOrganization(org: InsertOrganization): Promise<Organization>;
  updateOrganization(id: string, org: Partial<Organization>): Promise<Organization | undefined>;
  
  // Suppliers
  getSupplier(id: string): Promise<Supplier | undefined>;
  getSupplierByUserId(userId: string): Promise<Supplier | undefined>;
  getAllSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<Supplier>): Promise<Supplier | undefined>;
  
  // Notifications
  getNotification(id: string): Promise<Notification | undefined>;
  getNotificationsForOrganization(orgId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private foodListings: Map<string, FoodListing>;
  private sensorData: Map<string, SensorData>;
  private organizations: Map<string, Organization>;
  private suppliers: Map<string, Supplier>;
  private notifications: Map<string, Notification>;

  constructor() {
    this.users = new Map();
    this.foodListings = new Map();
    this.sensorData = new Map();
    this.organizations = new Map();
    this.suppliers = new Map();
    this.notifications = new Map();
    this.initializeHardcodedData();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getFoodListing(id: string): Promise<FoodListing | undefined> {
    return this.foodListings.get(id);
  }

  async getAllFoodListings(): Promise<FoodListing[]> {
    return Array.from(this.foodListings.values());
  }

  async getAvailableFoodListings(): Promise<FoodListing[]> {
    return Array.from(this.foodListings.values()).filter(
      listing => listing.status === "available"
    );
  }

  async createFoodListing(insertListing: InsertFoodListing): Promise<FoodListing> {
    const id = randomUUID();
    const listing: FoodListing = {
      ...insertListing,
      imageUrl: insertListing.imageUrl ?? null,
      defectsDetected: insertListing.defectsDetected ?? null,
      aiAnalysis: insertListing.aiAnalysis ?? null,
      id,
      status: "available",
      createdAt: new Date(),
    };
    this.foodListings.set(id, listing);
    return listing;
  }

  async updateFoodListing(id: string, updates: Partial<FoodListing>): Promise<FoodListing | undefined> {
    const existing = this.foodListings.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.foodListings.set(id, updated);
    return updated;
  }

  async deleteFoodListing(id: string): Promise<boolean> {
    return this.foodListings.delete(id);
  }

  async getSensorDataForListing(listingId: string): Promise<SensorData[]> {
    return Array.from(this.sensorData.values()).filter(
      data => data.listingId === listingId
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createSensorData(insertData: InsertSensorData): Promise<SensorData> {
    const id = randomUUID();
    const data: SensorData = {
      ...insertData,
      id,
      timestamp: new Date(),
    };
    this.sensorData.set(id, data);
    return data;
  }

  // Organization methods
  async getOrganization(id: string): Promise<Organization | undefined> {
    return this.organizations.get(id);
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return Array.from(this.organizations.values());
  }

  async getOrganizationsByType(type: string): Promise<Organization[]> {
    return Array.from(this.organizations.values()).filter(org => org.type === type);
  }

  async createOrganization(insertOrg: InsertOrganization): Promise<Organization> {
    const id = randomUUID();
    const org: Organization = {
      ...insertOrg,
      licenseNumber: insertOrg.licenseNumber ?? null,
      isVerified: insertOrg.isVerified ?? 0,
      registrationDate: insertOrg.registrationDate ?? new Date(),
      preferences: insertOrg.preferences ?? null,
      id,
      createdAt: new Date(),
    };
    this.organizations.set(id, org);
    return org;
  }

  async updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization | undefined> {
    const existing = this.organizations.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.organizations.set(id, updated);
    return updated;
  }

  // Supplier methods
  async getSupplier(id: string): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async getSupplierByUserId(userId: string): Promise<Supplier | undefined> {
    return Array.from(this.suppliers.values()).find(supplier => supplier.userId === userId);
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const id = randomUUID();
    const supplier: Supplier = {
      ...insertSupplier,
      licenseNumber: insertSupplier.licenseNumber ?? null,
      licenseExpiryDate: insertSupplier.licenseExpiryDate ?? null,
      googlePlaceId: insertSupplier.googlePlaceId ?? null,
      googleRating: insertSupplier.googleRating ?? null,
      verificationStatus: insertSupplier.verificationStatus ?? "pending",
      id,
      totalListings: 0,
      successfulDeliveries: 0,
      safetyRating: 0,
      createdAt: new Date(),
    };
    this.suppliers.set(id, supplier);
    return supplier;
  }

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | undefined> {
    const existing = this.suppliers.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.suppliers.set(id, updated);
    return updated;
  }

  // Notification methods
  async getNotification(id: string): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async getNotificationsForOrganization(orgId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      notification => notification.organizationId === orgId
    ).sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...insertNotification,
      isRead: insertNotification.isRead ?? 0,
      id,
      sentAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    
    notification.isRead = 1;
    this.notifications.set(id, notification);
    return true;
  }

  // AI Safety Rating Calculator
  calculateSupplierSafetyRating(supplier: Supplier): number {
    let score = 0;
    let totalFactors = 0;

    // License verification (30% weight)
    if (supplier.licenseNumber && supplier.licenseExpiryDate) {
      const isLicenseValid = supplier.licenseExpiryDate > new Date();
      score += isLicenseValid ? 30 : 10;
    } else {
      score += 5;
    }
    totalFactors += 30;

    // Google rating (25% weight)
    if (supplier.googleRating) {
      score += (supplier.googleRating / 5) * 25;
    } else {
      score += 10;
    }
    totalFactors += 25;

    // Success rate (20% weight)
    const successRate = supplier.totalListings > 0 
      ? supplier.successfulDeliveries / supplier.totalListings 
      : 0.5;
    score += successRate * 20;
    totalFactors += 20;

    // Account age (15% weight)
    const accountAgeMonths = Math.floor(
      (Date.now() - supplier.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    const ageScore = Math.min(accountAgeMonths / 12, 1) * 15;
    score += ageScore;
    totalFactors += 15;

    // Verification status (10% weight)
    const verificationScore = supplier.verificationStatus === 'verified' ? 10 : 
                             supplier.verificationStatus === 'pending' ? 5 : 0;
    score += verificationScore;
    totalFactors += 10;

    return Math.round((score / totalFactors) * 5 * 10) / 10; // Round to 1 decimal place, out of 5
  }

  // Initialize hardcoded data for demo
  private initializeHardcodedData() {
    // Sample Organizations
    const sampleOrgs: Organization[] = [
      {
        id: "org1",
        name: "Food for All NGO",
        type: "ngo",
        email: "contact@foodforall.org",
        phone: "+1-555-0101",
        address: "123 Charity St, Delhi, India",
        latitude: 28.6139,
        longitude: 77.2090,
        licenseNumber: "NGO-2023-001",
        isVerified: 1,
        registrationDate: new Date('2023-01-15'),
        preferences: {
          foodTypes: ["cooked", "packaged", "fresh"],
          maxRadius: 10,
          preferredPickupTimes: ["morning", "evening"]
        },
        createdAt: new Date('2023-01-15')
      },
      {
        id: "org2",
        name: "Elder Care Home",
        type: "home_care",
        email: "admin@eldercare.com",
        phone: "+1-555-0102",
        address: "456 Senior Blvd, Mumbai, India",
        latitude: 19.0760,
        longitude: 72.8777,
        licenseNumber: "HC-2022-045",
        isVerified: 1,
        registrationDate: new Date('2022-08-20'),
        preferences: {
          foodTypes: ["cooked", "soft"],
          maxRadius: 5,
          preferredPickupTimes: ["morning"]
        },
        createdAt: new Date('2022-08-20')
      },
      {
        id: "org3",
        name: "Community Food Bank",
        type: "food_bank",
        email: "info@communityfoodbank.org",
        phone: "+1-555-0103",
        address: "789 Distribution Ave, Bangalore, India",
        latitude: 12.9716,
        longitude: 77.5946,
        licenseNumber: "FB-2023-012",
        isVerified: 1,
        registrationDate: new Date('2023-03-10'),
        preferences: {
          foodTypes: ["packaged", "canned", "dry"],
          maxRadius: 15,
          preferredPickupTimes: ["morning", "afternoon"]
        },
        createdAt: new Date('2023-03-10')
      }
    ];

    // Sample Suppliers
    const sampleSuppliers: Supplier[] = [
      {
        id: "sup1",
        userId: "user1",
        businessName: "Golden Palace Restaurant",
        businessType: "restaurant",
        email: "chef@goldenpalace.com",
        phone: "+1-555-0201",
        address: "321 Food Court, Delhi, India",
        latitude: 28.6129,
        longitude: 77.2295,
        licenseNumber: "FSSAI-12345678901",
        licenseExpiryDate: new Date('2025-06-30'),
        googlePlaceId: "ChIJd8BlQ2BZwokRAFUEcm_qrcQ",
        googleRating: 4.5,
        totalListings: 45,
        successfulDeliveries: 42,
        safetyRating: 4.3,
        verificationStatus: "verified",
        createdAt: new Date('2023-02-15')
      },
      {
        id: "sup2",
        userId: "user2",
        businessName: "Fresh Mart Grocery",
        businessType: "grocery",
        email: "manager@freshmart.com",
        phone: "+1-555-0202",
        address: "654 Market St, Mumbai, India",
        latitude: 19.0785,
        longitude: 72.8785,
        licenseNumber: "FSSAI-98765432109",
        licenseExpiryDate: new Date('2024-12-31'),
        googlePlaceId: "ChIJwe1EZjDG5zsRaYxkjY_tpF0",
        googleRating: 4.2,
        totalListings: 23,
        successfulDeliveries: 20,
        safetyRating: 3.9,
        verificationStatus: "verified",
        createdAt: new Date('2023-05-20')
      },
      {
        id: "sup3",
        userId: "user3",
        businessName: "Sweet Treats Bakery",
        businessType: "bakery",
        email: "baker@sweettreats.com",
        phone: "+1-555-0203",
        address: "987 Baker Lane, Bangalore, India",
        latitude: 12.9762,
        longitude: 77.6033,
        licenseNumber: "FSSAI-56789012345",
        licenseExpiryDate: new Date('2025-03-15'),
        googlePlaceId: "ChIJbU60yXAWrjsR4E9-4NKBSQI",
        googleRating: 4.7,
        totalListings: 12,
        successfulDeliveries: 11,
        safetyRating: 4.6,
        verificationStatus: "verified",
        createdAt: new Date('2023-08-10')
      }
    ];

    // Store the data
    sampleOrgs.forEach(org => this.organizations.set(org.id, org));
    sampleSuppliers.forEach(supplier => this.suppliers.set(supplier.id, supplier));

    // Recalculate safety ratings
    sampleSuppliers.forEach(supplier => {
      const rating = this.calculateSupplierSafetyRating(supplier);
      supplier.safetyRating = rating;
      this.suppliers.set(supplier.id, supplier);
    });
  }

  // Helper method to send notifications to nearby organizations
  async notifyNearbyOrganizations(listing: FoodListing): Promise<void> {
    const organizations = await this.getAllOrganizations();
    
    organizations.forEach(async (org) => {
      // Calculate distance (simple approximation)
      const distance = this.calculateDistance(
        listing.latitude, listing.longitude,
        org.latitude, org.longitude
      );
      
      // Check if within organization's preferred radius
      const maxRadius = (org.preferences as any)?.maxRadius || 10;
      
      if (distance <= maxRadius) {
        await this.createNotification({
          organizationId: org.id,
          listingId: listing.id,
          type: "new_listing",
          title: `New Food Available: ${listing.title}`,
          message: `${listing.quantity} of ${listing.category} available at ${listing.location}. Pickup time: ${listing.pickupTimeStart.toLocaleTimeString()} - ${listing.pickupTimeEnd.toLocaleTimeString()}`,
          isRead: 0
        });
      }
    });
  }

  // Helper method to calculate distance between two points
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  }
}

export const storage = new MemStorage();
