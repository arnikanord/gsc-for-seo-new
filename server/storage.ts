import { users, websites, searchData, insights } from "@shared/schema";
import type { User, InsertUser, Website, InsertWebsite, SearchData, InsertSearchData, Insight, InsertInsight } from "@shared/schema";

// Interface for storage methods
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserGoogleCredentials(id: number, googleId: string, accessToken: string, refreshToken: string): Promise<User>;

  // Website operations
  getWebsites(userId: number): Promise<Website[]>;
  getWebsite(id: number): Promise<Website | undefined>;
  createWebsite(website: InsertWebsite): Promise<Website>;
  
  // Search data operations
  getSearchData(websiteId: number, startDate: Date, endDate: Date): Promise<SearchData | undefined>;
  createSearchData(searchData: InsertSearchData): Promise<SearchData>;
  
  // Insights operations
  getInsights(websiteId: number): Promise<Insight[]>;
  createInsight(insight: InsertInsight): Promise<Insight>;
  deleteInsights(websiteId: number): Promise<void>;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private websites: Map<number, Website>;
  private searchDataMap: Map<number, SearchData>;
  private insightsMap: Map<number, Insight>;
  
  private userIdCounter: number;
  private websiteIdCounter: number;
  private searchDataIdCounter: number;
  private insightIdCounter: number;

  constructor() {
    this.users = new Map();
    this.websites = new Map();
    this.searchDataMap = new Map();
    this.insightsMap = new Map();
    
    this.userIdCounter = 1;
    this.websiteIdCounter = 1;
    this.searchDataIdCounter = 1;
    this.insightIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.googleId === googleId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt, googleId: null, googleAccessToken: null, googleRefreshToken: null };
    this.users.set(id, user);
    return user;
  }

  async updateUserGoogleCredentials(id: number, googleId: string, accessToken: string, refreshToken: string): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser: User = {
      ...user,
      googleId,
      googleAccessToken: accessToken,
      googleRefreshToken: refreshToken
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Website methods
  async getWebsites(userId: number): Promise<Website[]> {
    return Array.from(this.websites.values()).filter(
      (website) => website.userId === userId
    );
  }

  async getWebsite(id: number): Promise<Website | undefined> {
    return this.websites.get(id);
  }

  async createWebsite(insertWebsite: InsertWebsite): Promise<Website> {
    const id = this.websiteIdCounter++;
    const createdAt = new Date();
    const website: Website = { ...insertWebsite, id, createdAt };
    this.websites.set(id, website);
    return website;
  }

  // Search data methods
  async getSearchData(websiteId: number, startDate: Date, endDate: Date): Promise<SearchData | undefined> {
    return Array.from(this.searchDataMap.values()).find(
      (data) => data.websiteId === websiteId &&
                data.startDate.getTime() === startDate.getTime() &&
                data.endDate.getTime() === endDate.getTime()
    );
  }

  async createSearchData(insertSearchData: InsertSearchData): Promise<SearchData> {
    const id = this.searchDataIdCounter++;
    const createdAt = new Date();
    const searchDataEntry: SearchData = { ...insertSearchData, id, createdAt };
    this.searchDataMap.set(id, searchDataEntry);
    return searchDataEntry;
  }

  // Insights methods
  async getInsights(websiteId: number): Promise<Insight[]> {
    return Array.from(this.insightsMap.values()).filter(
      (insight) => insight.websiteId === websiteId
    );
  }

  async createInsight(insertInsight: InsertInsight): Promise<Insight> {
    const id = this.insightIdCounter++;
    const createdAt = new Date();
    const insight: Insight = { ...insertInsight, id, createdAt };
    this.insightsMap.set(id, insight);
    return insight;
  }

  async deleteInsights(websiteId: number): Promise<void> {
    // Find all insights for the website and remove them
    const websiteInsights = await this.getInsights(websiteId);
    for (const insight of websiteInsights) {
      this.insightsMap.delete(insight.id);
    }
  }
}

// Export a singleton instance of MemStorage
export const storage = new MemStorage();
