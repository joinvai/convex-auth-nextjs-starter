import { defineSchema } from "convex/server";
import { authTables } from "@convex-dev/auth/server";

// Define the schema with Convex Auth tables
// authTables includes: users, authSessions, authAccounts, authRefreshTokens, authVerificationCodes
// The users table from authTables includes standard authentication fields like:
// - name, email, image, emailVerified, phone, phoneVerified, isAnonymous
// and has proper indexes for user lookups including email index
const schema = defineSchema({
    // Import Convex Auth database tables which includes a pre-configured users table
    ...authTables,
});

export default schema;