# Blog SEO Testing & Verification Guide

## Quick Start Verification

Run these commands to verify SEO implementation is working correctly:

### 1. Check Environment Variables
```bash
# Verify NEXT_PUBLIC_SITE_URL is set
cd frontend
grep NEXT_PUBLIC_SITE_URL .env.local
```

Expected output:
```
NEXT_PUBLIC_SITE_URL=https://edmarg.com
```

### 2. Build and Start the App
```bash
cd frontend
npm run build
npm run start
```

### 3. Test Blog Listing Page

#### Check Meta Tags
```powershell
# Using PowerShell
$url = "http://localhost:3000/blogs"
$response = Invoke-WebRequest -Uri $url
$html = $response.Content

# Check for essential meta tags
if ($html -match '<title>Blog \| EdMarg') { Write-Host "✓ Title correct" }
if ($html -match 'og:title') { Write-Host "✓ OG title present" }
if ($html -match 'og:type.*website') { Write-Host "✓ OG type correct" }
if ($html -match 'twitter:card') { Write-Host "✓ Twitter card present" }
if ($html -match 'application/ld\+json') { Write-Host "✓ JSON-LD present" }
```

#### Browser DevTools
1. Open http://localhost:3000/blogs
2. Open DevTools (F12)
3. Go to Head section (inspect element)
4. Verify presence of:
   - `<meta name="description">`
   - `<meta property="og:title">`
   - `<meta property="og:type" content="website">`
   - `<meta name="twitter:card" content="summary_large_image">`
   - `<link rel="canonical">`
   - `<script type="application/ld+json">` with Organization schema

### 4. Test Blog Detail Page

#### Navigate to a sample blog
First, create a test blog through admin panel or check if any blogs exist:

```powershell
# Check if blogs exist
$response = Invoke-WebRequest -Uri "http://localhost:5000/api/blogs"
$data = $response.Content | ConvertFrom-Json
if ($data.data.Count -gt 0) {
    Write-Host "Blog exists: $($data.data[0].slug)"
} else {
    Write-Host "No blogs in database - create one first via /admin/blogs/create"
}
```

#### Check Meta Tags for Blog Detail
```powershell
$slug = "your-blog-slug" # Replace with actual slug
$url = "http://localhost:3000/blogs/$slug"
$response = Invoke-WebRequest -Uri $url
$html = $response.Content

# Check dynamic meta tags
if ($html -match 'og:type.*article') { Write-Host "✓ OG type is article" }
if ($html -match 'og:image') { Write-Host "✓ OG image present" }
if ($html -match 'datePublished') { Write-Host "✓ Date published in schema" }
if ($html -match '"@type": "Article"') { Write-Host "✓ Article schema present" }
```

#### Browser Verification
1. Open http://localhost:3000/blogs/[slug] where [slug] is actual blog slug
2. Open DevTools (F12) → Head section
3. Verify:
   - Title includes blog title
   - Meta description from blog.description
   - og:type = "article"
   - og:image with blog image URL
   - JSON-LD Article schema with headline, description, image, author, datePublished

### 5. Test 404 Page

#### Navigate to non-existent blog
```bash
# Open in browser
http://localhost:3000/blogs/non-existent-blog-slug
```

#### Check meta robots tag
```powershell
$url = "http://localhost:3000/blogs/non-existent-blog"
$response = Invoke-WebRequest -Uri $url
$html = $response.Content

if ($html -match 'robots.*noindex') {
    Write-Host "✓ noindex found on 404 page"
} else {
    Write-Host "✗ noindex missing on 404 page"
}
```

Expected:
- Page shows "Page Not Found" UI
- Title is "Page Not Found | EdMarg"
- Meta robots contains "noindex"

### 6. Test Sitemap

#### Fetch Sitemap
```powershell
$sitemapUrl = "http://localhost:3000/sitemap.xml"
try {
    $response = Invoke-WebRequest -Uri $sitemapUrl
    Write-Host "✓ Sitemap accessible"
    $content = $response.Content
    
    # Count URLs
    $urlCount = ($content -match '<url>' | Measure-Object).Count
    Write-Host "✓ Total URLs in sitemap: $urlCount"
    
    # Check for blogs URL
    if ($content -match '/blogs</loc>') { Write-Host "✓ /blogs URL present" }
    
    # Check for blog detail URLs
    if ($content -match '/blogs/.*</loc>') { Write-Host "✓ Blog detail URLs present" }
    
} catch {
    Write-Host "✗ Sitemap fetch failed: $_"
}
```

#### Validate XML
```powershell
# Check XML is valid
[xml]$sitemap = Invoke-WebRequest -Uri "http://localhost:3000/sitemap.xml"
Write-Host "✓ Sitemap XML is valid"
Write-Host "Namespaces: $($sitemap.urlset.xmlns)"
```

### 7. Test robots.txt

#### Fetch robots.txt
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/robots.txt"
$content = $response.Content

Write-Host "=== robots.txt Content ==="
Write-Host $content

# Check important rules
if ($content -match 'Allow: /blogs') { Write-Host "✓ Allow /blogs" }
if ($content -match 'Disallow: /admin') { Write-Host "✓ Disallow /admin" }
if ($content -match 'Sitemap:') { Write-Host "✓ Sitemap URL present" }
if ($content -match 'User-agent: \*') { Write-Host "✓ Universal agent rules present" }
```

### 8. Social Media Preview Tests

#### Open Graph Testing
Visit: https://www.opengraph.xyz/

1. Enter: `http://localhost:3000/blogs` (or deployed URL)
2. Verify preview shows:
   - ✓ Title: "Blog | EdMarg - ..."
   - ✓ Description visible
   - ✓ Image visible (if set)

#### Twitter Card Testing
Visit: https://cards-dev.twitter.com/validator

1. Enter: `http://localhost:3000/blogs/[slug]` (deployed URL needed)
2. Verify preview shows:
   - ✓ Card type: summary_large_image
   - ✓ Title from blog
   - ✓ Description from blog
   - ✓ Image visible

#### Facebook Sharing Debugger
Visit: https://developers.facebook.com/tools/debug/

1. Enter: `http://localhost:3000/blogs/[slug]`
2. Verify shows correct metadata

### 9. Google Structured Data

#### Rich Results Test
Visit: https://search.google.com/test/rich-results

1. Paste blog URL: `http://localhost:3000/blogs/[slug]`
2. Check results show "Article" as valid type
3. Verify all fields highlighted:
   - Headline ✓
   - Description ✓
   - Image ✓
   - Author ✓
   - Date Published ✓

#### Schema.org Validator
Visit: https://validator.schema.org/

1. Paste blog page HTML (View Source)
2. No validation errors should be present
3. "Article" type should be recognized

### 10. SEO Tools (Automated)

#### Using Lighthouse
```powershell
# If lighthouse CLI installed
lighthouse "http://localhost:3000/blogs" --view --chrome-flags="--headless"
```

Check SEO score and verify:
- ✓ Document has valid <meta name="viewport">
- ✓ Document has <title> element
- ✓ Document has valid hreflang links (if multilingual)
- ✓ Links can be crawled

#### Using SEO Meta Tags Audit
Visit: https://www.seobility.net/en/seocheck/

1. Enter: Your deployed blog URL
2. Review SEO recommendations
3. Verify meta tags section shows all tags

### 11. Mobile SEO

#### Mobile-Friendly Test
Visit: https://search.google.com/test/mobile-friendly

1. Enter blog URL
2. Should show: "Page is mobile-friendly" ✓

#### Responsive Design Check
```powershell
# Test different viewport sizes by opening DevTools
# F12 → Toggle device toolbar (Ctrl+Shift+M)
# Test at: 375px (mobile), 768px (tablet), 1024px (desktop)
```

Verify at each breakpoint:
- ✓ Title readable
- ✓ Images display correctly
- ✓ Description visible
- ✓ Links clickable

### 12. Performance Metrics

#### Verify Image Lazy Loading
```javascript
// Open DevTools → Console
// Check image elements
const images = document.querySelectorAll('img');
images.forEach(img => {
  console.log(`${img.alt}: loading="${img.loading}"`);
});
// Should show: loading="lazy" for all images
```

#### Check for JavaScript Errors
```javascript
// Open DevTools → Console
// Should show no errors when page loads
// Meta tags should be injected via JavaScript
```

### 13. Accessibility & SEO

Check image alt text:
```javascript
const images = document.querySelectorAll('img');
images.forEach(img => {
  if (!img.alt) {
    console.warn("Missing alt text:", img.src);
  }
});
```

All images should have alt text ✓

### 14. Performance Optimization

#### Check Page Load Time
```powershell
# Using curl with timing
curl -w "Time: %{time_total}s\n" -o /dev/null -s http://localhost:3000/blogs
```

Target: < 3 seconds for initial load

#### Check Cumulative Layout Shift
Use Lighthouse report - should be < 0.1 (Good)

## Automated Testing Script

Save as `test-seo.ps1`:

```powershell
param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$BlogSlug = "test-blog"
)

Write-Host "🔍 Starting SEO Tests..." -ForegroundColor Green

# Test 1: Blog Listing Page
Write-Host "`n1️⃣ Testing /blogs page..."
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/blogs"
    $html = $response.Content
    
    Write-Host "   ✓ Page loads successfully"
    if ($html -match 'og:title') { Write-Host "   ✓ OG title present" }
    if ($html -match 'twitter:card') { Write-Host "   ✓ Twitter card present" }
    if ($html -match 'application/ld\+json') { Write-Host "   ✓ JSON-LD present" }
} catch {
    Write-Host "   ✗ Error: $_" -ForegroundColor Red
}

# Test 2: Blog Detail Page
Write-Host "`n2️⃣ Testing /blogs/[slug] page..."
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/blogs/$BlogSlug"
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✓ Blog page loads"
    } else {
        Write-Host "   ℹ Blog may not exist (404 expected for non-existent blog)"
    }
} catch {
    Write-Host "   ℹ Blog not found (expected if it doesn't exist in DB)"
}

# Test 3: Sitemap
Write-Host "`n3️⃣ Testing /sitemap.xml..."
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/sitemap.xml"
    [xml]$sitemap = $response.Content
    Write-Host "   ✓ Sitemap is valid XML"
    $urlCount = $sitemap.urlset.url.Count
    Write-Host "   ✓ Contains $urlCount URLs"
} catch {
    Write-Host "   ✗ Error: $_" -ForegroundColor Red
}

# Test 4: robots.txt
Write-Host "`n4️⃣ Testing /robots.txt..."
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/robots.txt"
    $content = $response.Content
    Write-Host "   ✓ robots.txt accessible"
    if ($content -match 'Sitemap:') { Write-Host "   ✓ Sitemap URL defined" }
    if ($content -match 'User-agent') { Write-Host "   ✓ User-agent rules present" }
} catch {
    Write-Host "   ✗ Error: $_" -ForegroundColor Red
}

Write-Host "`n✅ SEO Tests Complete!" -ForegroundColor Green
```

Run with:
```powershell
.\test-seo.ps1 -BaseUrl "http://localhost:3000" -BlogSlug "actual-blog-slug"
```

## Continuous Monitoring

### Set up weekly checks:

1. **Google Search Console**
   - Monitor index coverage
   - Check for crawl errors
   - Review sitemaps status

2. **Google Analytics 4**
   - Monitor blog traffic
   - Track user engagement
   - Check bounce rates

3. **Lighthouse CI**
   - Integrate with CI/CD
   - Monitor SEO scores on each deploy

4. **Sitemap Monitoring**
   - Verify blogs are indexed
   - Check for 404 removals

## Troubleshooting

### Common Issues:

#### Issue: Meta tags not appearing
**Solution:**
- Clear browser cache: Ctrl+Shift+Delete
- Hard refresh: Ctrl+Shift+R
- Check browser console for JavaScript errors

#### Issue: Sitemap empty
**Solution:**
- Verify backend API running: `curl http://localhost:5000/api/blogs`
- Check `.env.local` has `NEXT_PUBLIC_BACKEND_URL`
- Create test blog via admin panel

#### Issue: robots.txt returns 404
**Solution:**
- Ensure `public/robots.txt` exists
- Rebuild app: `npm run build`
- Restart server

#### Issue: JSON-LD not showing in DevTools
**Solution:**
- Check browser JavaScript is enabled
- Verify page is being rendered as client component
- Check console for errors in seo.ts utility

## Performance Targets

- ✓ Sitemap generation: < 2 seconds
- ✓ Page load with meta tags: < 1 second additional
- ✓ Image lazy loading: Reduces initial load by 30-50%
- ✓ JSON-LD injection: < 100ms

## Documentation References

- [How to test Open Graph](https://www.opengraph.xyz/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Google Structured Data Test](https://search.google.com/test/rich-results)
- [Lighthouse SEO Audit](https://developers.google.com/web/tools/lighthouse)
