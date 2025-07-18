import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
    // Magic link requests per email per time window
    MAGIC_LINK_REQUESTS_PER_EMAIL: 3,
    MAGIC_LINK_TIME_WINDOW: 15 * 60 * 1000, // 15 minutes in milliseconds

    // Global rate limiting per IP (if available)
    GLOBAL_REQUESTS_PER_IP: 10,
    GLOBAL_TIME_WINDOW: 5 * 60 * 1000, // 5 minutes in milliseconds

    // Cleanup old entries interval
    CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hour in milliseconds
};

// Query to check if email is rate limited
export const checkEmailRateLimit = query({
    args: { email: v.string() },
    handler: async (ctx, { email }) => {
        const now = Date.now();
        const windowStart = now - RATE_LIMIT_CONFIG.MAGIC_LINK_TIME_WINDOW;

        // Get recent requests for this email
        const recentRequests = await ctx.db
            .query("rateLimitEntries")
            .withIndex("by_email_timestamp", (q) =>
                q.eq("email", email).gte("timestamp", windowStart)
            )
            .collect();

        const requestCount = recentRequests.length;
        const isLimited = requestCount >= RATE_LIMIT_CONFIG.MAGIC_LINK_REQUESTS_PER_EMAIL;

        // Calculate when the user can make another request
        let nextAllowedTime = null;
        if (isLimited && recentRequests.length > 0) {
            const oldestRequest = recentRequests.reduce((oldest, current) =>
                current.timestamp < oldest.timestamp ? current : oldest
            );
            nextAllowedTime = oldestRequest.timestamp + RATE_LIMIT_CONFIG.MAGIC_LINK_TIME_WINDOW;
        }

        return {
            isLimited,
            requestCount,
            maxRequests: RATE_LIMIT_CONFIG.MAGIC_LINK_REQUESTS_PER_EMAIL,
            timeWindow: RATE_LIMIT_CONFIG.MAGIC_LINK_TIME_WINDOW,
            nextAllowedTime,
            remainingTime: nextAllowedTime ? Math.max(0, nextAllowedTime - now) : 0,
        };
    },
});

// Mutation to record a magic link request
export const recordMagicLinkRequest = mutation({
    args: {
        email: v.string(),
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
    },
    handler: async (ctx, { email, ipAddress, userAgent }) => {
        const now = Date.now();

        // Check rate limit before recording
        const rateLimitCheck = await ctx.db
            .query("rateLimitEntries")
            .withIndex("by_email_timestamp", (q) =>
                q.eq("email", email).gte("timestamp", now - RATE_LIMIT_CONFIG.MAGIC_LINK_TIME_WINDOW)
            )
            .collect();

        if (rateLimitCheck.length >= RATE_LIMIT_CONFIG.MAGIC_LINK_REQUESTS_PER_EMAIL) {
            const oldestRequest = rateLimitCheck.reduce((oldest: any, current: any) =>
                current.timestamp < oldest.timestamp ? current : oldest
            );
            const nextAllowedTime = oldestRequest.timestamp + RATE_LIMIT_CONFIG.MAGIC_LINK_TIME_WINDOW;
            const remainingTime = Math.max(0, nextAllowedTime - now);

            throw new Error(`RATE_LIMIT_EXCEEDED: Too many magic link requests. Please wait ${Math.ceil(remainingTime / 60000)} minutes before trying again.`);
        }

        // Record the request
        const entryId = await ctx.db.insert("rateLimitEntries", {
            email,
            timestamp: now,
            type: "magic_link_request",
            ipAddress: ipAddress || "unknown",
            userAgent: userAgent || "unknown",
            metadata: {
                requestId: crypto.randomUUID(),
                windowStart: now - RATE_LIMIT_CONFIG.MAGIC_LINK_TIME_WINDOW,
            },
        });

        return {
            success: true,
            entryId,
            requestCount: rateLimitCheck.length + 1,
            maxRequests: RATE_LIMIT_CONFIG.MAGIC_LINK_REQUESTS_PER_EMAIL,
        };
    },
});

// Mutation to cleanup old rate limit entries
export const cleanupRateLimitEntries = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const cutoffTime = now - (RATE_LIMIT_CONFIG.MAGIC_LINK_TIME_WINDOW * 2); // Keep entries for 2x the window

        // Find old entries to delete
        const oldEntries = await ctx.db
            .query("rateLimitEntries")
            .withIndex("by_timestamp", (q) => q.lt("timestamp", cutoffTime))
            .collect();

        // Delete old entries in batches
        const deletedCount = oldEntries.length;
        for (const entry of oldEntries) {
            await ctx.db.delete(entry._id);
        }

        return {
            success: true,
            deletedCount,
            cutoffTime,
        };
    },
});

// Query to get rate limit statistics (for monitoring)
export const getRateLimitStats = query({
    args: { email: v.optional(v.string()) },
    handler: async (ctx, { email }) => {
        const now = Date.now();
        const windowStart = now - RATE_LIMIT_CONFIG.MAGIC_LINK_TIME_WINDOW;

        if (email) {
            // Get stats for specific email
            const entries = await ctx.db
                .query("rateLimitEntries")
                .withIndex("by_email_timestamp", (q) =>
                    q.eq("email", email).gte("timestamp", windowStart)
                )
                .collect();

            return {
                email,
                requestCount: entries.length,
                maxRequests: RATE_LIMIT_CONFIG.MAGIC_LINK_REQUESTS_PER_EMAIL,
                isLimited: entries.length >= RATE_LIMIT_CONFIG.MAGIC_LINK_REQUESTS_PER_EMAIL,
                timeWindow: RATE_LIMIT_CONFIG.MAGIC_LINK_TIME_WINDOW,
                entries: entries.map(e => ({
                    timestamp: e.timestamp,
                    type: e.type,
                    ipAddress: e.ipAddress,
                })),
            };
        } else {
            // Get global stats
            const allEntries = await ctx.db
                .query("rateLimitEntries")
                .withIndex("by_timestamp", (q) => q.gte("timestamp", windowStart))
                .collect();

            const emailCounts = allEntries.reduce((acc, entry) => {
                acc[entry.email] = (acc[entry.email] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            return {
                totalRequests: allEntries.length,
                uniqueEmails: Object.keys(emailCounts).length,
                timeWindow: RATE_LIMIT_CONFIG.MAGIC_LINK_TIME_WINDOW,
                topEmails: Object.entries(emailCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10)
                    .map(([email, count]) => ({ email, count })),
            };
        }
    },
});

// Export configuration for use in other modules
export const rateLimitConfig = RATE_LIMIT_CONFIG;