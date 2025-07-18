import { query } from "./_generated/server";
import { v } from "convex/values";

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

// Query to get current user (will be used with authentication context)
export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        // This will be enhanced with authentication context in later tasks
        // For now, it's a placeholder for the user data retrieval pattern
        return null;
    },
});