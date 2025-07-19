# Claude Code `/tasks` Command Specification

## Command Overview

Generate detailed implementation tasks from requirements and design documents: $ARGUMENTS.
Follow these steps:
1. Parse the two file paths from $ARGUMENTS (requirements.md and design.md)
2. Read and analyze both documents to understand full scope
3. Generate granular, actionable tasks with clear dependencies
4. Create logical task groupings and implementation order
5. Map each task back to specific requirements
6. Write the tasks document to the same directory as `tasks.md`
7. Confirm successful creation of the tasks file

## Command Syntax

```bash
/tasks <path-to-requirements.md> <path-to-design.md>
```

Where both file paths are passed as space-separated $ARGUMENTS.

### Examples:
```bash
/tasks .claude/specs/magic-link-auth/requirements.md .claude/specs/magic-link-auth/design.md
/tasks .claude/specs/user-profile/requirements.md .claude/specs/user-profile/design.md
/tasks .claude/specs/retro-saas/requirements.md .claude/specs/retro-saas/design.md
```

## Processing Steps

When executing `/tasks`, process the request as follows:

1. **Parse Arguments**: Extract both file paths from $ARGUMENTS
2. **Read Documents**: Load requirements.md and design.md content
3. **Analyze Scope**: Map requirements to design components
4. **Generate Task Hierarchy**: Create logical task groupings
5. **Order Tasks**: Arrange by dependencies and implementation flow
6. **Add Requirement Mapping**: Link each task to requirements
7. **Write Tasks File**: Save as `tasks.md` in the same directory

## Tasks Document Structure

### Format Guidelines

```markdown
# Implementation Plan

- [ ] 1. Task group or major milestone
  - Brief description of what this accomplishes
  - Any important notes or dependencies
  - _Requirements: X.X, Y.Y_

- [ ] 1.1 Specific subtask with clear scope
  - Detailed action items
  - Technical implementation notes
  - Expected outcomes
  - _Requirements: X.X_

- [ ] 1.2 Another subtask
  - Implementation details
  - Testing considerations
  - _Requirements: Y.Y, Z.Z_
```

### Task Hierarchy Rules

1. **Top-Level Tasks**: Major milestones or feature groups (1, 2, 3...)
2. **Subtasks**: Specific implementation items (1.1, 1.2, 1.3...)
3. **Sub-subtasks**: Only when necessary for complex items (1.1.1, 1.1.2...)
4. **Checkbox Format**: All tasks use `- [ ]` for tracking
5. **Requirement Links**: Italic references at task end `_Requirements: X.X, Y.Y_`

## Task Generation Guidelines

### Task Granularity

Each task should be:
- **Actionable**: Clear what needs to be done
- **Measurable**: Has clear completion criteria
- **Time-Bounded**: Completable in 1-4 hours ideally
- **Independent**: Minimal blocking dependencies
- **Testable**: Includes testing as part of the task

### Task Ordering Strategy

1. **Foundation First**: Infrastructure, setup, configuration
2. **Core Features**: Essential functionality from requirements
3. **UI Components**: Reusable components before specific pages
4. **Integration**: Connect components and services
5. **Enhancement**: Polish, optimization, edge cases
6. **Testing & Docs**: Comprehensive testing and documentation

### Requirement Mapping

- Every requirement must have at least one task
- Tasks reference requirements by number (e.g., _Requirements: 1.2, 3.4_)
- Complex requirements may span multiple tasks
- Group related requirements in task descriptions

## Task Categories

### 1. Setup and Configuration Tasks
```markdown
- [ ] 1. Set up project infrastructure
  - Install dependencies and configure build tools
  - Set up environment variables and secrets
  - Configure development environment
  - _Requirements: X.X_
```

### 2. Backend/API Tasks
```markdown
- [ ] 2. Implement backend services
- [ ] 2.1 Create database schema and models
  - Define data models from design document
  - Set up database migrations
  - Create seed data for development
  - _Requirements: X.X_
```

### 3. Frontend Component Tasks
```markdown
- [ ] 3. Build UI component library
- [ ] 3.1 Create base Button component
  - Implement component with all variants
  - Add proper TypeScript interfaces
  - Write unit tests for interactions
  - Create Storybook documentation
  - _Requirements: X.X_
```

### 4. Feature Implementation Tasks
```markdown
- [ ] 4. Implement [Feature Name]
- [ ] 4.1 Build feature UI components
  - Create main feature component
  - Implement user interactions
  - Add loading and error states
  - _Requirements: X.X_

- [ ] 4.2 Connect to backend services
  - Implement API calls
  - Add state management
  - Handle errors gracefully
  - _Requirements: X.X_
```

### 5. Integration Tasks
```markdown
- [ ] 5. Integrate third-party services
- [ ] 5.1 Configure [Service Name]
  - Set up API credentials
  - Implement service client
  - Add error handling and retries
  - Write integration tests
  - _Requirements: X.X_
```

### 6. Testing Tasks
```markdown
- [ ] 6. Implement comprehensive testing
- [ ] 6.1 Write unit tests for components
  - Test component rendering
  - Test user interactions
  - Test edge cases
  - Achieve 80% coverage
  - _Requirements: X.X_
```

### 7. Documentation Tasks
```markdown
- [ ] 7. Create project documentation
- [ ] 7.1 Write setup documentation
  - Create detailed README
  - Document environment setup
  - Add troubleshooting guide
  - _Requirements: X.X_
```

## Task Description Best Practices

### Clear Action Items
Each task should specify:
- **What**: The specific implementation
- **How**: Technical approach if not obvious
- **Validation**: How to verify completion
- **Dependencies**: What must be done first

### Technical Details
Include when relevant:
- Specific files or components to modify
- API endpoints or database tables
- Third-party libraries or services
- Configuration requirements

### Testing Requirements
Each implementation task should consider:
- Unit tests needed
- Integration test scenarios
- Manual testing steps
- Performance considerations

## Example Task Patterns

### Component Creation Pattern
```markdown
- [ ] X.X Implement [Component] component
  - Create component file with TypeScript interfaces
  - Implement all props and variants from design
  - Add proper event handlers and callbacks
  - Write comprehensive unit tests
  - Create Storybook stories for all states
  - Ensure accessibility compliance
  - _Requirements: X.X, Y.Y_
```

### API Integration Pattern
```markdown
- [ ] X.X Integrate [Service] API
  - Create service client with proper types
  - Implement authentication if required
  - Add request/response interceptors
  - Implement retry logic for failures
  - Create mock for testing
  - Write integration tests
  - _Requirements: X.X_
```

### Feature Flow Pattern
```markdown
- [ ] X.X Implement [Feature] user flow
  - Build UI components for each step
  - Add form validation and error handling
  - Implement state management
  - Connect to backend services
  - Add loading and success states
  - Test complete flow end-to-end
  - _Requirements: X.X, Y.Y, Z.Z_
```

## Special Considerations

### For Authentication Features
- Separate setup, UI, and flow tasks
- Include security testing tasks
- Add session management tasks

### For UI-Heavy Features
- Component library tasks first
- Then page-specific implementations
- Include responsive design tasks

### For Data Features
- Schema/model tasks first
- Then CRUD operations
- Include data validation tasks

### For Integration Features
- Configuration tasks first
- Then implementation
- Include fallback handling tasks

## Error Handling

If $ARGUMENTS are invalid:
1. Verify both file paths are provided
2. Check both files exist and are readable
3. Ensure they are requirements.md and design.md
4. Provide clear error with correct usage

If documents are mismatched:
1. Note any requirements without design coverage
2. Flag any design elements without requirements
3. Generate tasks with warnings for gaps
4. Include TODO tasks for clarification

## Quality Checklist

Ensure generated tasks:

1. **Complete Coverage**: All requirements have tasks
2. **Logical Order**: Dependencies are respected
3. **Clear Scope**: Each task is well-defined
4. **Proper Sizing**: Tasks are appropriately granular
5. **Testing Included**: Test tasks for all features
6. **Documentation**: Setup and usage docs included

## Best Practices Integration

Following Claude Code best practices:
- Generate immediately actionable tasks
- Include all technical details needed
- Order tasks for efficient implementation
- Map clearly to requirements
- Consider the full development workflow
- Make tasks trackable and measurable