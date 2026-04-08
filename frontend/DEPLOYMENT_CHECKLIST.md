# 📋 Blog SEO - Production Deployment Checklist

## Pre-Deployment Testing (Local)

### ✅ Environment Setup
- [ ] Verify `.env.local` has `NEXT_PUBLIC_SITE_URL` set
- [ ] Confirm `NEXT_PUBLIC_BACKEND_URL` points to correct API
- [ ] Test `.env` values are accessible in code

### ✅ Build Verification
- [ ] Run `npm run build` - no errors
- [ ] Run `npm run start` - application starts
- [ ] No console errors in browser

### ✅ Blog Listing Page (`/blogs`)
- [ ] Open http://localhost:3000/blogs
- [ ] DevTools → Head section contains:
  - [ ] `<title>Blog | EdMarg - Career Insights...</title>`
  - [ ] `<meta name="description" content="...">`
  - [ ] `<meta property="og:title" content="...">`
  - [ ] `<meta property="og:type" content="website">`
  - [ ] `<meta name="twitter:card" content="summary_large_image">`
  - [ ] `<link rel="canonical" href="...">`
  - [ ] `<script type="application/ld+json">` (Organization schema)

### ✅ Blog Detail Page (Create test blog)
- [ ] Create test blog via `/admin/blogs/create`
- [ ] Fill in all fields (title, description, image, content)
- [ ] Publish the blog
- [ ] Navigate to blog detail page
- [ ] DevTools → Head section contains:
  - [ ] `<title>${blog.title} | EdMarg Blog</title>`
  - [ ] `<meta name="description">` from blog.description
  - [ ] `<meta property="og:type" content="article">`
  - [ ] `<meta property="og:image">` with blog image URL
  - [ ] `<meta name="twitter:card" content="summary_large_image">`
  - [ ] `<link rel="canonical" href="...blogs/${slug}">`
  - [ ] `<script type="application/ld+json">` (Article schema)

### ✅ 404 Page
- [ ] Visit http://localhost:3000/blogs/non-existent-blog
- [ ] Page displays "Blog not found" message
- [ ] DevTools → Head section contains:
  - [ ] `<title>Page Not Found | EdMarg</title>`
  - [ ] `<meta name="robots" content="noindex, follow">`

### ✅ Sitemap
- [ ] Visit http://localhost:3000/sitemap.xml
- [ ] Browser shows XML (not download)
- [ ] Contains:
  - [ ] Homepage URL
  - [ ] `/browse-mentors` URL
  - [ ] `/blogs` listing URL
  - [ ] All blog detail URLs (if blogs exist)
  - [ ] Each URL has `<lastmod>` and `<changefreq>`

### ✅ Robots.txt
- [ ] Visit http://localhost:3000/robots.txt
- [ ] Contains:
  - [ ] `User-agent: *`
  - [ ] `Allow: /`
  - [ ] `Disallow: /admin`
  - [ ] `Disallow: /api`
  - [ ] `Sitemap: https://yourdomainname.com/sitemap.xml`

### ✅ Image Alt Text
- [ ] Visit any blog detail page
- [ ] DevTools → Elements → Find `<img>` tags
- [ ] All images have `alt={blog.title}`
- [ ] Images have `loading="lazy"`

### ✅ Social Media Preview
- [ ] Visit https://www.opengraph.xyz/
- [ ] Paste localhost blog URL (or use production after deploy)
- [ ] Verify preview shows title, description, image

## Production Deployment Steps

### 🔧 Configuration

- [ ] Update `.env.local` with production NEXT_PUBLIC_SITE_URL:
  ```env
  NEXT_PUBLIC_SITE_URL=https://yourdomain.com
  ```

- [ ] Verify `NEXT_PUBLIC_BACKEND_URL` points to production API:
  ```env
  NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
  # or wherever your production API is hosted
  ```

### 🚀 Build & Deploy

- [ ] Run `npm run build` in frontend directory
- [ ] Confirm build succeeds with no errors
- [ ] Deploy frontend to your hosting:
  - [ ] Vercel: `vercel deploy`
  - [ ] Render: Push to main branch
  - [ ] Other host: Follow your deployment process

### ✅ Post-Deployment Verification

- [ ] Access production URL: https://yourdomain.com/blogs
- [ ] Verify blog listing page loads
- [ ] Open DevTools → check meta tags present
- [ ] Test blog detail page links
- [ ] Check sitemap accessible: https://yourdomain.com/sitemap.xml
- [ ] Check robots.txt accessible: https://yourdomain.com/robots.txt

## Search Engine Submission

### 📤 Google Search Console Setup

1. [ ] Go to https://search.google.com/search-console/
2. [ ] Add your domain (if not already added)
3. [ ] Navigate to **Sitemaps** section
4. [ ] Enter sitemap URL: `https://yourdomain.com/sitemap.xml`
5. [ ] Click "Submit"
6. [ ] Wait for Google to crawl (24-48 hours)
7. [ ] Check **Coverage** to see indexed blogs

### 📤 Bing Webmaster Tools

1. [ ] Go to https://www.bing.com/webmasters/
2. [ ] Add your domain
3. [ ] Go to **Sitemaps**
4. [ ] Submit: `https://yourdomain.com/sitemap.xml`

### 📤 Optional: Other Search Engines

- [ ] Yandex Webmaster: https://webmaster.yandex.com/
- [ ] Baidu Search Console: https://zhanzhang.baidu.com/

## Testing (Production URLs)

### 🔍 Google Structured Data Test

- [ ] Visit https://search.google.com/test/rich-results
- [ ] Paste production blog detail URL: `https://yourdomain.com/blogs/sample-slug`
- [ ] Verify "Article" appears as valid type
- [ ] Verify all fields highlighted:
  - [ ] Headline ✓
  - [ ] Description ✓
  - [ ] Image ✓
  - [ ] Author ✓
  - [ ] Date Published ✓

### 🔍 Meta Tags Validation

- [ ] Visit blog page on production
- [ ] Open DevTools (F12) → Elements → Head
- [ ] Verify all expected meta tags present:
  - [ ] `<title>`
  - [ ] `<meta name="description">`
  - [ ] `<meta property="og:...">`
  - [ ] `<meta name="twitter:...">`
  - [ ] `<link rel="canonical">`
  - [ ] `<script type="application/ld+json">`

### 📱 Mobile SEO

- [ ] Visit https://search.google.com/test/mobile-friendly
- [ ] Paste your blog URL
- [ ] Verify "Page is mobile-friendly" ✓

### 🎨 Social Media Preview

- [ ] Blog URL OpenGraph: https://www.opengraph.xyz/
- [ ] Blog URL Twitter: https://cards-dev.twitter.com/validator
- [ ] Verify correct title, description, image shown

## Performance Monitoring

### 📊 Google Search Console
- [ ] Monitor **Performance** tab:
  - [ ] Click through rate (CTR)
  - [ ] Impressions
  - [ ] Average position in search results
- [ ] Monitor **Coverage**:
  - [ ] Valid pages
  - [ ] Error pages (should be 0)
  - [ ] Warnings (should be minimal)

### 📊 Google Analytics 4
- [ ] Set up GA4 if not already configured
- [ ] Monitor **Pages and screens**:
  - [ ] `/blogs` page traffic
  - [ ] `/blogs/[slug]` traffic
- [ ] Check **Engagement**:
  - [ ] Bounce rate
  - [ ] Session duration
  - [ ] Scroll depth

### ⚡ Performance Metrics
- [ ] Use https://pagespeed.web.dev/:
  - [ ] Paste blog URL
  - [ ] Target SEO score: 90+
  - [ ] Target Performance score: 80+

## Ongoing Maintenance

### 📅 Weekly Tasks
- [ ] Monitor Google Search Console for errors
- [ ] Check blogs appearing in search results
- [ ] Verify sitemap is being crawled

### 📅 Monthly Tasks
- [ ] Check Google Analytics for blog traffic trends
- [ ] Review top-performing blogs
- [ ] Monitor 404 errors in Search Console

### 📅 Quarterly Tasks
- [ ] Run Lighthouse audit on blog pages
- [ ] Review meta descriptions (improve CTR if low)
- [ ] Check for broken blog links

## Troubleshooting Guide

### Issue: Sitemap shows 404
**Solution:**
- [ ] Verify `public/robots.txt` exists
- [ ] Verify sitemap.ts is in `src/app/` directory
- [ ] Rebuild and redeploy
- [ ] Check server logs for errors

### Issue: Meta tags not appearing in production
**Solution:**
- [ ] Clear browser cache: Ctrl+Shift+Delete
- [ ] Hard refresh: Ctrl+Shift+R
- [ ] Check .env.local has correct values
- [ ] Verify JavaScript is enabled
- [ ] Use incognito window to test

### Issue: Blogs not indexed by Google
**Solution:**
- [ ] Ensure backend API is running and accessible
- [ ] Submit sitemap to Google Search Console
- [ ] Wait 24-48 hours for initial crawl
- [ ] Use "Request indexing" feature in Search Console
- [ ] Check Coverage tab for errors

### Issue: Blog images not showing in social preview
**Solution:**
- [ ] Verify image URL is fully qualified (https://...)
- [ ] Ensure image is publicly accessible
- [ ] Use 1200x630px or larger for Open Graph
- [ ] Clear Facebook cache: https://developers.facebook.com/tools/debug/

### Issue: Canonical URL points to wrong domain
**Solution:**
- [ ] Check NEXT_PUBLIC_SITE_URL in .env.local
- [ ] Must match your production domain exactly
- [ ] Rebuild and redeploy after fixing

## Rollback Plan

If issues arise after deployment:

1. [ ] Identify the issue (meta tags, sitemap, etc.)
2. [ ] Fix in code
3. [ ] Test locally
4. [ ] Rebuild: `npm run build`
5. [ ] Redeploy
6. [ ] Submit updated sitemap to Google

## Sign-Off Checklist

- [ ] All local tests passed
- [ ] Production build created
- [ ] Deployed to production
- [ ] Verified on production URL
- [ ] Submitted sitemap to Google
- [ ] Submitted sitemap to Bing
- [ ] No critical errors in console
- [ ] Blog pages appearing in search results (24-48h)
- [ ] Analytics tracking working

## Documentation Updates

- [ ] Updated QUICKSTART_SEO.md with production domain
- [ ] Updated SEO_TESTING_GUIDE.md with production URLs
- [ ] Documented any custom changes made
- [ ] Saved this checklist completion date

---

## Final Status

**Completed Date**: _______________

**Deployed By**: _______________

**Production URL**: https://_______________

**Sitemap URL**: https://_______________/sitemap.xml

**Robots.txt URL**: https://_______________/robots.txt

**Notes/Comments**:
```
[Add any notes here]
```

---

## Quick Reference

### Emergency Commands

Rollback to previous version:
```bash
# Check git history
git log --oneline

# Revert to previous commit
git checkout <commit-hash>
npm run build
npm run start
```

Rebuild from scratch:
```bash
rm -rf .next
npm run build
npm run start
```

Clear all caches:
```bash
# Browser: Ctrl+Shift+Delete
# Google: https://search.google.com/search-console/remove-urls
# Bing: https://www.bing.com/webmasters/
```

### Important URLs

- Google Search Console: https://search.google.com/search-console/
- Bing Webmaster Tools: https://www.bing.com/webmasters/
- Lighthouse: https://developers.google.com/web/tools/lighthouse
- Structured Data Test: https://search.google.com/test/rich-results
- PageSpeed Insights: https://pagespeed.web.dev/
- OpenGraph Preview: https://www.opengraph.xyz/
- Twitter Card Validator: https://cards-dev.twitter.com/validator

---

**✅ Ready for Production Deployment**
