# 🏷️ Generated Meta Tags Reference

## Blog Listing Page
**URL**: `/blogs`  
**Status**: ✅ Live

```html
<title>Blog | EdMarg - Career Insights & Mentorship Articles</title>
<meta name="description" content="Explore insightful articles on education, career growth, exams, and mentorship guidance from EdMarg experts.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://edmarg.com/blogs">

<!-- Open Graph (Facebook, LinkedIn, etc.) -->
<meta property="og:title" content="Blog | EdMarg - Career Insights & Mentorship Articles">
<meta property="og:description" content="Explore insightful articles on education, career growth, exams, and mentorship guidance from EdMarg experts.">
<meta property="og:url" content="https://edmarg.com/blogs">
<meta property="og:type" content="website">
<meta property="og:site_name" content="EdMarg">

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Blog | EdMarg - Career Insights & Mentorship Articles">
<meta name="twitter:description" content="Explore insightful articles on education, career growth, exams, and mentorship guidance from EdMarg experts.">

<!-- Structured Data (JSON-LD) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "EdMarg",
  "url": "https://edmarg.com",
  "description": "Education mentorship and career guidance platform"
}
</script>
```

---

## Blog Detail Page (Example)
**URL**: `/blogs/how-to-ace-interviews`  
**Status**: ✅ Dynamically Generated

### From Blog Data (Pulled from Database):
```javascript
{
  id: "507f1f77bcf86cd799439011",
  title: "How to Ace Your Technical Interview",
  slug: "how-to-ace-interviews",
  description: "Learn proven strategies to prepare, approach, and excel in your first technical interview.",
  image: "https://cdn.example.com/interview-guide.jpg",
  author: "Sarah Anderson",
  date: "2024-04-09T10:00:00Z",
  content: "<h2>Preparation Phase</h2><p>...</p>",
  tags: ["interviews", "career", "tips"]
}
```

### Generated Meta Tags:
```html
<title>How to Ace Your Technical Interview | EdMarg Blog</title>
<meta name="description" content="Learn proven strategies to prepare, approach, and excel in your first technical interview.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://edmarg.com/blogs/how-to-ace-interviews">

<!-- Open Graph (Facebook, LinkedIn, etc.) -->
<meta property="og:title" content="How to Ace Your Technical Interview | EdMarg Blog">
<meta property="og:description" content="Learn proven strategies to prepare, approach, and excel in your first technical interview.">
<meta property="og:url" content="https://edmarg.com/blogs/how-to-ace-interviews">
<meta property="og:type" content="article">
<meta property="og:image" content="https://cdn.example.com/interview-guide.jpg">
<meta property="og:image:alt" content="How to Ace Your Technical Interview">
<meta property="og:site_name" content="EdMarg">

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="How to Ace Your Technical Interview | EdMarg Blog">
<meta name="twitter:description" content="Learn proven strategies to prepare, approach, and excel in your first technical interview.">
<meta name="twitter:image" content="https://cdn.example.com/interview-guide.jpg">

<!-- Image Tags -->
<img src="https://cdn.example.com/interview-guide.jpg" 
     alt="How to Ace Your Technical Interview"
     loading="lazy"
     class="featured-image">

<!-- Structured Data (JSON-LD) - Article Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Ace Your Technical Interview",
  "description": "Learn proven strategies to prepare, approach, and excel in your first technical interview.",
  "image": "https://cdn.example.com/interview-guide.jpg",
  "author": {
    "@type": "Person",
    "name": "Sarah Anderson"
  },
  "datePublished": "2024-04-09T10:00:00Z",
  "url": "https://edmarg.com/blogs/how-to-ace-interviews"
}
</script>
```

---

## 404 Page (Not Found Blog)
**URL**: `/blogs/non-existent-slug`  
**Status**: ✅ Dynamically Set

```html
<title>Page Not Found | EdMarg</title>
<meta name="description" content="The page you are looking for does not exist.">
<meta name="robots" content="noindex, follow">
<!-- Note: No canonical URL on 404 pages -->

<!-- No Open Graph or structured data for 404 -->
```

---

## Sitemap Entry (Example)
**File**: `sitemap.xml` generated at `/sitemap.xml`  
**Revalidates**: Every 1 hour

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  <url>
    <loc>https://edmarg.com</loc>
    <lastmod>2024-04-09T15:30:00Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  
  <url>
    <loc>https://edmarg.com/blogs</loc>
    <lastmod>2024-04-09T15:30:00Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>https://edmarg.com/browse-mentors</loc>
    <lastmod>2024-04-09T15:30:00Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Dynamic Blog Pages -->
  <url>
    <loc>https://edmarg.com/blogs/how-to-ace-interviews</loc>
    <lastmod>2024-04-09T10:00:00Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://edmarg.com/blogs/career-pivot-guide</loc>
    <lastmod>2024-04-08T14:22:00Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- More blog URLs... -->
</urlset>
```

---

## robots.txt Configuration
**File**: `public/robots.txt`  
**Accessible at**: `/robots.txt`

```
# robots.txt for EdMarg

# Default rules for all bots
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /_next
Disallow: /.git

# Don't crawl common private routes
Disallow: /profile/settings
Disallow: /profile/edit
Disallow: /dashboard

# Allow specific pages for indexing
Allow: /blogs
Allow: /browse-mentors

# Specify sitemap location
Sitemap: https://edmarg.com/sitemap.xml

# Crawl delay (in seconds) to reduce server load
Crawl-delay: 1

# Request rate limit
Request-rate: 1/1s
```

---

## Tag Generation Matrix

| Page | Title | Description | OG:Type | OG:Image | Twitter | Canonical | JSON-LD |
|------|-------|-------------|---------|----------|---------|-----------|---------|
| `/blogs` | ✅ Static | ✅ Static | website | ❌ No | ✅ Yes | ✅ Yes | Organization |
| `/blogs/[slug]` | ✅ Dynamic | ✅ Dynamic | article | ✅ Dynamic | ✅ Yes | ✅ Dynamic | Article |
| `/blogs/404` | ✅ Static | ✅ Static | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No |

---

## Dynamic vs. Static Data

### Static (Same for all pages)
- Site name: "EdMarg"
- Base URL: From `NEXT_PUBLIC_SITE_URL`
- Twitter card type: "summary_large_image"
- Robots rules: "index, follow" (except 404)

### Dynamic (Per blog)
- Title: From `blog.title`
- Description: From `blog.description`
- Image: From `blog.image`
- Author: From `blog.author`
- Published Date: From `blog.date`
- URL: Constructed with `blog.slug`
- OG Type: "article" (for detail pages)

---

## Code Generation Flow

### Blog Listing Page Flow:
```
useEffect runs
  ↓
fetch blogs from API
  ↓
call updateSEOMetadata({...})
  ↓
SEO utility creates meta tags in <head>
  ↓
call injectOrganizationStructuredData()
  ↓
JSON-LD script injected in <head>
  ↓
SEO-optimized page ready
```

### Blog Detail Page Flow:
```
useEffect runs
  ↓
fetch blog by slug from API
  ↓
check if blog exists
  ├─ if NOT → call updateSEO404()
  │          └─ sets noindex meta tag
  │
  └─ if YES → call updateSEOMetadata({
              title: dynamic,
              description: dynamic,
              ...
            })
            ↓
            call injectArticleStructuredData({
              headline: blog.title,
              author: blog.author,
              ...
            })
            ↓
            fetch related blogs
            ↓
            render page with all meta tags
```

### Sitemap Generation Flow:
```
Build time (or ISR trigger)
  ↓
Next.js calls sitemap.ts
  ↓
fetch all blogs from API
  ↓
for each blog:
  - create URL entry
  - add lastmod from blog.created_at
  - set changefreq="monthly"
  - set priority=0.8
  ↓
return XML sitemap
  ↓
Next.js generates /sitemap.xml
  ↓
auto-revalidates every 1 hour (ISR)
```

---

## Real Example: Blog Preview on Social Media

### Blog Data in Database:
```json
{
  "title": "10 Tips for Effective Mentoring Relationships",
  "slug": "effective-mentoring-tips",
  "description": "Discover 10 proven strategies to build meaningful mentor-mentee relationships that drive career growth.",
  "image": "https://images.unsplash.com/photo-mentoring.jpg",
  "author": "Dr. Michael Chen",
  "date": "2024-04-05T09:15:00Z"
}
```

### When Shared on Facebook:
```
┌─────────────────────────────────────────┐
│  10 Tips for Effective Mentoring...     │
│                                         │
│  [Large Image Preview]                  │
│                                         │
│  Discover 10 proven strategies to       │
│  build meaningful mentor-mentee...      │
│                                         │
│  edmarg.com/blogs/effective-mentorin... │
└─────────────────────────────────────────┘
```

### HTML Generated:
```html
<meta property="og:title" content="10 Tips for Effective Mentoring Relationships | EdMarg Blog">
<meta property="og:description" content="Discover 10 proven strategies to build meaningful mentor-mentee relationships that drive career growth.">
<meta property="og:image" content="https://images.unsplash.com/photo-mentoring.jpg">
<meta property="og:type" content="article">
<meta property="og:url" content="https://edmarg.com/blogs/effective-mentoring-tips">
```

### When Shared on Twitter:
```
┌──────────────────────────────────────────┐
│        SUMMARY_LARGE_IMAGE CARD          │
│                                          │
│     [Large Featured Image]               │
│                                          │
│  10 Tips for Effective Mentoring...      │
│  Discover 10 proven strategies to        │
│  build meaningful mentor-mentee...       │
│                                          │
│  edmarg.com/blogs/effective-...          │
└──────────────────────────────────────────┘
```

### HTML Generated:
```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="10 Tips for Effective Mentoring Relationships | EdMarg Blog">
<meta name="twitter:description" content="Discover 10 proven strategies to build meaningful mentor-mentee relationships that drive career growth.">
<meta name="twitter:image" content="https://images.unsplash.com/photo-mentoring.jpg">
```

---

## Google Search Result Preview

### How Blog Appears in Google Search:

```
10 Tips for Effective Mentoring Relationships | EdMarg Blog
edmarg.com › blogs › effective-mentoring-tips

Discover 10 proven strategies to build meaningful mentor-mentee 
relationships that drive career growth.
```

This is built from:
- **Title**: From `<title>` tag and `og:title`
- **URL**: From `<link rel="canonical">`
- **Description**: From `<meta name="description">`

---

## Rich Results in Google Search

### Using Article Schema (JSON-LD):

Google recognizes the Article schema and may show:
- Featured image
- Author name: "Dr. Michael Chen"
- Publication date: "Apr 5, 2024"
- Full headline

```
╔════════════════════════════════════════════════╗
║ 10 Tips for Effective Mentoring Relationships  ║
║                                                ║
║ [Featured Image from blog.image]               ║
║                                                ║
║ By Dr. Michael Chen • Apr 5, 2024              ║
║                                                ║
║ Discover 10 proven strategies to build...      ║
║                                                ║
║ edmarg.com • Read full article                 ║
╚════════════════════════════════════════════════╝
```

---

## Summary of All Generated Tags

### Per Blog List Page:
- 1 title tag
- 5 meta tags (description, og:title, og:description, og:url, og:type)
- 3 Twitter tags
- 1 canonical link
- 1 JSON-LD script (Organization)

### Per Blog Detail Page:
- 1 title tag
- 7 meta tags (description, robots, og:title, og:description, og:url, og:type, og:image, og:image:alt)
- 4 Twitter tags
- 1 canonical link
- 1 JSON-LD script (Article)
- Multiple image alt attributes

### Sitemaps & Robots:
- 1 sitemap.xml (dynamic, regenerated hourly)
- 1 robots.txt (static configuration)

**Total Meta Tags Per Page**: 12-19 tags depending on page type

---

## Verification

To verify these tags are being generated correctly:

1. **View Page Source**: Right-click → View Page Source → Search for `<meta`
2. **DevTools**: F12 → Elements → Head section
3. **Online Tools**: 
   - OpenGraph Debugger: https://www.opengraph.xyz/
   - Google Structured Data: https://search.google.com/test/rich-results
   - Twitter Card Validator: https://cards-dev.twitter.com/validator

---

**Last Updated**: 2024-04-09  
**Status**: ✅ All tags being generated correctly
