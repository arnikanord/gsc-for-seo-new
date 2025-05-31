import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "./firebase";

export interface UserSubscription {
  id: string;
  email: string;
  freeRequestsUsed: number;
  freeRequestsLimit: number;
  isPaid: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing' | null;
  currentPeriodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const userService = {
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          currentPeriodEnd: data.currentPeriodEnd?.toDate(),
        } as UserSubscription;
      }
      return null;
    } catch (error) {
      console.error("Error getting user subscription:", error);
      return null;
    }
  },

  async createUser(userId: string, email: string): Promise<UserSubscription> {
    const userData: UserSubscription = {
      id: userId,
      email,
      freeRequestsUsed: 0,
      freeRequestsLimit: 10,
      isPaid: false,
      subscriptionStatus: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, "users", userId), userData);
    return userData;
  },

  async incrementRequestCount(userId: string): Promise<boolean> {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        freeRequestsUsed: increment(1),
        updatedAt: new Date(),
      });
      return true;
    } catch (error) {
      console.error("Error incrementing request count:", error);
      return false;
    }
  },

  async updateSubscription(
    userId: string, 
    subscriptionData: Partial<UserSubscription>
  ): Promise<boolean> {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        ...subscriptionData,
        updatedAt: new Date(),
      });
      return true;
    } catch (error) {
      console.error("Error updating subscription:", error);
      return false;
    }
  },

  async canMakeRequest(userId: string): Promise<{ canMake: boolean; reason?: string }> {
    const user = await this.getUserSubscription(userId);
    
    if (!user) {
      return { canMake: false, reason: "User not found" };
    }

    // If user has an active paid subscription
    if (user.isPaid && user.subscriptionStatus === 'active') {
      return { canMake: true };
    }

    // Check free tier limits
    if (user.freeRequestsUsed >= user.freeRequestsLimit) {
      return { canMake: false, reason: "Free tier limit exceeded" };
    }

    return { canMake: true };
  }
};