# Claude Code `/reqs` Command Specification

## Command Overview

Generate comprehensive requirements documentation for feature: $ARGUMENTS.
Follow these steps:
1. Parse the feature description from $ARGUMENTS
2. Create a kebab-case folder name from the feature description
3. Ensure the directory `.claude/specs/[feature-name]/` exists
4. Generate a structured requirements document following the template below
5. Write the document to `.claude/specs/[feature-name]/requirements.md`
6. Confirm successful creation of the requirements file

## Command Syntax

```bash
/reqs <args>
```

Where `<args>` is the feature description or bug fix request passed as $ARGUMENTS.

### Examples:
```bash
/reqs add user profile editing with avatar upload
/reqs implement magic link authentication for passwordless login
/reqs fix bug where notifications don't appear on mobile devices
```

## Processing Steps

When executing `/reqs`, process the request as follows:

1. **Extract Feature Description**: Parse $ARGUMENTS to understand the requested feature or bug fix
2. **Generate Folder Name**: 
   - Convert $ARGUMENTS to kebab-case
   - Remove action words (add, implement, fix, create)
   - Focus on the core feature name
3. **Create Directory Structure**: 
   ```bash
   mkdir -p .claude/specs/[feature-name]
   ```
4. **Generate Requirements Document**: Create comprehensive requirements based on $ARGUMENTS
5. **Write to File**: 
   ```bash
   .claude/specs/[feature-name]/requirements.md
   ```
6. **Validate**: Ensure the file was created successfully and contains all required sections

## Requirements Document Structure

### 1. Introduction Section
- **Purpose**: Provide a high-level overview of the feature
- **Content**: 
  - Brief description of what the feature does
  - Technology stack and dependencies involved
  - Key benefits or problems solved
  - Any important context about implementation approach

### 2. Requirements Section
Each requirement follows this pattern:

```markdown
### Requirement [Number]

**User Story:** As a [user type], I want to [action/goal], so that [benefit/value].

#### Acceptance Criteria

1. WHEN [condition/action] THEN the system SHALL [expected behavior]
2. WHEN [condition/action] THEN the system SHALL [expected behavior]
3. ...
```

## Key Principles for Requirements Generation

### 1. User Story Format
- Always use the standard format: "As a... I want to... so that..."
- Include both end-user and developer perspectives where relevant
- Focus on value delivered, not implementation details

### 2. Acceptance Criteria Guidelines
- Use WHEN/THEN format for clarity and testability
- Use "SHALL" for mandatory requirements (not "should" or "will")
- Make criteria specific and measurable
- Include edge cases and error scenarios
- Ensure criteria are independently testable

### 3. Requirement Categories to Consider
- **Authentication & Authorization**: User access, permissions, session management
- **User Interface**: Visual states, interactions, responsive behavior
- **Data Management**: CRUD operations, validation, persistence
- **Integration**: API connections, third-party services, data exchange
- **Performance**: Loading times, scalability, resource usage
- **Security**: Data protection, input validation, secure communication
- **Error Handling**: User feedback, recovery mechanisms, logging
- **Development Experience**: Type safety, documentation, configuration

### 4. Naming Conventions
- Feature folder name: kebab-case (e.g., `magic-link-auth`, `user-profile-update`)
- Keep names descriptive but concise
- Avoid abbreviations unless widely understood

## Example Command Usage

### Example 1: New Feature
```bash
/reqs add user profile editing with avatar upload
```

**Generated Location:**
```
.claude/specs/user-profile-editing/requirements.md
```

### Example 2: Bug Fix
```bash
/reqs fix bug where notifications don't appear on mobile devices
```

**Generated Location:**
```
.claude/specs/mobile-notification-fix/requirements.md
```

### Example 3: Integration Feature
```bash
/reqs integrate Stripe payment processing for subscription billing
```

**Generated Location:**
```
.claude/specs/stripe-payment-integration/requirements.md
```

## Requirements Quality Checklist

When generating requirements, ensure:

1. **Completeness**: Cover all aspects of the feature (UI, backend, data, security)
2. **Clarity**: No ambiguous language; specific and measurable criteria
3. **Testability**: Each criterion can be verified through testing
4. **Independence**: Requirements don't overlap or contradict
5. **Prioritization**: Critical path requirements come first
6. **Technical Feasibility**: Requirements are achievable with stated tech stack

## Special Considerations

### For Bug Fixes:
- Include current behavior vs expected behavior
- Add regression prevention criteria
- Consider related areas that might be affected

### For New Features:
- Include MVP scope clearly defined
- Consider future extensibility in design
- Add migration or upgrade path if modifying existing functionality

### For Integration Features:
- Specify external dependencies clearly
- Include fallback behavior for service failures
- Define data synchronization requirements

## Command Processing Logic

Parse and generate requirements for: $ARGUMENTS

1. **Parse $ARGUMENTS**: Extract the feature description from the command arguments
2. **Determine Type**: Identify if $ARGUMENTS describes a new feature, bug fix, or enhancement
3. **Generate Feature Name**: Convert $ARGUMENTS to kebab-case folder name
   - Remove common action words (add, implement, fix, create, update)
   - Focus on the core feature/component name
   - Ensure valid directory naming conventions
4. **Create Directory**: Ensure `.claude/specs/[feature-name]/` exists
5. **Generate Document**: Create `requirements.md` with structured content based on $ARGUMENTS
6. **Infer Context**: From $ARGUMENTS, determine:
   - User types affected
   - Technical components involved
   - Scope of changes required

## Error Handling

If $ARGUMENTS is unclear or insufficient:
1. Identify what information is missing (users, functionality, scope)
2. Generate requirements with placeholders for unclear sections
3. Add TODO comments highlighting areas needing clarification
4. Include suggestions for breaking complex features into phases
5. Still create the file, but note areas requiring refinement

Example:
```bash
# If command is: /reqs user management
# Generate file with sections marked:
# TODO: Clarify specific user management features (CRUD, roles, permissions?)
# TODO: Define user types (admin, regular user, guest?)
```

## Best Practices Integration

Following Claude Code best practices:
- Generate complete, ready-to-use documentation
- Include all necessary context in the introduction
- Make requirements specific enough for immediate implementation
- Consider the full development lifecycle (dev, test, deploy)
- Ensure consistency with existing project patterns