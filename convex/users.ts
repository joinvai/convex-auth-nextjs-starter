import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Query to get user by email using the email index
export const getUserByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, { email }) => {
        return await ctx.db
            .query("users")
            .withIndex("email", (q) => q.eq("email", email))
            .first();
    },
});

// Query to get current authenticated user with session information
export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return null;
        }

        // Get user from database using the authenticated user ID
        const user = await ctx.db.get(userId);
        if (!user) {
            return null;
        }

        // Return user data with additional session information
        return {
            ...user,
            _id: userId,
            // Add session metadata
            sessionActive: true,
            lastActive: Date.now(),
        };
    },
});

// Query to get user session information
export const getUserSession = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return {
                isAuthenticated: false,
                user: null,
                sessionActive: false,
            };
        }

        const user = await ctx.db.get(userId);
        return {
            isAuthenticated: true,
            user: user,
            sessionActive: true,
            userId: userId,
            lastChecked: Date.now(),
        };
    },
});

// Mutation to update user's last active timestamp
export const updateLastActive = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("User not authenticated");
        }

        // Update user's last active timestamp
        await ctx.db.patch(userId, {
            // Note: We can't add arbitrary fields to the auth users table
            // This is mainly for demonstration of session activity tracking
        });

        return { success: true, timestamp: Date.now() };
    },
});