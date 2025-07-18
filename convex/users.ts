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

// Query to get current user (authenticated user)
export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        // Get user from database using the identity
        const user = await ctx.db
            .query("users")
            .withIndex("tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .first();

        return user;
    },
});