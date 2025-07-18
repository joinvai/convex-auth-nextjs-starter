# Requirements Document

## Introduction

This feature implements a complete authentication system for the ShipOrSkip application using Convex as the backend database and Convex Auth with magic link authentication. This includes setting up Convex from scratch, configuring the database schema, implementing magic link authentication, and creating a complete user interface. Magic links provide a passwordless authentication experience where users receive a secure link via email to sign in, eliminating the need to remember passwords while maintaining security.

## Requirements

### Requirement 1

**User Story:** As a user, I want to sign in using my email address without needing to create or remember a password, so that I can quickly access the application.

#### Acceptance Criteria

1. WHEN a user enters their email address and clicks "Send sign-in link" THEN the system SHALL send a magic link to their email address
2. WHEN a user clicks the magic link in their email THEN the system SHALL authenticate them and redirect them to the application
3. WHEN a user is successfully authenticated THEN the system SHALL maintain their session across browser refreshes
4. WHEN a user signs out THEN the system SHALL clear their authentication session

### Requirement 2

**User Story:** As a user, I want to see different content based on whether I'm signed in or not, so that I have a personalized experience.

#### Acceptance Criteria

1. WHEN a user is not authenticated THEN the system SHALL display a sign-in form
2. WHEN a user is authenticated THEN the system SHALL display authenticated content with their user information
3. WHEN the authentication state is loading THEN the system SHALL display a loading indicator
4. WHEN a user clicks sign out THEN the system SHALL immediately update the UI to show the unauthenticated state

### Requirement 3

**User Story:** As a developer, I want the authentication system to be properly configured with Convex backend, so that user sessions are securely managed.

#### Acceptance Criteria

1. WHEN the application starts THEN the system SHALL initialize Convex Auth with proper configuration
2. WHEN a user authenticates THEN the system SHALL store their session in the Convex database
3. WHEN making authenticated requests to Convex THEN the system SHALL include the proper authentication token
4. WHEN environment variables are missing THEN the system SHALL provide clear error messages

### Requirement 4

**User Story:** As a user, I want magic links to be secure and expire appropriately, so that my account remains protected.

#### Acceptance Criteria

1. WHEN a magic link is generated THEN the system SHALL create a unique, time-limited token
2. WHEN a magic link is used THEN the system SHALL invalidate it to prevent reuse
3. WHEN a magic link expires THEN the system SHALL reject authentication attempts with an appropriate error message
4. WHEN multiple magic links are requested THEN the system SHALL handle them appropriately without conflicts

### Requirement 5

**User Story:** As a user, I want to receive properly formatted magic link emails, so that I can easily understand how to sign in.

#### Acceptance Criteria

1. WHEN a magic link email is sent THEN the system SHALL include a clear subject line indicating it's for sign-in
2. WHEN a magic link email is sent THEN the system SHALL include the magic link with clear instructions
3. WHEN a magic link email is sent THEN the system SHALL use a professional sender address
4. WHEN email sending fails THEN the system SHALL display an appropriate error message to the user

### Requirement 6

**User Story:** As a developer, I want Convex to be properly set up and configured, so that the application has a working backend database.

#### Acceptance Criteria

1. WHEN the project is initialized THEN the system SHALL install all required Convex dependencies
2. WHEN Convex is set up THEN the system SHALL create a development deployment and configure environment variables
3. WHEN the database schema is defined THEN the system SHALL include authentication tables and user tables
4. WHEN the Convex client is configured THEN the system SHALL be properly integrated with the Next.js application

### Requirement 7

**User Story:** As a developer, I want the email provider to be properly configured, so that magic links can be sent to users.

#### Acceptance Criteria

1. WHEN the email provider is configured THEN the system SHALL use Resend as the email service
2. WHEN environment variables are set THEN the system SHALL include the Resend API key and site URL
3. WHEN the email provider is initialized THEN the system SHALL be properly integrated with Convex Auth
4. WHEN email configuration is invalid THEN the system SHALL provide clear error messages

### Requirement 8

**User Story:** As a developer, I want the application to have proper TypeScript configuration, so that development is type-safe and efficient.

#### Acceptance Criteria

1. WHEN TypeScript is configured THEN the system SHALL include proper module resolution settings
2. WHEN Convex types are generated THEN the system SHALL provide full type safety for database operations
3. WHEN authentication types are configured THEN the system SHALL provide type safety for auth operations
4. WHEN build processes run THEN the system SHALL compile without type errors