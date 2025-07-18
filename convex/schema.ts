import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// Define the schema with Convex Auth tables
// authTables includes: users, authSessions, authAccounts, authRefreshTokens, authVerificationCodes
// The users table from authTables includes standard authentication fields like:
// - name, email, image, emailVerified, phone, phoneVerified, isAnonymous
// and has proper indexes for user lookups including email index
const schema = defineSchema({
    // Import Convex Auth database tables which includes a pre-configured users table
    ...authTables,

    // Rate limiting table for security measures
    rateLimitEntries: defineTable({
        email: v.string(),
        timestamp: v.number(),
        type: v.string(), // "magic_link_request", "sign_in_attempt", etc.
        ipAddress: v.string(),
        userAgent: v.string(),
        metadata: v.optional(v.object({
            requestId: v.string(),
            windowStart: v.number(),
            additionalInfo: v.optional(v.any()),
        })),
    })
        .index("by_email_timestamp", ["email", "timestamp"])
        .index("by_timestamp", ["timestamp"])
        .index("by_type_timestamp", ["type", "timestamp"]),

    // Security audit log table
    securityAuditLog: defineTable({
        userId: v.optional(v.id("users")),
        email: v.optional(v.string()),
        action: v.string(), // "sign_in", "sign_out", "magic_link_sent", "session_expired", etc.
        timestamp: v.number(),
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        success: v.boolean(),
        errorMessage: v.optional(v.string()),
        metadata: v.optional(v.object({
            sessionId: v.optional(v.string()),
            tokenId: v.optional(v.string()),
            additionalInfo: v.optional(v.any()),
        })),
    })
        .index("by_userId_timestamp", ["userId", "timestamp"])
        .index("by_email_timestamp", ["email", "timestamp"])
        .index("by_action_timestamp", ["action", "timestamp"])
        .index("by_timestamp", ["timestamp"]),

    // Token usage tracking for security
    tokenUsageLog: defineTable({
        tokenId: v.string(),
        email: v.string(),
        action: v.string(), // "magic_link_verify", "password_reset", etc.
        createdAt: v.number(),
        attempts: v.number(),
        lastAttempt: v.number(),
        isUsed: v.boolean(),
        usedAt: v.optional(v.number()),
        ipAddress: v.string(),
        userAgent: v.string(),
        metadata: v.optional(v.object({
            firstSeen: v.number(),
            additionalInfo: v.optional(v.any()),
        })),
    })
        .index("by_tokenId", ["tokenId"])
        .index("by_email", ["email"])
        .index("by_createdAt", ["createdAt"])
        .index("by_isUsed", ["isUsed"]),

    // Token blacklist for security
    tokenBlacklist: defineTable({
        tokenId: v.string(),
        email: v.string(),
        reason: v.string(), // "max_attempts_exceeded", "security_violation", etc.
        blacklistedAt: v.number(),
        expiresAt: v.number(),
        metadata: v.optional(v.object({
            attempts: v.optional(v.number()),
            action: v.optional(v.string()),
            additionalInfo: v.optional(v.any()),
        })),
    })
        .index("by_tokenId", ["tokenId"])
        .index("by_email", ["email"])
        .index("by_expiresAt", ["expiresAt"])
        .index("by_blacklistedAt", ["blacklistedAt"]),
});

export default schema;