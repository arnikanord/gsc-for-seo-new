import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table to store authenticated users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  googleId: text("google_id").unique(),
  googleAccessToken: text("google_access_token"),
  googleRefreshToken: text("google_refresh_token"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Website table to store user's connected websites
export const websites = pgTable("websites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  url: text("url").notNull(),
  siteUrl: text("site_url").notNull(),
  permissionLevel: text("permission_level"),
  createdAt: timestamp("created_at").defaultNow(),
});

// SearchData table to store search analytics data
export const searchData = pgTable("search_data", {
  id: serial("id").primaryKey(),
  websiteId: integer("website_id").notNull().references(() => websites.id),
  data: jsonb("data").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insights table to store AI generated insights
export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  websiteId: integer("website_id").notNull().references(() => websites.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // positive, opportunity, info
  createdAt: timestamp("created_at").defaultNow(),
});

// Create Zod schemas for insertion
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertWebsiteSchema = createInsertSchema(websites).omit({
  id: true,
  createdAt: true,
});

export const insertSearchDataSchema = createInsertSchema(searchData).omit({
  id: true,
  createdAt: true,
});

export const insertInsightSchema = createInsertSchema(insights).omit({
  id: true,
  createdAt: true,
});

// Define types for TypeScript
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Website = typeof websites.$inferSelect;
export type InsertWebsite = z.infer<typeof insertWebsiteSchema>;

export type SearchData = typeof searchData.$inferSelect;
export type InsertSearchData = z.infer<typeof insertSearchDataSchema>;

export type Insight = typeof insights.$inferSelect;
export type InsertInsight = z.infer<typeof insertInsightSchema>;

// Additional schema for search analytics data structure
export const searchAnalyticsSchema = z.object({
  rows: z.array(
    z.object({
      keys: z.array(z.string()),
      clicks: z.number(),
      impressions: z.number(),
      ctr: z.number(),
      position: z.number(),
    })
  ),
  responseAggregationType: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
});

export type SearchAnalytics = z.infer<typeof searchAnalyticsSchema>;
