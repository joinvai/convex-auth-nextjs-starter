import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Token security configuration
const TOKEN_SECURITY_CONFIG = {
    // Magic link token expiration (15 minutes)
    MAGIC_LINK_EXPIRY: 15 * 60 * 1000,

    // Maximum token usage attempts
    MAX_TOKEN_ATTEMPTS: 3,

    // Token cleanup interval
    TOKEN_CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hour

    // Minimum token entropy (for validation)
    MIN_TOKEN_LENGTH: 32,

    // Token blacklist retention period
    BLACKLIST_RETENTION: 24 * 60 * 60 * 1000, // 24 hours
};

// Mutation to validate and track token usage
export const validateTokenSecurity = mutation({
    args: {
        tokenId: v.string(),
        email: v.string(),
        action: v.string(), // "magic_link_verify", "password_reset", etc.
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
    },
    handler: async (ctx, { tokenId, email, action, ipAddress, userAgent }) => {
        const now = Date.now();

        try {
            // Check if token is blacklisted
            const blacklistedToken = await ctx.db
                .query("tokenBlacklist")
                .withIndex("by_tokenId", (q) => q.eq("tokenId", tokenId))
                .first();

            if (blacklistedToken) {
                console.log(`Token validation failed: Token ${tokenId} is blacklisted for ${email}`);
                throw new Error("INVALID_TOKEN: This token has been invalidated for security reasons.");
            }

            // Check for existing token usage record
            let tokenUsage = await ctx.db
                .query("tokenUsageLog")
                .withIndex("by_tokenId", (q) => q.eq("tokenId", tokenId))
                .first();

            if (!tokenUsage) {
                // Create new token usage record
                const tokenUsageId = await ctx.db.insert("tokenUsageLog", {
                    tokenId,
                    email,
                    action,
                    createdAt: now,
                    attempts: 0,
                    lastAttempt: now,
                    isUsed: false,
                    ipAddress: ipAddress || "unknown",
                    userAgent: userAgent || "unknown",
                    metadata: {
                        firstSeen: now,
                    },
                });

                // Fetch the created record
                tokenUsage = await ctx.db.get(tokenUsageId);
                if (!tokenUsage) {
                    throw new Error("Failed to create token usage record");
                }
            }

            // Check if token has been used already
            if (tokenUsage.isUsed) {
                console.log(`Token reuse attempt: Token ${tokenId} already used for ${email}`);
                throw new Error("INVALID_TOKEN: This token has already been used.");
            }

            // Check attempt count
            if (tokenUsage.attempts >= TOKEN_SECURITY_CONFIG.MAX_TOKEN_ATTEMPTS) {
                // Blacklist the token
                await ctx.db.insert("tokenBlacklist", {
                    tokenId,
                    email,
                    reason: "max_attempts_exceeded",
                    blacklistedAt: now,
                    expiresAt: now + TOKEN_SECURITY_CONFIG.BLACKLIST_RETENTION,
                    metadata: {
                        attempts: tokenUsage.attempts,
                        action,
                    },
                });

                console.log(`Token blacklisted: Token ${tokenId} exceeded max attempts for ${email}`);
                throw new Error("INVALID_TOKEN: Too many attempts. Token has been invalidated for security.");
            }

            // Check token age (for magic links)
            if (action === "magic_link_verify") {
                const tokenAge = now - tokenUsage.createdAt;
                if (tokenAge > TOKEN_SECURITY_CONFIG.MAGIC_LINK_EXPIRY) {
                    console.log(`Token expired: Token ${tokenId} expired for ${email}, age: ${tokenAge}ms`);
                    throw new Error("EXPIRED_TOKEN: This magic link has expired. Please request a new one.");
                }
            }

            // Update attempt count
            await ctx.db.patch(tokenUsage._id, {
                attempts: tokenUsage.attempts + 1,
                lastAttempt: now,
            });

            // Log successful validation
            console.log(`Token validation success: Token ${tokenId} validated for ${email}, attempts: ${tokenUsage.attempts + 1}`);

            return {
                valid: true,
                tokenId,
                email,
                attempts: tokenUsage.attempts + 1,
                createdAt: tokenUsage.createdAt,
            };

        } catch (error) {
            // Log validation failure
            console.log(`Token validation error: ${error instanceof Error ? error.message : "Unknown error"} for token ${tokenId}, email ${email}`);
            throw error;
        }
    },
});

// Mutation to mark token as used
export const markTokenAsUsed = mutation({
    args: {
        tokenId: v.string(),
        email: v.string(),
    },
    handler: async (ctx, { tokenId, email }) => {
        const now = Date.now();

        // Find the token usage record
        const tokenUsage = await ctx.db
            .query("tokenUsageLog")
            .withIndex("by_tokenId", (q) => q.eq("tokenId", tokenId))
            .first();

        if (!tokenUsage) {
            throw new Error("Token usage record not found");
        }

        // Mark as used
        await ctx.db.patch(tokenUsage._id, {
            isUsed: true,
            usedAt: now,
            lastAttempt: now,
        });

        // Log token usage
        console.log(`Token used: Token ${tokenId} marked as used for ${email}, attempts: ${tokenUsage.attempts}`);

        return {
            success: true,
            tokenId,
            usedAt: now,
        };
    },
});

// Mutation to cleanup expired tokens and blacklist entries
export const cleanupTokenSecurity = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const cutoffTime = now - TOKEN_SECURITY_CONFIG.TOKEN_CLEANUP_INTERVAL;

        // Cleanup old token usage logs
        const oldTokenUsage = await ctx.db
            .query("tokenUsageLog")
            .withIndex("by_createdAt", (q) => q.lt("createdAt", cutoffTime))
            .collect();

        for (const usage of oldTokenUsage) {
            await ctx.db.delete(usage._id);
        }

        // Cleanup expired blacklist entries
        const expiredBlacklist = await ctx.db
            .query("tokenBlacklist")
            .withIndex("by_expiresAt", (q) => q.lt("expiresAt", now))
            .collect();

        for (const entry of expiredBlacklist) {
            await ctx.db.delete(entry._id);
        }

        // Log cleanup
        console.log(`Token security cleanup completed: ${oldTokenUsage.length} usage logs, ${expiredBlacklist.length} blacklist entries`);

        console.log(`Token security cleanup: ${oldTokenUsage.length} usage logs, ${expiredBlacklist.length} blacklist entries`);

        return {
            success: true,
            cleanedTokenUsage: oldTokenUsage.length,
            cleanedBlacklist: expiredBlacklist.length,
            timestamp: now,
        };
    },
});

// Query to get token security statistics
export const getTokenSecurityStats = query({
    args: {
        timeWindow: v.optional(v.number()),
    },
    handler: async (ctx, { timeWindow = 24 * 60 * 60 * 1000 }) => {
        const now = Date.now();
        const windowStart = now - timeWindow;

        // Get recent token usage
        const recentUsage = await ctx.db
            .query("tokenUsageLog")
            .withIndex("by_createdAt", (q) => q.gte("createdAt", windowStart))
            .collect();

        // Get current blacklist
        const currentBlacklist = await ctx.db
            .query("tokenBlacklist")
            .withIndex("by_expiresAt", (q) => q.gte("expiresAt", now))
            .collect();

        // Calculate statistics
        const stats = {
            totalTokens: recentUsage.length,
            usedTokens: recentUsage.filter(t => t.isUsed).length,
            expiredTokens: recentUsage.filter(t =>
                !t.isUsed && (now - t.createdAt) > TOKEN_SECURITY_CONFIG.MAGIC_LINK_EXPIRY
            ).length,
            blacklistedTokens: currentBlacklist.length,
            averageAttempts: recentUsage.length > 0
                ? recentUsage.reduce((sum, t) => sum + t.attempts, 0) / recentUsage.length
                : 0,
            timeWindow,
            config: TOKEN_SECURITY_CONFIG,
        };

        return stats;
    },
});

// Export configuration for use in other modules
export const tokenSecurityConfig = TOKEN_SECURITY_CONFIG;