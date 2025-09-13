# Claude Development Instructions for Sreve AI

## Project Overview
Sreve is an AI-powered marketing content creation platform built with Next.js 15, focusing on performance marketing tools for agencies and marketers. The platform offers specialized AI tools that create scroll-stopping ads, UGC scripts, and viral content that converts.

## Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript + JavaScript
- **Authentication**: Clerk
- **Database**: DynamoDB (AWS)
- **Styling**: CSS Modules + Inline Styles
- **Deployment**: Vercel (likely)

## Key Project Principles

### 1. SEO-First Approach
- **Every page MUST have comprehensive Schema.org structured data**
- **Cross-linking strategy**: All pages should link to related content within the domain
- **Content-rich pages**: Prioritize substantial, valuable content over minimal pages
- **Internal linking**: Use contextual links to improve page authority distribution

### 2. Performance Marketing Focus
- **Copy that converts**: All content should focus on driving engagement, clicks, and sales
- **Agency-friendly**: Tools designed for managing multiple clients and brand voices
- **Cost-effective positioning**: Emphasize savings compared to expensive alternatives (Jasper, Copy.ai)

### 3. Content Strategy
- **Blog posts should be comprehensive** (1000+ words with detailed analysis)
- **Tools pages need extensive content** with use cases, comparisons, and testimonials
- **Cross-reference between tools and blog posts** for topical authority
- **Focus on performance marketing, AI tools, and cost comparisons**

## File Structure & Conventions

### Pages Structure
```
app/
├── page.tsx                    # Homepage with hero, features, tools showcase
├── tools/
│   ├── page.tsx               # Main tools listing with comprehensive content
│   ├── ai-caption-generator/   # Individual tool pages
│   ├── ai-content-generator/
│   └── [other-tools]/
├── blog/
│   ├── page.tsx               # Blog listing page
│   └── [blog-posts]/          # Individual blog posts
└── [other-routes]/
```

### Component Guidelines
- Use **functional components with hooks**
- **NO INLINE STYLES ALLOWED** - All styling must be in separate CSS files
- **CSS classes** should be semantic and tool-specific
- **CSS Modules or separate CSS files** for each page/component
- **Responsive design** using CSS Grid and Flexbox

### Styling Policy - STRICT REQUIREMENTS

#### CSS File Organization
- **Homepage**: `/app/globals.css` for global styles, `/app/page.css` for page-specific styles
- **Tools pages**: `/app/tools/tools.css` for shared tool styles, individual tool CSS files when needed
- **Blog pages**: `/app/blog/blog.css` for blog-specific styles
- **Components**: Individual CSS files in `/app/components/` folder

#### Prohibited Styling Practices
- ❌ **NO inline styles** (`style={{}}` attributes)
- ❌ **NO style props** on components
- ❌ **NO CSS-in-JS** solutions
- ❌ **NO dynamic style objects**

#### Required Styling Practices  
- ✅ **CSS classes only** for all styling
- ✅ **Semantic class names** that describe purpose, not appearance
- ✅ **CSS custom properties** for consistent theming
- ✅ **Responsive design** with CSS media queries
- ✅ **CSS Grid and Flexbox** for layouts

### Design System & Branding

#### Brand Colors (Three-Level Dark Theme)
```css
/* Three Levels of Darkness - STRICT HIERARCHY */
--darkness-level-1: #000000;   /* Deepest dark - main backgrounds */
--darkness-level-2: #0f0f0f;   /* Medium dark - card backgrounds, sections */
--darkness-level-3: #1f1f1f;   /* Lighter dark - elevated elements, hover states */

/* Text Colors - White/Grey Hierarchy */
--text-primary: #ffffff;       /* Primary headings, important text */
--text-secondary: #cccccc;     /* Secondary text, descriptions */
--text-tertiary: #888888;     /* Metadata, subtle text */

/* Orange Accent - LIMITED TO 25% OF PAGE */
--orange-primary: #ff6600;     /* Main orange - CTAs, highlights */
--orange-secondary: #ff8533;   /* Orange variations for gradients */
--orange-glow: rgba(255, 102, 0, 0.3); /* Orange glow effects */

/* Glass/Frost Effects */
--glass-background: rgba(255, 255, 255, 0.05);
--glass-border: rgba(255, 255, 255, 0.1);
--glass-backdrop: blur(10px);
--frost-background: rgba(15, 15, 15, 0.8);
--frost-border: rgba(255, 255, 255, 0.08);

/* Gradients */
--gradient-dark: linear-gradient(135deg, #000000, #0f0f0f);
--gradient-orange: linear-gradient(135deg, #ff6600, #ff8533);
--gradient-glass: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
```

#### Usage Guidelines - STRICT RULES
- **Orange Usage**: Maximum 25% of page content, ONE orange background section only
- **Background Levels**: Level 1 (main bg) → Level 2 (sections) → Level 3 (cards/elements)
- **Text Hierarchy**: White (headings) → Light grey (body) → Dark grey (metadata)
- **Glass Effects**: Use on cards, modals, and elevated elements
- **Frost Effects**: Use on overlays and hero sections
- **Glows**: Orange glow only on interactive elements and key CTAs

#### Header & Footer Consistency

**All public pages MUST include consistent header and footer:**

##### Standard Header Structure
```jsx
<header className="header">
  <Link href="/" aria-label="Sreve home">
    <Image src="/assets/logo.png" alt="Sreve Logo" className="logo" width={auto} height={40} priority />
  </Link>
  <nav className="nav-links" aria-label="Primary">
    <a href="/#features">Product</a>
    <Link href="/tools">Tools</Link>
    <a href="/#pricing">Pricing</a>
    <Link href="/blog">Blog</Link>
    <a href="/#contact-us">Contact Us</a>
  </nav>
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
    <SignedOut>
      <SignInButton mode="modal">
        <button className="cta-button">Sign In</button>
      </SignInButton>
    </SignedOut>
    <SignedIn>
      <Link href="/app">
        <button className="cta-button go-to-app-button">Go to App</button>
      </Link>
      <UserButton />
    </SignedIn>
  </div>
</header>
```

##### Standard Footer Structure
```jsx
<footer className="footer">
  <div className="footer-content">
    <div className="footer-section">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>AI Tools</h4>
          <ul className="footer-nav" style={{ listStyle: 'none', padding: 0 }}>
            <li><Link href="/tools/ai-caption-generator">Caption Generator</Link></li>
            <li><Link href="/tools/ai-content-generator">Content Generator</Link></li>
            <li><Link href="/tools/blog-idea-generator">Blog Ideas</Link></li>
            <li><Link href="/tools/social-media-post-generator">Social Posts</Link></li>
            <li><Link href="/tools/ai-sentence-rewriter">Sentence Rewriter</Link></li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>Resources</h4>
          <ul className="footer-nav" style={{ listStyle: 'none', padding: 0 }}>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/blog/cheaper-jasper-alternative-2025">Jasper Alternative</Link></li>
            <li><Link href="/blog/top-5-tools-for-creative-and-marketing-agencies">Agency AI Tools</Link></li>
            <li><Link href="/tools">All Tools</Link></li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>Company</h4>
          <ul className="footer-nav" style={{ listStyle: 'none', padding: 0 }}>
            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            <li><a href="https://api.whatsapp.com/send/?phone=9487731230&type=phone_number&app_absent=0" rel="noopener noreferrer" target="_blank">Contact</a></li>
            <li><a href="/#pricing">Pricing</a></li>
            <li><a href="/#features">Features</a></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div className="footer-bottom">
    <p>© 2024 Sreve. All rights reserved.</p>
  </div>
</footer>
```

#### Visual Consistency Rules
1. **All tool cards**: Use hover effects with `translateY(-4px)` and enhanced shadows
2. **CTA buttons**: Orange background (#ff6600), white text, rounded corners
3. **Section backgrounds**: Alternate between #0a0a0a and #f8f9fa (light sections use dark text)
4. **Card shadows**: Use `0 4px 6px rgba(0,0,0,0.1)` consistently
5. **Border radius**: 8px for buttons, 12px for cards and major sections

## Content Guidelines

### Blog Posts Must Include:
1. **Comprehensive article schema** (Article, FAQPage, BreadcrumbList)
2. **Internal links** to relevant tools and other blog posts
3. **Detailed comparisons** with competitors when relevant
4. **Real results and testimonials** when possible
5. **Clear calls-to-action** linking to tools

### Tool Pages Must Include:
1. **SoftwareApplication schema** with features, pricing, ratings
2. **HowTo schema** for step-by-step usage guides
3. **Related tools sections** linking to complementary tools
4. **Success stories and testimonials**
5. **Comparison tables** vs competitors

### Schema.org Requirements
Every page must have appropriate structured data:
- **Homepage**: Organization, WebSite, Service schemas
- **Tools pages**: SoftwareApplication, CollectionPage, FAQPage schemas
- **Blog pages**: Article, Blog, FAQPage schemas
- **All pages**: BreadcrumbList schema

## Marketing Positioning

### Key Messaging
- **90% cheaper than Jasper AI** ($19/month vs $49-125/month)
- **Built for performance marketing** (not generic content)
- **Agency-friendly** with multiple brand voices
- **Results-focused** rather than content volume focused

### Target Audience
1. **Marketing Agencies** managing multiple clients
2. **Performance Marketers** focused on conversion optimization
3. **E-commerce Brands** needing product-focused content
4. **Content Creators** building consistent social presence

### Competitor Positioning
- **Jasper AI**: Too expensive, generic output, complex setup
- **Copy.ai**: Good for quick variations but lacks strategic depth
- **Writesonic**: SEO-focused but not performance marketing optimized

## Development Best Practices

### Code Standards
- **TypeScript types** for all props and data structures
- **Error handling** for all API calls and user interactions
- **Responsive design** considerations for all new components
- **Accessibility** features (aria-labels, semantic HTML)

### UI/UX Consistency Requirements

#### Public Page Standards
**Every public page (non-authenticated) MUST have:**
1. **Consistent header** with logo, navigation, and auth buttons
2. **Consistent footer** with categorized links and company info
3. **Brand color scheme** using the defined color palette
4. **Responsive design** that works on mobile, tablet, and desktop
5. **Schema.org markup** appropriate for the page type

#### Page Layout Pattern
```jsx
export default function PublicPage() {
  return (
    <>
      {/* Standard Header - Required on all public pages */}
      <header className="header">
        {/* Header content as defined above */}
      </header>

      {/* Page-specific content */}
      <main>
        {/* Hero section with consistent styling */}
        <section className="hero" style={{ minHeight: '60vh', paddingTop: '120px' }}>
          {/* Hero content */}
        </section>
        
        {/* Additional sections with alternating backgrounds */}
        <section style={{ padding: '4rem 0', background: '#f8f9fa' }}>
          {/* Light section content */}
        </section>
        
        <section style={{ padding: '4rem 0', background: '#0a0a0a' }}>
          {/* Dark section content */}
        </section>
      </main>

      {/* Standard Footer - Required on all public pages */}
      <footer className="footer">
        {/* Footer content as defined above */}
      </footer>

      {/* Schema.org structured data - Required */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{...}} />
    </>
  );
}
```

#### Component Reuse Guidelines
- **Header/Footer**: Use exact same structure across all public pages
- **Tool cards**: Maintain consistent styling with hover effects
- **CTA buttons**: Always use orange background with proper hover states
- **Section spacing**: Use 4rem vertical padding for all sections
- **Container max-width**: Keep content within readable widths

### SEO Requirements
- **Meta tags** and OpenGraph data on all pages
- **Canonical URLs** to prevent duplicate content issues
- **Image alt tags** with descriptive, keyword-rich text
- **Internal linking** with keyword-rich anchor text

### Content Creation Workflow
1. **Research keywords** and competitor content
2. **Create comprehensive outlines** with internal linking opportunities
3. **Write detailed, valuable content** (not thin pages)
4. **Add appropriate schema markup**
5. **Test build and fix any errors**

## API & Data Patterns

### DynamoDB Tables
- `Users_Dev` - User management
- `Projects_Dev` - Project storage
- `ChatMessages_Dev` - Chat history
- `Campaigns_Dev` - Campaign data

### API Endpoints
- `/api/users` - User operations
- `/api/projects` - Project CRUD
- `/api/chat` - AI chat functionality
- `/api/campaigns` - Campaign management

## Build & Deployment

### Required Commands
- `npm run build` - Build production version (MUST pass without errors)
- `npx tsc --noEmit` - Type checking (MUST pass)

### Pre-deployment Checklist
1. All pages build successfully
2. No TypeScript errors
3. All Schema.org markup validates
4. Internal links work correctly
5. Mobile responsiveness verified

## Content Topics & Keywords

### Primary Keywords
- AI tools for marketing
- AI caption generator
- AI content generator
- Jasper AI alternative
- Performance marketing AI
- Social media AI tools

### Content Themes
- **Cost comparisons** with expensive AI tools
- **Performance marketing strategies**
- **Agency workflow optimization**
- **AI tool reviews and comparisons**
- **Content creation best practices**

## Common Patterns & Components

### Schema.org Implementation
Always include these schema types where appropriate:
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication|Article|Organization",
  "breadcrumb": { /* Always include breadcrumbs */ }
}
```

### Internal Linking Strategy
- **Homepage**: Links to tools and popular blog posts
- **Tools pages**: Cross-link to related tools and relevant blog posts
- **Blog posts**: Link to relevant tools and other blog posts
- **Footer**: Comprehensive site navigation with all major pages

## Important Notes

### What NOT to do
- **Don't create thin content pages** - every page should be substantial
- **Don't skip Schema.org markup** - it's required for SEO strategy
- **Don't break internal linking** - always verify links work
- **Don't ignore mobile experience** - test on mobile devices

### Always Remember
- **Focus on conversion** rather than just traffic
- **Emphasize cost savings** vs expensive alternatives  
- **Target agencies and performance marketers** specifically
- **Build topical authority** through comprehensive, interconnected content

## CSS Isolation & Route Transition Fixes

**CRITICAL**: To prevent CSS conflicts between page transitions, all page-specific styles must be scoped:

### CSS Scoping Pattern
```css
/* Bad - Global styles that conflict */
.tool-card { background: #1f1f1f; }
body { text-align: left !important; }

/* Good - Scoped styles */
.tools-page .tool-card { background: #1f1f1f; }
.blog-page .blog-container { text-align: left !important; }
```

### Page Class System
- **Tools pages**: Wrap content in `<div className="tools-page">`
- **Blog pages**: Body gets `.blog-page` class automatically via ClientRouteHandler
- **App pages**: Body gets `.app-page` class automatically

### CSS File Structure
- `tools.css`: All selectors prefixed with `.tools-page`
- `blog.css`: All selectors prefixed with `.blog-page` 
- `globals.css`: Only base styles that apply universally
- `layout.tsx`: Contains CSS reset to prevent conflicts

### ClientRouteHandler Component
- Automatically manages body classes based on route
- Resets conflicting styles on navigation  
- Ensures consistent base styling across all pages

## Emergency Fixes

### Build Errors
1. Check JSX syntax (missing closing tags, incorrect nesting)
2. Verify TypeScript types are correct
3. Ensure all imports are properly resolved
4. Check for syntax errors in Schema.org JSON

### SEO Issues
1. Verify all pages have proper meta tags
2. Check Schema.org markup with Google's testing tool
3. Ensure internal links use proper anchor text
4. Confirm breadcrumb navigation is working

This file should be updated whenever significant changes are made to the project structure or content strategy.
- add to memory. the pages should only use dark backgrounds. have 3 different levels of darkness. the text should be in white, grey and orange. there should only be about 25% of orange in each page and only one section in orange background. you can use monochoromatic gradients wherever needed. add glass effect, frost effect glow wherever needed.