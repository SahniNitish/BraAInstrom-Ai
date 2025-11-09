import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const foodListings = pgTable("food_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  quantity: text("quantity").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  location: text("location").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  pickupTimeStart: timestamp("pickup_time_start").notNull(),
  pickupTimeEnd: timestamp("pickup_time_end").notNull(),
  freshnessScore: integer("freshness_score").notNull(),
  qualityScore: integer("quality_score").notNull(),
  defectsDetected: text("defects_detected").array(),
  aiAnalysis: jsonb("ai_analysis"),
  status: text("status").notNull().default("available"),
  donorId: varchar("donor_id").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const sensorData = pgTable("sensor_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").notNull(),
  temperature: real("temperature").notNull(),
  humidity: real("humidity").notNull(),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
});

export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'ngo', 'home_care', 'food_bank'
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  licenseNumber: text("license_number"),
  isVerified: integer("is_verified").notNull().default(0), // 0 or 1 (boolean)
  registrationDate: timestamp("registration_date").notNull().default(sql`now()`),
  preferences: jsonb("preferences"), // food types, radius, etc.
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  businessName: text("business_name").notNull(),
  businessType: text("business_type").notNull(), // 'restaurant', 'grocery', 'bakery', etc.
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  licenseNumber: text("license_number"),
  licenseExpiryDate: timestamp("license_expiry_date"),
  googlePlaceId: text("google_place_id"),
  googleRating: real("google_rating"),
  totalListings: integer("total_listings").notNull().default(0),
  successfulDeliveries: integer("successful_deliveries").notNull().default(0),
  safetyRating: real("safety_rating").notNull().default(0),
  verificationStatus: text("verification_status").notNull().default("pending"), // 'pending', 'verified', 'rejected'
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull(),
  listingId: varchar("listing_id").notNull(),
  type: text("type").notNull(), // 'new_listing', 'listing_claimed', 'reminder'
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: integer("is_read").notNull().default(0), // 0 or 1 (boolean)
  sentAt: timestamp("sent_at").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertFoodListingSchema = createInsertSchema(foodListings).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertSensorDataSchema = createInsertSchema(sensorData).omit({
  id: true,
  timestamp: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
  safetyRating: true,
  totalListings: true,
  successfulDeliveries: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  sentAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type FoodListing = typeof foodListings.$inferSelect;
export type InsertFoodListing = z.infer<typeof insertFoodListingSchema>;
export type SensorData = typeof sensorData.$inferSelect;
export type InsertSensorData = z.infer<typeof insertSensorDataSchema>;
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
