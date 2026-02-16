# 🧪 Pre-Launch Test Checklist

**Esegui questi test PRIMA di deployare in produzione.**

---

## ✅ CRITICAL TESTS (Blockers per launch)

### 1. Analytics Tracking (Vercel Analytics)

**Setup** (2 min - auto-configured):
```bash
# Vercel Analytics is FREE and auto-enabled on Vercel deploys
# 1. Deploy to Vercel (analytics auto-injected)
# 2. Enable in Vercel dashboard: Project Settings → Analytics → Enable
# 3. Done! ✅
```

**Test** (dopo deploy):
```
1. Deploy to Vercel
2. Visit https://llm-cost-engine.com/tools/chatbot-simulator
3. Vercel Dashboard → Analytics → Should see 1 pageview
4. Click on a model → Should track "Tool Usage" event
5. Click bell icon → enter email → submit
6. Vercel Dashboard → Should see "Email Signup" event
```

**Expected**:
- ✅ Pageview tracked automatically
- ✅ Custom events visible in Vercel Analytics dashboard
- ✅ Real-time visitor count

**Dashboard**: https://vercel.com/mattipuy/llm-cost-engine/analytics

---

### 2. Email Alerts Flow (CRITICAL)

**Test A: New Subscription**:
```
1. Visit https://llm-cost-engine.com/tools/chatbot-simulator
2. Click bell icon (🔔) on any model card
3. Modal opens → Enter your real email: mat.mazzoli@gmail.com
4. Click "Get Free Price Alerts"
5. Check inbox → Verify verification email received
6. Subject: "Verify your Price Alert for {model}"
7. Click verification link
8. Should see success page
```

**Expected**:
- ✅ Email received within 30 seconds
- ✅ From: "LLM Cost Engine <alerts@mail.llm-cost-engine.com>"
- ✅ Verification link works
- ✅ Success message shown after verification

**Test B: Resend Domain Verification** (già fatto dalla sessione precedente):
```
1. Login to Resend: https://resend.com
2. Dashboard → Domains
3. Verify mail.llm-cost-engine.com is "Verified" status
4. If not: Add DNS records (DKIM, SPF, DMARC)
```

**Expected**:
- ✅ Domain status: "Verified" (green checkmark)
- ✅ Recent sends visible in dashboard

---

### 3. Model Landing Pages (SEO)

**Test URLs** (all 15 models):
```
https://llm-cost-engine.com/models/gpt-4o
https://llm-cost-engine.com/models/claude-3.5-sonnet
https://llm-cost-engine.com/models/gemini-1.5-pro
https://llm-cost-engine.com/models/deepseek-v3
https://llm-cost-engine.com/models/gpt-5-mini
... (10 more - see full list in llm-pricing.json)
```

**Test Each Page**:
```
1. Visit URL
2. Verify: Page loads (no 404)
3. Verify: Breadcrumbs show (Home → Models → Model Name)
4. Verify: Hero section with pricing grid
5. Verify: "Track Price Drops" button opens modal
6. Verify: Comparison tables populated
7. View source → Search for "schema.org" → Verify Product + Breadcrumb markup present
```

**SEO Validation** (pick 1-2 models):
```
1. Google Rich Results Test: https://search.google.com/test/rich-results
2. Input: https://llm-cost-engine.com/models/gpt-4o
3. Verify: "Product" schema detected ✅
4. Verify: "BreadcrumbList" schema detected ✅
5. No errors
```

**Expected**:
- ✅ All 15 pages load correctly
- ✅ Schema.org markup valid (Google test passes)
- ✅ Meta tags present (view-source check)

---

### 4. Blog Manifesto Page

**Test**:
```
1. Visit https://llm-cost-engine.com/blog/how-we-calculate-llm-tco
2. Verify: Page loads with full content
3. Verify: Breadcrumbs work
4. Verify: "Open the Calculator" CTA links to /tools/chatbot-simulator
5. Verify: Math formula renders correctly (green code blocks)
6. View source → Search for "BlogPosting" → Verify Article schema present
```

**Expected**:
- ✅ Full manifesto content visible
- ✅ Schema.org BlogPosting markup present
- ✅ All internal links work

---

## 🟡 IMPORTANT TESTS (Non-blockers but recommended)

### 5. All 4 Tools Load & Function

**Chatbot Simulator**:
```
1. Visit /tools/chatbot-simulator
2. Adjust sliders → Cost updates in real-time
3. Select multiple models → Comparison table populates
4. Enable routing toggle → Secondary model selector appears
5. Click "Track Price Drops" on a model → Modal opens
```

**Caching ROI**:
```
1. Visit /tools/caching-roi
2. Select Claude 3.5 Sonnet
3. Adjust cache hit rate slider
4. Verify: Savings calculation updates
5. Verify: "90% cache discount" badge shows
```

**Batch API**:
```
1. Visit /tools/batch-api
2. Select GPT-4o or Claude (batch-capable models)
3. Adjust volume sliders
4. Verify: Batch savings calculated
5. Verify: Break-even point shown
```

**Context Window**:
```
1. Visit /tools/context-window
2. Enter token requirement (e.g., 150000)
3. Verify: Models turn green/red based on fit
4. Verify: Gemini shows 1M context advantage
```

**Expected**:
- ✅ All tools responsive and interactive
- ✅ No console errors (open DevTools → Console)
- ✅ Analytics "Tool Usage" event fires for each

---

### 6. Mobile Responsiveness

**Test on iPhone/Android** (or Chrome DevTools):
```
1. Open DevTools → Toggle device toolbar (Cmd+Shift+M)
2. Select "iPhone 12 Pro"
3. Visit each tool
4. Verify: Sliders work on touch
5. Verify: Tables scroll horizontally
6. Verify: Modals are full-screen on mobile
7. Verify: No text overflow
```

**Expected**:
- ✅ Fully usable on mobile (no zoom required)
- ✅ Touch interactions smooth

---

### 7. Performance (Lighthouse)

**Test**:
```
1. Open DevTools → Lighthouse tab
2. Run audit on /tools/chatbot-simulator
3. Verify scores:
   - Performance: 90+ (100 ideal)
   - Accessibility: 100
   - Best Practices: 100
   - SEO: 100
```

**Expected**:
- ✅ All green scores
- ✅ No major warnings

---

## 🟢 OPTIONAL TESTS (Nice to have)

### 8. Cross-Browser Compatibility

**Test browsers**:
- ✅ Chrome (primary)
- ✅ Safari
- ✅ Firefox
- ✅ Edge

**Expected**:
- All tools work identically across browsers

---

### 9. Price Alert Unsubscribe

**Test**:
```
1. After subscribing + verifying email
2. Wait for price drop email (or simulate via Supabase function)
3. Email should have unsubscribe link at bottom
4. Click unsubscribe → Should see confirmation page
5. Verify: No more emails received
```

**Expected**:
- ✅ One-click unsubscribe works
- ✅ Confirmation message shown

---

## 🚨 IF TESTS FAIL

### Analytics not tracking?
```
1. Check Vercel Dashboard → Analytics → Is it enabled?
2. Enable if needed: Project Settings → Analytics → Toggle ON
3. Check browser console: Any errors?
4. Verify script loads: DevTools → Network → Filter "_vercel"
5. Wait 5-10 min for data to appear (not real-time for free tier)
```

### Email not received?
```
1. Check Resend dashboard → Recent sends → Any failures?
2. Check spam folder
3. Verify domain status: mail.llm-cost-engine.com = "Verified"
4. Check Supabase logs: Edge function errors?
5. Try different email address (not Gmail if Gmail blocks)
```

### Model pages 404?
```
1. Check Vercel deployment logs
2. Verify route in app.routes.ts: /models/:modelId
3. Check model ID in URL matches llm-pricing.json (e.g., "gpt-4o" not "gpt4o")
```

### Schema.org markup invalid?
```
1. Check Google Rich Results Test output for specific errors
2. Verify JsonLdService.injectCustomSchema() called in ngOnInit
3. View page source → Search for <script type="application/ld+json">
4. Copy JSON to https://validator.schema.org/ for detailed errors
```

---

## ✅ FINAL CHECKLIST (Before HN Post)

- [ ] All CRITICAL tests passing (Analytics, Emails, Landing Pages, Blog)
- [ ] All 4 tools working (Chatbot, Caching, Batch, Context)
- [ ] Mobile responsive (tested on real device or DevTools)
- [ ] Lighthouse 100/100 (or 90+ all categories)
- [ ] Schema.org markup valid (Google Rich Results Test passes)
- [ ] Email alerts tested end-to-end (subscribe → verify → receive alert)
- [ ] Plausible dashboard showing events
- [ ] No console errors on any page
- [ ] All internal links work (breadcrumbs, CTAs, model links)
- [ ] Unsubscribe tested (one-click works)

**If all ✅ above → Ready to launch HN post 🚀**

---

## 📞 SUPPORT

**If blockers encontered**:
1. Check Vercel deployment logs: https://vercel.com/mattipuy/llm-cost-engine/deployments
2. Check Supabase logs: https://supabase.com/dashboard → Logs → Edge Functions
3. Check Resend dashboard: https://resend.com/dashboard → Recent sends
4. Check Plausible dashboard: https://plausible.io/llm-cost-engine.com

**Common fixes**:
- Clear browser cache (Cmd+Shift+R)
- Try incognito mode (rules out extensions)
- Check network tab for failed requests

---

**Test Duration**: ~20-30 minutes for full checklist
**Critical Tests Only**: ~10 minutes

Good luck! 🎯
