# Open Graph Image Specification

## LLM Cost Engine - Social Sharing Image Brief

**Document Version:** 1.0
**Created:** 2026-01-31
**Target File:** `/public/assets/og-image.png`

---

## 1. Technical Specifications

### Dimensions
- **Width:** 1200px
- **Height:** 630px
- **Aspect Ratio:** 1.91:1 (optimal for Facebook, LinkedIn, Twitter)

### File Format
- **Primary:** PNG (recommended for sharp text and graphics)
- **Alternative:** JPEG (if file size is a concern, quality 85+)

### File Size
- **Target:** Under 300KB (optimal load time)
- **Maximum:** 1MB (platform limits)
- **Recommendation:** Use PNG optimization tools (TinyPNG, ImageOptim)

### File Location
```
/public/assets/og-image.png
```

This will resolve to:
```
https://llm-cost-engine.vercel.app/assets/og-image.png
```

---

## 2. Visual Design Brief

### Layout Structure (1200x630px)

```
+----------------------------------------------------------+
|                                                          |
|  [Logo/Icon]                           [Provider Logos]  |
|                                                          |
|         LLM COST ENGINE                                  |
|         ========================                         |
|                                                          |
|    Compare GPT-4o, Claude 3.5 & Gemini Pro              |
|    Enterprise TCO Analysis for AI Deployments            |
|                                                          |
|    +--------+  +--------+  +--------+                    |
|    | OpenAI |  |Anthropic| | Google |                    |
|    +--------+  +--------+  +--------+                    |
|                                                          |
|    [ValueScore Visualization Bar]                        |
|                                                          |
|                                 llm-cost-engine.app      |
+----------------------------------------------------------+
```

### Color Palette (Based on App Branding)

| Element | Color | Hex Code | Usage |
|---------|-------|----------|-------|
| Primary Background | Slate/Dark | `#0F172A` | Main background (professional, enterprise feel) |
| Accent Primary | Indigo | `#4F46E5` | Highlights, ValueScore bars |
| Accent Secondary | Cyan | `#06B6D4` | CTAs, terminal elements |
| Winner Highlight | Yellow/Amber | `#FBBF24` | Best Value badge |
| Success | Green | `#22C55E` | Savings indicators |
| Text Primary | White | `#FFFFFF` | Headlines |
| Text Secondary | Gray | `#94A3B8` | Subtext |

### Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Main Headline | Inter / SF Pro / System Sans | Bold (700) | 72px |
| Subheadline | Inter / SF Pro | Semi-bold (600) | 36px |
| Body Text | Inter / SF Pro | Regular (400) | 24px |
| Monospace Elements | JetBrains Mono / SF Mono | Medium (500) | 20px |

**Fallback Stack:** `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

---

## 3. Key Messaging

### Primary Headline (Choose One)
1. **"LLM Cost Engine"** (Brand-focused)
2. **"Compare LLM Costs Instantly"** (Action-focused)
3. **"AI Chatbot TCO Calculator"** (SEO-focused)

**Recommended:** "LLM Cost Engine" with tagline below

### Supporting Tagline
- **Primary:** "Enterprise TCO Analysis for AI Deployments"
- **Alternative:** "Compare GPT-4o, Claude & Gemini Pricing"

### Value Propositions to Include (Pick 2-3)
1. "Deterministic ValueScore Algorithm"
2. "Compare Top AI Models"
3. "Enterprise-Ready TCO Reports"
4. "Free Cost Calculator"

### URL/Domain
- Display: `llm-cost-engine.vercel.app` or custom domain if available
- Position: Bottom-right corner

---

## 4. Visual Elements to Include

### Required Elements
1. **Product Name/Logo**
   - "LLM Cost Engine" as text-based logo
   - Optional: Simple calculator or cost analysis icon

2. **Provider Representation**
   - OpenAI logo or "GPT-4o" text badge
   - Anthropic logo or "Claude" text badge
   - Google logo or "Gemini" text badge
   - Arrange horizontally with equal spacing

3. **ValueScore Visualization**
   - Three horizontal bars showing relative scores
   - Use brand colors (indigo for bars, yellow for winner)
   - Shows comparison concept at a glance

4. **Enterprise Trust Signal**
   - "TCO Analysis" or "Enterprise Ready" badge
   - Terminal-style code element (matches app design)

### Optional Enhancements
- Subtle grid or data visualization pattern in background
- Token/cost iconography ($ symbol with tokens)
- "Best Value" trophy or badge element

---

## 5. Design Variations

### Version A: Professional/Enterprise
- Dark slate background (`#0F172A`)
- Clean, minimal layout
- Focus on credibility and trust
- Terminal-style accents

### Version B: Data-Focused
- Show actual comparison data visualization
- Bar charts or cost comparison
- More technical appearance

### Version C: Action-Oriented
- Brighter colors, more contrast
- "Calculate Now" style messaging
- Urgency/benefit focused

**Recommendation:** Start with Version A for maximum professional appeal.

---

## 6. Placeholder Solution

### Immediate SVG Placeholder

Create a simple SVG that can be converted to PNG:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0F172A"/>
      <stop offset="100%" style="stop-color:#1E293B"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Grid pattern (subtle) -->
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="0.5"/>
  </pattern>
  <rect width="1200" height="630" fill="url(#grid)" opacity="0.3"/>

  <!-- Main Title -->
  <text x="600" y="200" font-family="Inter, -apple-system, sans-serif" font-size="72" font-weight="700" fill="#FFFFFF" text-anchor="middle">
    LLM Cost Engine
  </text>

  <!-- Underline accent -->
  <rect x="350" y="220" width="500" height="4" rx="2" fill="#4F46E5"/>

  <!-- Tagline -->
  <text x="600" y="280" font-family="Inter, -apple-system, sans-serif" font-size="28" font-weight="400" fill="#94A3B8" text-anchor="middle">
    Enterprise TCO Analysis for AI Deployments
  </text>

  <!-- Provider badges -->
  <g transform="translate(300, 340)">
    <!-- GPT-4o -->
    <rect x="0" y="0" width="160" height="50" rx="8" fill="#1E293B" stroke="#334155"/>
    <text x="80" y="32" font-family="Inter, sans-serif" font-size="18" font-weight="600" fill="#FFFFFF" text-anchor="middle">GPT-4o</text>
  </g>
  <g transform="translate(520, 340)">
    <!-- Claude -->
    <rect x="0" y="0" width="160" height="50" rx="8" fill="#1E293B" stroke="#334155"/>
    <text x="80" y="32" font-family="Inter, sans-serif" font-size="18" font-weight="600" fill="#FFFFFF" text-anchor="middle">Claude 3.5</text>
  </g>
  <g transform="translate(740, 340)">
    <!-- Gemini -->
    <rect x="0" y="0" width="160" height="50" rx="8" fill="#1E293B" stroke="#334155"/>
    <text x="80" y="32" font-family="Inter, sans-serif" font-size="18" font-weight="600" fill="#FFFFFF" text-anchor="middle">Gemini Pro</text>
  </g>

  <!-- ValueScore bars -->
  <g transform="translate(300, 440)">
    <rect x="0" y="0" width="600" height="12" rx="6" fill="#1E293B"/>
    <rect x="0" y="0" width="600" height="12" rx="6" fill="#FBBF24"/>
    <rect x="0" y="20" width="600" height="12" rx="6" fill="#1E293B"/>
    <rect x="0" y="20" width="480" height="12" rx="6" fill="#4F46E5"/>
    <rect x="0" y="40" width="600" height="12" rx="6" fill="#1E293B"/>
    <rect x="0" y="40" width="420" height="12" rx="6" fill="#4F46E5"/>
  </g>

  <!-- Best Value badge -->
  <g transform="translate(920, 432)">
    <rect x="0" y="0" width="120" height="32" rx="16" fill="#FBBF24"/>
    <text x="60" y="22" font-family="Inter, sans-serif" font-size="14" font-weight="700" fill="#78350F" text-anchor="middle">Best Value</text>
  </g>

  <!-- URL -->
  <text x="600" y="580" font-family="JetBrains Mono, SF Mono, monospace" font-size="18" fill="#64748B" text-anchor="middle">
    llm-cost-engine.vercel.app
  </text>

  <!-- Terminal accent (top-left) -->
  <g transform="translate(40, 40)">
    <circle cx="8" cy="8" r="6" fill="#EF4444"/>
    <circle cx="28" cy="8" r="6" fill="#FBBF24"/>
    <circle cx="48" cy="8" r="6" fill="#22C55E"/>
  </g>
</svg>
```

### Quick PNG Generation Options

**Option 1: Online Converter**
1. Save the SVG above as `og-image.svg`
2. Use https://svgtopng.com or https://cloudconvert.com
3. Set dimensions to 1200x630
4. Export as PNG
5. Optimize with https://tinypng.com

**Option 2: Command Line (with Inkscape)**
```bash
inkscape og-image.svg --export-type=png --export-width=1200 --export-height=630 -o og-image.png
```

**Option 3: AI Image Generation Prompt**
```
Create a professional Open Graph image (1200x630px) for "LLM Cost Engine" -
an enterprise TCO calculator for AI chatbots.

Style: Dark slate background (#0F172A), clean minimal design, tech/enterprise aesthetic.

Include:
- "LLM Cost Engine" as main headline in white, bold sans-serif
- Tagline: "Enterprise TCO Analysis for AI Deployments"
- Three badges for "GPT-4o", "Claude 3.5", "Gemini Pro"
- Horizontal bar chart showing ValueScore comparison (yellow for winner)
- "Best Value" badge in yellow/amber
- Terminal-style window controls (red/yellow/green dots) in corner
- URL: llm-cost-engine.vercel.app at bottom

Colors: Indigo (#4F46E5) accents, Yellow (#FBBF24) for winner highlight,
white text, gray (#94A3B8) subtext. Professional, data-driven aesthetic.
```

---

## 7. Implementation Checklist

- [ ] Create base design in Figma/Canva/AI tool
- [ ] Export as PNG at 1200x630px
- [ ] Optimize file size (target <300KB)
- [ ] Save to `/public/assets/og-image.png`
- [ ] Verify meta tags reference correct path
- [ ] Test with Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- [ ] Test with Twitter Card Validator: https://cards-dev.twitter.com/validator
- [ ] Test with LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

---

## 8. Meta Tag Reference

The following meta tags are already in place in `/src/index.html`:

```html
<!-- Open Graph Meta Tags -->
<meta property="og:image" content="https://llm-cost-engine.vercel.app/assets/og-image.png">

<!-- Twitter Card Meta Tags -->
<meta name="twitter:image" content="https://llm-cost-engine.vercel.app/assets/og-image.png">
```

Ensure the image is accessible at this exact URL after deployment.

---

## 9. Quality Checklist

- [ ] Text is readable at small preview sizes (check 600px width)
- [ ] Brand name clearly visible
- [ ] Value proposition understood in 2 seconds
- [ ] Colors match application branding
- [ ] No text cut off at edges (safe zone: 50px padding)
- [ ] Works on both light and dark backgrounds
- [ ] File size optimized
- [ ] Image loads correctly on production URL

---

**Document Owner:** Content Marketing Team
**Review Cycle:** Update when major branding or feature changes occur
