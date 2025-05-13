import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import MemoryStore from "memorystore";
import { z } from "zod";
import { insertUserSchema, insertWebsiteSchema, insertInsightSchema } from "@shared/schema";
import googleSearchConsole from "./lib/google-search-console";
import anthropic from "./lib/anthropic";

// Create memory store for sessions
const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "SearchScopeSecret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 24 * 60 * 60 * 1000 },
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // 24 hours
      }),
    })
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Passport local strategy for username/password login
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        if (user.password !== password) { // In production, use proper password hashing
          return done(null, false, { message: "Invalid username or password" });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Google OAuth strategy if credentials are provided
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await storage.getUserByGoogleId(profile.id);
            
            if (!user) {
              // Create a new user if not exists
              user = await storage.createUser({
                username: profile.displayName || `user_${profile.id}`,
                password: Math.random().toString(36).slice(-8), // Random password for OAuth users
                email: profile.emails?.[0]?.value,
              });
            }
            
            // Update Google credentials
            await storage.updateUserGoogleCredentials(
              user.id,
              profile.id,
              accessToken,
              refreshToken || ""
            );
            
            return done(null, user);
          } catch (err) {
            return done(err);
          }
        }
      )
    );
  }

  // ----- Authentication Routes -----

  // Register route
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(validatedData);
      
      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed after registration" });
        }
        return res.status(201).json({ id: user.id, username: user.username });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login route
  app.post("/api/auth/login", passport.authenticate("local"), (req: Request, res: Response) => {
    res.json({ user: req.user });
  });

  // Logout route
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  // Google OAuth routes
  app.get("/api/auth/google", passport.authenticate("google", { 
    scope: [
      "profile", 
      "email", 
      "https://www.googleapis.com/auth/webmasters.readonly",
      "https://www.googleapis.com/auth/webmasters"
    ] 
  }));
  
  app.get("/api/auth/google/callback", 
    passport.authenticate("google", { failureRedirect: "/" }),
    (req: Request, res: Response) => {
      res.redirect("/dashboard");
    }
  );

  // Get current user
  app.get("/api/auth/user", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({ user: req.user });
  });

  // ----- Search Console API Routes -----

  // Authentication middleware
  function isAuthenticated(req: Request, res: Response, next: any) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  }

  // Generate Google OAuth URL
  app.get("/api/search-console/auth-url", isAuthenticated, (req: Request, res: Response) => {
    try {
      const oauth2Client = googleSearchConsole.createOAuth2Client();
      const url = googleSearchConsole.getAuthUrl(oauth2Client);
      res.json({ url });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate auth URL", error: error.message });
    }
  });

  // Get user's websites from Search Console
  app.get("/api/search-console/sites", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      if (!user.googleAccessToken) {
        return res.status(400).json({ message: "Google Search Console not connected" });
      }
      
      const sites = await googleSearchConsole.getSiteList(user.googleAccessToken);
      res.json({ sites });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sites", error: error.message });
    }
  });

  // Get search analytics data
  app.get("/api/search-console/analytics", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { siteUrl, startDate, endDate, dimensions } = req.query;
      
      if (!user.googleAccessToken) {
        return res.status(400).json({ message: "Google Search Console not connected" });
      }
      
      if (!siteUrl || !startDate || !endDate) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      
      const dimensionsArray = dimensions ? (dimensions as string).split(",") : ["query"];
      const data = await googleSearchConsole.getSearchAnalytics(
        user.googleAccessToken,
        siteUrl as string,
        startDate as string,
        endDate as string,
        dimensionsArray
      );
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics data", error: error.message });
    }
  });

  // Get performance by date
  app.get("/api/search-console/performance-by-date", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { siteUrl, startDate, endDate } = req.query;
      
      if (!user.googleAccessToken) {
        return res.status(400).json({ message: "Google Search Console not connected" });
      }
      
      if (!siteUrl || !startDate || !endDate) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      
      const data = await googleSearchConsole.getPerformanceByDate(
        user.googleAccessToken,
        siteUrl as string,
        startDate as string,
        endDate as string
      );
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch performance data", error: error.message });
    }
  });

  // Get performance by device
  app.get("/api/search-console/performance-by-device", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { siteUrl, startDate, endDate } = req.query;
      
      if (!user.googleAccessToken) {
        return res.status(400).json({ message: "Google Search Console not connected" });
      }
      
      if (!siteUrl || !startDate || !endDate) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      
      const data = await googleSearchConsole.getPerformanceByDevice(
        user.googleAccessToken,
        siteUrl as string,
        startDate as string,
        endDate as string
      );
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch device data", error: error.message });
    }
  });

  // Get performance by page
  app.get("/api/search-console/performance-by-page", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { siteUrl, startDate, endDate } = req.query;
      
      if (!user.googleAccessToken) {
        return res.status(400).json({ message: "Google Search Console not connected" });
      }
      
      if (!siteUrl || !startDate || !endDate) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      
      const data = await googleSearchConsole.getPerformanceByPage(
        user.googleAccessToken,
        siteUrl as string,
        startDate as string,
        endDate as string
      );
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch page data", error: error.message });
    }
  });

  // ----- Anthropic Analysis Routes -----

  // Analyze search data
  app.post("/api/analyze/search-data", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { data } = req.body;
      
      if (!data) {
        return res.status(400).json({ message: "No data provided for analysis" });
      }
      
      const analysis = await anthropic.analyzeSearchData(data);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze search data", error: error.message });
    }
  });

  // Get query recommendations
  app.post("/api/analyze/query-recommendations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { query, data } = req.body;
      
      if (!query || !data) {
        return res.status(400).json({ message: "Missing query or data" });
      }
      
      const recommendations = await anthropic.getQueryRecommendations(query, data);
      res.json({ recommendations });
    } catch (error) {
      res.status(500).json({ message: "Failed to get query recommendations", error: error.message });
    }
  });

  // Summarize performance trends
  app.post("/api/analyze/performance-trends", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { data } = req.body;
      
      if (!data) {
        return res.status(400).json({ message: "No data provided for analysis" });
      }
      
      const summary = await anthropic.summarizePerformanceTrends(data);
      res.json({ summary });
    } catch (error) {
      res.status(500).json({ message: "Failed to summarize performance trends", error: error.message });
    }
  });

  // ----- Website Management Routes -----

  // Save a website
  app.post("/api/websites", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const validatedData = insertWebsiteSchema.parse({
        ...req.body,
        userId: user.id
      });
      
      // Check if website already exists
      const userWebsites = await storage.getWebsites(user.id);
      const existingWebsite = userWebsites.find(w => w.url === validatedData.url);
      
      if (existingWebsite) {
        return res.json(existingWebsite);
      }
      
      const website = await storage.createWebsite(validatedData);
      res.status(201).json(website);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save website", error: error.message });
    }
  });

  // Get user's websites
  app.get("/api/websites", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const websites = await storage.getWebsites(user.id);
      res.json(websites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch websites", error: error.message });
    }
  });

  // ----- Insights Routes -----

  // Save insights
  app.post("/api/insights", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { websiteId, insights } = req.body;
      
      if (!websiteId || !insights || !Array.isArray(insights)) {
        return res.status(400).json({ message: "Invalid input" });
      }
      
      // Delete existing insights for this website
      await storage.deleteInsights(websiteId);
      
      // Save new insights
      const savedInsights = [];
      for (const insight of insights) {
        const validatedData = insertInsightSchema.parse({
          ...insight,
          websiteId
        });
        
        const savedInsight = await storage.createInsight(validatedData);
        savedInsights.push(savedInsight);
      }
      
      res.status(201).json(savedInsights);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save insights", error: error.message });
    }
  });

  // Get website insights
  app.get("/api/insights/:websiteId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { websiteId } = req.params;
      const insights = await storage.getInsights(parseInt(websiteId));
      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch insights", error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
