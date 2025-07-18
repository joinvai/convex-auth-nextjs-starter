# Design Document

## Overview

This design document outlines the comprehensive SaaS starter template that transforms the existing Convex auth project into a pixel-perfect homage to Susan Kare's iconic 1984 Macintosh design language. The template will feature bitmap typography, geometric iconography, and the distinctive visual patterns that defined early personal computing, while delivering modern SaaS functionality with Don Draper-caliber copywriting that sells transformation and success.

## Architecture

### Design System Foundation

The template follows Susan Kare's design principles with a modern React/Next.js implementation:

- **Pixel-Perfect Grid System**: 8px base unit grid matching original Mac interface spacing
- **Bitmap Typography**: Custom web fonts that replicate Chicago, Geneva, and Monaco typefaces
- **Geometric Iconography**: SVG icons designed on 16x16 and 32x32 pixel grids with clean geometric shapes
- **Monochromatic Base**: Black and white foundation with selective use of classic Mac colors (blue highlights, system grays)

### Technical Stack

- **Frontend**: Next.js 14 with App Router for modern React patterns
- **Styling**: Tailwind CSS with custom configuration for retro design tokens
- **Authentication**: Existing Convex auth system with enhanced retro UI
- **Database**: Convex for real-time data and blog content management
- **Deployment**: Vercel-optimized with edge functions for performance

### Component Architecture

```
components/
├── ui/                    # Base UI components (Susan Kare style)
│   ├── button.tsx        # Classic Mac button with pixel borders
│   ├── dialog.tsx        # System dialog boxes
│   ├── input.tsx         # Terminal-style inputs
│   └── typography.tsx    # Bitmap font components
├── layout/               # Layout components
│   ├── header.tsx        # Mac menu bar style navigation
│   ├── footer.tsx        # Retro footer with pixel art
│   └── sidebar.tsx       # Finder-style navigation
├── sections/             # Page sections
│   ├── hero.tsx          # Pixelated hero with CRT effects
│   ├── features.tsx      # Icon grid with Susan Kare iconography
│   └── testimonials.tsx  # Terminal-style quote boxes
└── dashboard/            # Dashboard-specific components
    ├── metrics.tsx       # Vintage computer readout style
    ├── navigation.tsx    # Classic Mac Finder sidebar
    └── widgets.tsx       # Retro dashboard widgets
```

## Components and Interfaces

### Design Token System

```typescript
// Retro color palette inspired by original Mac
const colors = {
  // Monochromatic base
  black: '#000000',
  white: '#FFFFFF',
  gray: {
    100: '#F5F5F5', // Light gray backgrounds
    200: '#E5E5E5', // Borders and dividers
    300: '#CCCCCC', // Disabled states
    400: '#999999', // Secondary text
    500: '#666666', // Primary text on light
    600: '#333333', // Dark backgrounds
  },
  // Classic Mac accent colors
  blue: '#0066CC',    // System blue for links and highlights
  green: '#00AA00',   // Success states
  red: '#DD0000',     // Error states
  yellow: '#FFDD00',  // Warning states
}

// Typography scale based on bitmap fonts
const typography = {
  fonts: {
    chicago: ['Chicago', 'monospace'],    // Headers and UI labels
    geneva: ['Geneva', 'sans-serif'],     // Body text
    monaco: ['Monaco', 'monospace'],      // Code and terminal
  },
  sizes: {
    xs: '9px',   // Small UI text
    sm: '10px',  // Default UI text
    base: '12px', // Body text
    lg: '14px',   // Subheadings
    xl: '18px',   // Headings
    '2xl': '24px', // Large headings
  }
}

// Spacing based on 8px grid
const spacing = {
  px: '1px',
  0.5: '2px',
  1: '4px',
  2: '8px',    // Base unit
  3: '12px',
  4: '16px',   // Standard spacing
  6: '24px',
  8: '32px',   // Large spacing
  12: '48px',
  16: '64px',
}
```

### Core UI Components

#### RetroButton Component
```typescript
interface RetroButtonProps {
  variant: 'primary' | 'secondary' | 'system'
  size: 'sm' | 'md' | 'lg'
  pixelated?: boolean
  children: React.ReactNode
}

// Features:
// - 3D pixel border effect
// - Classic Mac button styling
// - Hover states with pixel-perfect animations
// - System dialog button variants
```

#### PixelIcon Component
```typescript
interface PixelIconProps {
  name: string
  size: 16 | 32 | 48
  variant: 'outline' | 'filled'
}

// Features:
// - Susan Kare-inspired iconography
// - Geometric shapes on pixel grid
// - Scalable SVG with crisp edges
// - Consistent visual language
```

#### TerminalBox Component
```typescript
interface TerminalBoxProps {
  title?: string
  bordered?: boolean
  children: React.ReactNode
}

// Features:
// - Classic terminal styling
// - Monospace typography
// - Pixelated borders
// - Scrollable content areas
```

### Page Layouts

#### Landing Page Design

**Hero Section**:
- Large pixelated logo/wordmark
- Don Draper-style headline: "The Future of Business. Pixel Perfect."
- Retro CRT monitor frame containing product demo
- Classic Mac-style call-to-action buttons

**Features Grid**:
- 3x3 grid of features with Susan Kare-style icons
- Each feature in a bordered box with pixel art illustration
- Monospace headings with persuasive copy
- Hover effects with classic Mac selection highlighting

**Testimonials**:
- Terminal-style quote boxes
- Pixelated customer avatars
- Company logos in retro bitmap style
- Scrolling testimonial carousel with Mac-style navigation

#### Pricing Page Design

**Pricing Tiers**:
- Three columns styled as classic Mac windows
- Pixelated borders and title bars
- Feature lists with checkmark icons
- Vintage toggle for monthly/annual billing

**Payment Flow**:
- Modal dialogs matching system dialog design
- Form inputs with terminal styling
- Progress indicators using classic Mac patterns
- Success/error states with appropriate iconography

#### Dashboard Design

**Navigation Sidebar**:
- Finder-style file browser layout
- Hierarchical navigation with folder icons
- Pixel-perfect dividers and spacing
- Active state highlighting

**Main Content Area**:
- Window-style content panels
- Metrics displayed as vintage computer readouts
- Data tables with monospace fonts
- Charts and graphs with retro styling

## Data Models

### Blog System Schema

```typescript
// Blog post structure for Convex
interface BlogPost {
  _id: Id<"blogPosts">
  title: string
  slug: string
  excerpt: string
  content: string // Markdown content
  author: {
    name: string
    avatar?: string
  }
  category: Id<"blogCategories">
  tags: string[]
  publishedAt: number
  updatedAt: number
  featured: boolean
  seoTitle?: string
  seoDescription?: string
}

interface BlogCategory {
  _id: Id<"blogCategories">
  name: string
  slug: string
  description: string
  icon: string // Susan Kare-style icon name
  color: string
}
```

### User Profile Extensions

```typescript
// Extended user profile for SaaS features
interface UserProfile {
  _id: Id<"users">
  email: string
  name?: string
  avatar?: string
  plan: 'free' | 'pro' | 'enterprise'
  subscription?: {
    id: string
    status: string
    currentPeriodEnd: number
  }
  preferences: {
    theme: 'classic' | 'dark'
    notifications: boolean
  }
  createdAt: number
  lastActiveAt: number
}
```

## Error Handling

### Retro Error States

All error handling follows classic Mac system dialog patterns:

- **System Errors**: Modal dialogs with bomb icon and technical details
- **Form Validation**: Inline errors with pixelated warning icons
- **Network Issues**: Terminal-style connection status indicators
- **404 Pages**: "File Not Found" with classic Mac folder icon

### Loading States

- **Page Transitions**: Classic Mac "loading" cursor animation
- **Data Fetching**: Terminal-style progress bars
- **Form Submissions**: System dialog with progress indicator
- **Image Loading**: Pixelated placeholder patterns

## Testing Strategy

### Visual Regression Testing

- **Pixel-Perfect Verification**: Automated screenshot comparison for UI consistency
- **Cross-Browser Testing**: Ensure retro styling renders correctly across browsers
- **Responsive Design**: Test retro aesthetic at all breakpoints
- **Icon Rendering**: Verify Susan Kare-style icons display crisply

### Component Testing

- **UI Component Library**: Storybook with retro theme for component documentation
- **Interaction Testing**: Verify classic Mac-style hover and click states
- **Accessibility**: Ensure retro design meets modern accessibility standards
- **Performance**: Test that vintage styling doesn't impact Core Web Vitals

### Integration Testing

- **Authentication Flow**: Test magic link flow with retro UI
- **Blog System**: Verify content management and display
- **Dashboard Features**: Test all stubbed SaaS functionality
- **SEO Implementation**: Validate meta tags and structured data

## SEO and Performance Optimization

### Retro-Themed SEO

- **Meta Tags**: Vintage computing themed descriptions and titles
- **Open Graph Images**: Pixel art social media previews
- **Structured Data**: Schema markup for blog and business information
- **URL Structure**: Clean, semantic URLs matching retro aesthetic

### Performance Considerations

- **Font Loading**: Optimize custom bitmap font delivery
- **Icon Optimization**: SVG sprites for Susan Kare-style iconography
- **Image Optimization**: Retro-styled images with modern compression
- **Code Splitting**: Lazy load dashboard components for better initial load

## Deployment and Configuration

### Environment Setup

```bash
# Required environment variables
CONVEX_DEPLOYMENT=your-convex-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-convex-url
RESEND_API_KEY=your-resend-key
STRIPE_SECRET_KEY=your-stripe-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-public-key
```

### Customization Guide

- **Brand Colors**: Modify design tokens while preserving retro aesthetic
- **Typography**: Swap bitmap fonts while maintaining pixel-perfect rendering
- **Iconography**: Create new icons following Susan Kare's geometric principles
- **Copy**: Adapt Don Draper-style messaging for specific business needs

### Documentation Structure

- **README**: Vintage computer manual styling with setup instructions
- **Component Docs**: Storybook with retro theme
- **API Reference**: Terminal-style documentation
- **Deployment Guide**: Step-by-step with classic Mac dialog styling

This design creates a cohesive, pixel-perfect SaaS template that honors Susan Kare's iconic design legacy while delivering modern functionality with persuasive, transformation-focused copywriting that would make Don Draper proud.