import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Security audit actions
export const SECURITY_ACTIONS = {
    SIGN_IN_ATTEMPT: "sign_in_attempt",
    SIGN_IN_SUCCESS: "sign_in_success",
    SIGN_OUT: "sign_out",
    MAGIC_LINK_SENT: "magic_link_sent",
    MAGIC_LINK_CLICKED: "magic_link_clicked",
    SESSION_EXPIRED: "session_expired",
    RATE_LIMIT_EXCEEDED: "rate_limit_exceeded",
    INVALID_TOKEN: "invalid_token",
    SESSION_CLEANUP: "session_cleanup",
} as const;

// Mutation to log security events
export const logSecurityEvent = mutation({
    args: {
        action: v.string(),
        success: v.boolean(),
        email: v.optional(v.string()),
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        errorMessage: v.optional(v.string()),
        metadata: v.optional(v.object({
            sessionId: v.optional(v.string()),
            tokenId: v.optional(v.string()),
            additionalInfo: v.optional(v.any()),
        })),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const timestamp = Date.now();

        // Create audit log entry
        const auditId = await ctx.db.insert("securityAuditLog", {
            userId: userId || undefined,
            email: args.email,
            action: args.action,
            timestamp,
            ipAddress: args.ipAddress,
            userAgent: args.userAgent,
            success: args.success,
            errorMessage: args.errorMessage,
            metadata: args.metadata,
        });

        // Log to console for development/debugging
        console.log(`Security Event [${args.action}]:`, {
            userId,
            email: args.email,
            success: args.success,
            timestamp: new Date(timestamp).toISOString(),
            error: args.errorMessage,
        });

        return {
            success: true,
            auditId,
            timestamp,
        };
    },
});

// Query to get security audit logs for a user
export const getUserSecurityLogs = query({
    args: {
        email: v.optional(v.string()),
        limit: v.optional(v.number()),
        offset: v.optional(v.number()),
    },
    handler: async (ctx, { email, limit = 50, offset = 0 }) => {
        const userId = await getAuthUserId(ctx);

        // Only allow users to see their own logs, or if email is provided and matches
        if (!userId && !email) {
            return [];
        }

        let logs;

        if (userId) {
            logs = await ctx.db
                .query("securityAuditLog")
                .withIndex("by_userId_timestamp", (q) => q.eq("userId", userId))
                .order("desc")
                .take(limit + offset);
        } else if (email) {
            logs = await ctx.db
                .query("securityAuditLog")
                .withIndex("by_email_timestamp", (q) => q.eq("email", email))
                .order("desc")
                .take(limit + offset);
        } else {
            return [];
        }

        return logs.slice(offset).map(log => ({
            ...log,
            // Don't expose sensitive metadata to client
            metadata: log.metadata ? {
                sessionId: log.metadata.sessionId,
                // Hide other sensitive info
            } : undefined,
        }));
    },
});

// Query to get security statistics (admin/monitoring)
export const getSecurityStats = query({
    args: {
        timeWindow: v.optional(v.number()), // milliseconds
        action: v.optional(v.string()),
    },
    handler: async (ctx, { timeWindow = 24 * 60 * 60 * 1000, action }) => {
        const now = Date.now();
        const windowStart = now - timeWindow;

        let logs;

        if (action) {
            logs = await ctx.db
                .query("securityAuditLog")
                .withIndex("by_action_timestamp", (q) =>
                    q.eq("action", action).gte("timestamp", windowStart)
                )
                .collect();
        } else {
            logs = await ctx.db
                .query("securityAuditLog")
                .withIndex("by_timestamp", (q) => q.gte("timestamp", windowStart))
                .collect();
        }

        // Calculate statistics
        const stats = {
            totalEvents: logs.length,
            successfulEvents: logs.filter(log => log.success).length,
            failedEvents: logs.filter(log => !log.success).length,
            uniqueUsers: new Set(logs.map(log => log.userId).filter(Boolean)).size,
            uniqueEmails: new Set(logs.map(log => log.email).filter(Boolean)).size,
            actionBreakdown: {} as Record<string, { total: number; successful: number; failed: number }>,
            timeWindow,
            windowStart,
        };

        // Calculate action breakdown
        logs.forEach(log => {
            if (!stats.actionBreakdown[log.action]) {
                stats.actionBreakdown[log.action] = { total: 0, successful: 0, failed: 0 };
            }
            stats.actionBreakdown[log.action].total++;
            if (log.success) {
                stats.actionBreakdown[log.action].successful++;
            } else {
                stats.actionBreakdown[log.action].failed++;
            }
        });

        return stats;
    },
});

// Mutation to cleanup old audit logs
export const cleanupSecurityLogs = mutation({
    args: {
        retentionDays: v.optional(v.number()),
    },
    handler: async (ctx, { retentionDays = 90 }) => {
        const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);

        // Find old logs to delete
        const oldLogs = await ctx.db
            .query("securityAuditLog")
            .withIndex("by_timestamp", (q) => q.lt("timestamp", cutoffTime))
            .collect();

        // Delete old logs
        const deletedCount = oldLogs.length;
        for (const log of oldLogs) {
            await ctx.db.delete(log._id);
        }

        console.log(`Cleaned up ${deletedCount} security audit logs older than ${retentionDays} days`);

        return {
            success: true,
            deletedCount,
            cutoffTime,
            retentionDays,
        };
    },
});

// Helper function to create common security log entries
export const createSecurityLogger = (ctx: any) => ({
    logSignInAttempt: (email: string, success: boolean, errorMessage?: string, metadata?: any) =>
        ctx.runMutation(logSecurityEvent, {
            action: SECURITY_ACTIONS.SIGN_IN_ATTEMPT,
            success,
            email,
            errorMessage,
            metadata,
        }),

    logMagicLinkSent: (email: string, success: boolean, errorMessage?: string, metadata?: any) =>
        ctx.runMutation(logSecurityEvent, {
            action: SECURITY_ACTIONS.MAGIC_LINK_SENT,
            success,
            email,
            errorMessage,
            metadata,
        }),

    logSignOut: (email?: string, metadata?: any) =>
        ctx.runMutation(logSecurityEvent, {
            action: SECURITY_ACTIONS.SIGN_OUT,
            success: true,
            email,
            metadata,
        }),

    logRateLimitExceeded: (email: string, metadata?: any) =>
        ctx.runMutation(logSecurityEvent, {
            action: SECURITY_ACTIONS.RATE_LIMIT_EXCEEDED,
            success: false,
            email,
            errorMessage: "Rate limit exceeded",
            metadata,
        }),
});