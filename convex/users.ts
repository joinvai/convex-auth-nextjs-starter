import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

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

// Mutation for secure session cleanup on sign-out
export const performSecureSignOut = mutation({
    args: {
        email: v.optional(v.string()),
        sessionId: v.optional(v.string()),
        clearAllSessions: v.optional(v.boolean()),
    },
    handler: async (ctx, { email, sessionId, clearAllSessions = false }) => {
        const userId = await getAuthUserId(ctx);

        try {
            // Log the sign-out attempt
            console.log(`Secure sign-out initiated for ${email || 'unknown user'}, clearAllSessions: ${clearAllSessions}`);

            // If clearing all sessions, we need to invalidate all auth sessions for this user
            if (clearAllSessions && userId) {
                // Find all auth sessions for this user
                const userSessions = await ctx.db
                    .query("authSessions")
                    .filter((q) => q.eq(q.field("userId"), userId))
                    .collect();

                // Delete all sessions
                for (const session of userSessions) {
                    await ctx.db.delete(session._id);
                }

                // Also clear any refresh tokens for these sessions
                const refreshTokens = [];
                for (const session of userSessions) {
                    const sessionTokens = await ctx.db
                        .query("authRefreshTokens")
                        .filter((q) => q.eq(q.field("sessionId"), session._id))
                        .collect();
                    refreshTokens.push(...sessionTokens);
                }

                for (const token of refreshTokens) {
                    await ctx.db.delete(token._id);
                }

                console.log(`Cleared ${userSessions.length} sessions and ${refreshTokens.length} refresh tokens for user ${userId}`);
            }

            // Set a flag in localStorage to notify other tabs (handled by SessionManager)
            if (typeof window !== 'undefined') {
                localStorage.setItem('convex-auth-signout', 'true');
            }

            return {
                success: true,
                clearedSessions: clearAllSessions,
                timestamp: Date.now(),
            };
        } catch (error) {
            // Log the failed sign-out attempt
            console.log(`Secure sign-out failed for ${email || 'unknown user'}: ${error instanceof Error ? error.message : "Unknown error"}`);
            throw error;
        }
    },
});

// Query to get active sessions for a user (for security dashboard)
export const getUserActiveSessions = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return [];
        }

        // Get active auth sessions
        const sessions = await ctx.db
            .query("authSessions")
            .filter((q) => q.eq(q.field("userId"), userId))
            .collect();

        // Return session info without sensitive data
        return sessions.map(session => ({
            id: session._id,
            createdAt: session._creationTime,
            expiresAt: session.expirationTime,
            isActive: session.expirationTime > Date.now(),
            // Don't expose the actual session token
        }));
    },
});

// Mutation to revoke a specific session
export const revokeSession = mutation({
    args: { sessionId: v.id("authSessions") },
    handler: async (ctx, { sessionId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("User not authenticated");
        }

        // Verify the session belongs to the current user
        const session = await ctx.db.get(sessionId);
        if (!session || session.userId !== userId) {
            throw new Error("Session not found or access denied");
        }

        // Delete the session
        await ctx.db.delete(sessionId);

        // Log the session revocation
        console.log(`Session revoked: ${sessionId} for user ${userId}`);

        return {
            success: true,
            revokedSessionId: sessionId,
            timestamp: Date.now(),
        };
    },
});

// Mutation to cleanup expired sessions (should be run periodically)
export const cleanupExpiredSessions = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();

        // Find expired auth sessions
        const expiredSessions = await ctx.db
            .query("authSessions")
            .filter((q) => q.lt(q.field("expirationTime"), now))
            .collect();

        // Find expired refresh tokens
        const expiredTokens = await ctx.db
            .query("authRefreshTokens")
            .filter((q) => q.lt(q.field("expirationTime"), now))
            .collect();

        // Delete expired sessions
        for (const session of expiredSessions) {
            await ctx.db.delete(session._id);
        }

        // Delete expired tokens
        for (const token of expiredTokens) {
            await ctx.db.delete(token._id);
        }

        // Log the cleanup
        console.log(`Session cleanup completed: ${expiredSessions.length} expired sessions, ${expiredTokens.length} expired tokens`);

        console.log(`Cleaned up ${expiredSessions.length} expired sessions and ${expiredTokens.length} expired tokens`);

        return {
            success: true,
            expiredSessions: expiredSessions.length,
            expiredTokens: expiredTokens.length,
            timestamp: now,
        };
    },
});