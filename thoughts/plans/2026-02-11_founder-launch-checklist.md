# Founder Launch Checklist: HN + Reddit

**Owner**: Mattia (Founder)
**Target Date**: 2026-02-13 (Wednesday) 14:30 CET
**Purpose**: Pre-flight checklist to ensure nothing is missed

---

## ✅ Pre-Launch Phase (Day -1)

### Planning & Preparation
- [ ] Review and approve `/thoughts/plans/2026-02-11_hn-reddit-launch.md`
- [ ] Confirm team availability for 2-hour rapid response window (14:30-16:30 CET)
- [ ] Verify no major competitor launches scheduled for same day
- [ ] Check calendar: no conflicting meetings during launch window
- [ ] Set up "Do Not Disturb" block on calendar for launch hours

### Agent Coordination
- [ ] Dispatch Phase 1 agents (research) via `multi-agent-coordinator`
- [ ] Review Phase 1 outputs in `/thoughts/research/`:
  - [ ] `2026-02-11_show-hn-competitive-analysis.md`
  - [ ] `2026-02-11_hn-reddit-audience-profiling.md`
  - [ ] `2026-02-11_launch-timing-trends.md`
- [ ] Dispatch Phase 2 agents (content creation)
- [ ] Review Phase 2 outputs in `/thoughts/plans/`:
  - [ ] `2026-02-11_hn-content-final.md` (title + comment + responses)
  - [ ] `2026-02-11_reddit-content-final.md` (post + responses)
- [ ] Verify SEO changes deployed to production
- [ ] Review Phase 3 output:
  - [ ] `2026-02-11_launch-metrics-monitoring.md` (tracking setup)

### Technical Verification
- [ ] Blog post live at: `/blog/how-we-calculate-llm-tco`
- [ ] Open Graph meta tags rendering correctly (test with [opengraph.xyz](https://www.opengraph.xyz/))
- [ ] Schema.org markup validated (test with [Schema Markup Validator](https://validator.schema.org/))
- [ ] Social preview image displays on Twitter/Reddit
- [ ] Page speed <2s on desktop (test with [PageSpeed Insights](https://pagespeed.web.dev/))
- [ ] Mobile-friendly (test with [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly))
- [ ] All calculator tools functional
- [ ] Price alert subscription form working
- [ ] UTM parameters tested:
  - [ ] `?utm_source=hackernews&utm_medium=show_hn&utm_campaign=feb2026_launch`
  - [ ] `?utm_source=reddit&utm_medium=localllama&utm_campaign=feb2026_launch`

### Analytics Setup
- [ ] Google Analytics tracking verified
- [ ] Real-time dashboard accessible
- [ ] UTM campaign tracking enabled
- [ ] Conversion goals configured:
  - [ ] Price alert signup
  - [ ] Calculator usage
  - [ ] Blog post time-on-page (>2 min)
- [ ] Supabase database accessible for signup tracking
- [ ] Notification webhook configured (Slack/Discord/Email)

### Content Preparation
- [ ] HN title selected from 5 variants (copy to notepad)
- [ ] HN founder comment copied to notepad (ready to paste)
- [ ] Reddit title selected from 5 variants (copy to notepad)
- [ ] Reddit post body copied to notepad (ready to paste)
- [ ] Pre-written responses loaded in separate doc (10 HN + 10 Reddit)
- [ ] Mobile device charged (for notifications)
- [ ] Backup device available (tablet/laptop)

### Team Coordination
- [ ] Co-founder/helper on standby (if applicable)
- [ ] Communication channel open (Slack/Discord)
- [ ] Response protocol documented (who answers what)
- [ ] Escalation chain defined (data disputes → founder)
- [ ] Backup person identified (if founder unavailable)

### Data Verification
- [ ] Top 5 models' pricing verified against official docs:
  - [ ] GPT-4o ($2.50 input, $10.00 output)
  - [ ] Claude 3.5 Sonnet ($3.00 input, $15.00 output)
  - [ ] Gemini 2.0 Flash ($0.10 input, $0.40 output)
  - [ ] DeepSeek V3 ($0.27 input, $1.10 output)
  - [ ] Llama 3.3 70B (varies by provider)
- [ ] "Last verified" date current (today's date)
- [ ] Public JSON accessible: `/data/llm-pricing.json`
- [ ] JSON format valid (no syntax errors)

### Backup Planning
- [ ] Vercel dashboard accessible (check auto-scaling limits)
- [ ] Backup launch window identified (if primary fails)
- [ ] Alternative subreddit options documented (r/programming, r/MachineLearning)
- [ ] Rollback plan if critical bug found
- [ ] Cloudflare caching enabled (optional performance boost)

---

## 🚀 Launch Day (Day 0)

### T-60 Minutes (13:30 CET)
- [ ] Final breaking news check (no OpenAI/Anthropic announcements today)
- [ ] Vercel deployment status: green
- [ ] Team check-in: all available
- [ ] Mobile notifications enabled
- [ ] Coffee/water ready (stay alert!)

### T-30 Minutes (14:00 CET)
- [ ] Smoke test: Load blog post from production
- [ ] Smoke test: Click UTM links, verify tracking
- [ ] HN account logged in
- [ ] Reddit account logged in
- [ ] Content pasted into notepad (ready to copy)
- [ ] Timer ready (for founder comment at T+2)

### T-15 Minutes (14:15 CET)
- [ ] Close all distracting tabs
- [ ] Open HN Submit page: [news.ycombinator.com/submit](https://news.ycombinator.com/submit)
- [ ] Open Reddit Submit page: [reddit.com/r/LocalLLaMA/submit](https://www.reddit.com/r/LocalLLaMA/submit)
- [ ] Open Analytics dashboard (real-time view)
- [ ] Open Supabase dashboard (subscription tracking)
- [ ] Final team sync: "Going live in 15 minutes"

### T-0 (14:30 CET) - LAUNCH SEQUENCE
- [ ] **ACTION**: Submit HN Show HN
  - [ ] Title: `[PASTE FROM NOTEPAD]`
  - [ ] URL: `https://llm-cost-engine.vercel.app/blog/how-we-calculate-llm-tco?utm_source=hackernews&utm_medium=show_hn&utm_campaign=feb2026_launch`
  - [ ] Submit
- [ ] **ACTION**: Save HN submission URL (bookmark it)
- [ ] **ACTION**: Start timer (2 minutes for first comment)

### T+2 Minutes (14:32 CET)
- [ ] **ACTION**: Post HN first comment
  - [ ] Paste from notepad
  - [ ] Review (no typos, links work)
  - [ ] Submit
- [ ] Verify comment posted correctly
- [ ] Refresh HN page (check upvote count)

### T+30 Minutes (15:00 CET)
- [ ] **ACTION**: Submit Reddit post to r/LocalLLaMA
  - [ ] Title: `[PASTE FROM NOTEPAD]`
  - [ ] Body: `[PASTE FROM NOTEPAD]`
  - [ ] Flair: "Discussion" or "Resource" (if applicable)
  - [ ] Submit
- [ ] **ACTION**: Save Reddit submission URL (bookmark it)
- [ ] Verify post live

### T+X (Continuous) - Active Monitoring
- [ ] Check HN every 5 minutes (first hour)
- [ ] Check Reddit every 5 minutes (first hour)
- [ ] Respond to every comment within 10 minutes:
  - [ ] Read comment
  - [ ] Check pre-written responses (use if applicable)
  - [ ] Draft custom response (if new topic)
  - [ ] Review tone (no defensiveness, no marketing)
  - [ ] Post response
- [ ] Track metrics:
  - [ ] HN upvotes (target: 10 in first hour)
  - [ ] Reddit upvotes (target: 5 in first hour)
  - [ ] Real-time visitors (target: 100 in first hour)
  - [ ] Alert signups (target: 10 in first hour)

### T+60 Minutes (15:30 CET) - First Hour Report
- [ ] Generate hour 1 report:
  - [ ] HN upvotes: `___`
  - [ ] Reddit upvotes: `___`
  - [ ] Total visitors: `___`
  - [ ] Alert signups: `___`
  - [ ] Comments: `___` (HN + Reddit)
  - [ ] Sentiment: Positive / Neutral / Critical
- [ ] Decision: Continue or adjust strategy
- [ ] Team update: Share metrics

### T+120 Minutes (16:30 CET) - End of Rapid Response
- [ ] Generate hour 2 report (same metrics as hour 1)
- [ ] Evaluate success tier:
  - [ ] Tier 1: HN 30+, Reddit 50+ → Basic success
  - [ ] Tier 2: HN 80+ (front page), Reddit 100+ → Target success
  - [ ] Tier 3: HN 150+ (top 10), Reddit 200+ → Home run
- [ ] Reduce monitoring frequency (now every 30 minutes)
- [ ] Thank team for support

### T+4 Hours (18:30 CET) - Evening Check
- [ ] Generate 4-hour report
- [ ] Respond to accumulated comments
- [ ] Adjust strategy if momentum stalled
- [ ] Set up overnight monitoring (every 2-4 hours)

---

## 📊 Post-Launch Phase (Day +1 to +2)

### Day 1 Morning (09:00 CET)
- [ ] Generate 24-hour report:
  - [ ] HN total upvotes: `___`
  - [ ] Reddit total upvotes: `___`
  - [ ] Total visitors (Day 1): `___`
  - [ ] Alert signups (Day 1): `___`
  - [ ] Comments: `___`
  - [ ] Top traffic sources: `___`
  - [ ] Conversion rate (visitors → signups): `___`%
- [ ] Respond to overnight comments
- [ ] Identify top 3 feedback themes
- [ ] Log feature requests in GitHub issues

### Day 1 Afternoon (12:00-18:00 CET)
- [ ] Continue monitoring (every 4 hours)
- [ ] Respond to new comments
- [ ] Engage with anyone who shared the link elsewhere (Twitter, LinkedIn)
- [ ] Thank high-quality commenters (upvote + reply)

### Day 2 Morning (09:00 CET) - 48-Hour Wrap-Up
- [ ] Generate final 48-hour report:
  - [ ] HN final upvotes: `___`
  - [ ] Reddit final upvotes: `___`
  - [ ] Total visitors (48hr): `___`
  - [ ] Alert signups (48hr): `___`
  - [ ] Conversion rate: `___`%
  - [ ] Backlinks generated: `___`
  - [ ] Media mentions: `___`
  - [ ] Feature requests logged: `___`
- [ ] Post-mortem analysis:
  - [ ] What worked well?
  - [ ] What didn't work?
  - [ ] Unexpected feedback?
  - [ ] Would we change the title/comment?
- [ ] Document learnings in `/thoughts/decisions/2026-02-13_launch-post-mortem.md`

### Follow-Up Actions (Day 2+)
- [ ] Send thank-you email to alert subscribers:
  - Subject: "Thanks for 500 signups — here's what's next"
  - Body: Summary of launch, roadmap preview, no hard sell
- [ ] Respond to GitHub issues from feature requests
- [ ] Update pricing data if any disputes were raised
- [ ] Reach out to blogs/newsletters that mentioned us (backlink outreach)
- [ ] Cross-post success story (if Tier 2+) to r/SideProject or Indie Hackers
- [ ] Update CLAUDE.md with launch lessons learned
- [ ] Schedule follow-up Reddit AMA (if Tier 2+ success, wait 2-4 weeks)

---

## ⚠️ Emergency Procedures

### If Traffic Spike Crashes Site
1. [ ] Check Vercel dashboard: Is auto-scaling active?
2. [ ] Check error logs: What's failing?
3. [ ] If Edge Functions timing out: Increase timeout or add caching
4. [ ] If database overloaded: Check Supabase connection pool
5. [ ] Post update on HN/Reddit: "We're seeing high traffic, working on it"
6. [ ] Enable Cloudflare caching as emergency fallback
7. [ ] Escalate to `devops-engineer` agent if needed

### If Data Accuracy Disputed
1. [ ] Acknowledge immediately: "Thanks for catching that, verifying now"
2. [ ] Check official pricing docs: [provider]/pricing
3. [ ] If error confirmed:
   - [ ] Update JSON immediately
   - [ ] Deploy fix
   - [ ] Post follow-up: "Fixed, thanks for the catch. Updated within 24hr as promised"
4. [ ] If error NOT confirmed:
   - [ ] Post evidence: "Our data shows [X], sourced from [official page] on [date]. Can you share your source?"
   - [ ] Escalate to `competitive-analyst` for verification
5. [ ] Log incident in `/thoughts/decisions/` for future reference

### If Accused of Affiliate Marketing
1. [ ] Stay calm, don't get defensive
2. [ ] Use pre-written response:
   - "No vendor partnerships. Pricing JSON is public. Formula is public. Weights are constants in code. Same inputs = same output. Core design principle."
3. [ ] Link to public JSON: `/data/llm-pricing.json`
4. [ ] Link to methodology blog post
5. [ ] Offer to show code if they're still skeptical (GitHub repo if available)

### If Launch Momentum Stalls (Hour 1: <10 Upvotes)
1. [ ] Check HN /new page: Are we visible?
2. [ ] Check for shadowban: Can others see the post?
3. [ ] If visible but no traction:
   - [ ] Is title unclear? (too late to change)
   - [ ] Is timing bad? (breaking news collision)
   - [ ] Is content not resonating?
4. [ ] Activate backup plan:
   - [ ] Post to r/programming (if HN fails)
   - [ ] Share on Twitter with tech influencers
   - [ ] Post in relevant Slack/Discord communities
5. [ ] Document what went wrong for future attempts

### If Overwhelmed by Comments (>50 in first hour)
1. [ ] Prioritize critical comments (data disputes, technical questions)
2. [ ] Use pre-written responses for common questions
3. [ ] Batch similar questions: "Several people asked about [X]..."
4. [ ] Ask for help: Co-founder or `content-marketer` drafts responses
5. [ ] Accept you can't reply to everyone: Focus on high-value engagement

---

## 📋 Success Criteria Reminder

### Tier 1: Minimum Viable Success ✅
- HN: 30+ upvotes, 15+ comments
- Reddit: 50+ upvotes, 20+ comments
- Traffic: 1,000+ visitors Day 1
- Signups: 100+ alert subscribers
- No credibility damage

### Tier 2: Target Success 🎯
- HN: Front page (80+ upvotes), 30+ comments
- Reddit: 100+ upvotes, 40+ comments
- Traffic: 2,500+ visitors Day 1
- Signups: 200+ alert subscribers
- 5+ quality backlinks
- 2+ feature requests logged

### Tier 3: Exceptional Success 🚀
- HN: Top 10 (150+ upvotes), 50+ comments
- Reddit: 200+ upvotes, cross-post to r/MachineLearning
- Traffic: 5,000+ visitors Day 1
- Signups: 500+ alert subscribers
- 10+ quality backlinks
- Media pickup (TechCrunch, The Verge)
- Inbound sponsor inquiry

---

## 🎯 Final Reminders

**Tone Guidelines**:
- ✅ Technical, humble, educational
- ✅ Admit limitations ("We don't measure quality")
- ✅ Transparent about methodology
- ❌ No marketing jargon ("game-changing", "revolutionize")
- ❌ No CTAs ("subscribe now", "check us out")
- ❌ No defensiveness when criticized

**Response Time Target**: <10 minutes for first 2 hours

**Key Message**: "We open-sourced the formula so you can verify or fork it. Transparency > correctness."

**Exit Criteria**: After 48 hours, switch to passive monitoring (check 1-2x per day)

---

**Checklist Owner**: Mattia (Founder)
**Last Updated**: 2026-02-11
**Status**: READY FOR EXECUTION

**Good luck! 🚀**
