# DMARC Policy Upgrade - Decision Log

**Date**: 2026-02-12
**Status**: ⏰ Pending (Scheduled for 2026-02-26)
**Decision**: Stay on `p=quarantine` for 2-3 weeks, then upgrade to `p=reject`

---

## 📋 Context

After setting up custom email domain `mail.llm-cost-engine.com`, we configured DMARC with `p=quarantine` policy.

**Current DMARC record:**
```
Type: TXT
Name: _dmarc.mail
Content: v=DMARC1; p=quarantine; pct=100; rua=mailto:alerts@mail.llm-cost-engine.com; ruf=mailto:alerts@mail.llm-cost-engine.com; fo=1;
```

---

## 🎯 Decision: Gradual Upgrade Path

### **Phase 1: p=quarantine (Current)**
- **Duration**: Feb 12 → Feb 26 (2 weeks)
- **Why**: Domain is brand new (created Feb 11), need to monitor legitimate senders
- **Action**: Monitor DMARC aggregate reports arriving at `alerts@mail.llm-cost-engine.com`

### **Phase 2: p=reject (Scheduled)**
- **Target Date**: ⏰ **Feb 26, 2026**
- **Condition**: All DMARC reports show 100% pass rate for SPF and DKIM
- **Why**: Maximum protection against email spoofing + best deliverability score

---

## ✅ What to Check Before Upgrading

Before changing to `p=reject`, verify:

1. **DMARC Reports Analysis** (arriving at `alerts@mail.llm-cost-engine.com`):
   - [ ] 100% SPF pass rate
   - [ ] 100% DKIM pass rate
   - [ ] No legitimate emails failing authentication

2. **Resend Dashboard**:
   - [ ] All emails delivered successfully
   - [ ] No bounces or DMARC failures

3. **Mail-tester Score**:
   - [ ] Current score with p=quarantine: Should be ~8/10
   - [ ] Expected score with p=reject: ~9/10

---

## 🔧 How to Upgrade (After Feb 26)

### Step 1: Update Cloudflare DNS

Change the DMARC record on Cloudflare:

**From:**
```
v=DMARC1; p=quarantine; pct=100; rua=mailto:alerts@mail.llm-cost-engine.com; ruf=mailto:alerts@mail.llm-cost-engine.com; fo=1;
```

**To:**
```
v=DMARC1; p=reject; pct=100; rua=mailto:alerts@mail.llm-cost-engine.com; ruf=mailto:alerts@mail.llm-cost-engine.com; fo=1;
```

### Step 2: Test with mail-tester.com

Send test email and verify score improves to 9/10.

### Step 3: Monitor for 48 hours

Watch for any delivery issues or failures.

---

## 📊 Expected Impact

| Metric | Before (quarantine) | After (reject) |
|--------|---------------------|----------------|
| Mail-tester score | ~8/10 | ~9/10 |
| Spoofing protection | Medium | Maximum |
| Risk if SPF/DKIM fail | Email goes to spam | Email rejected completely |

---

## 🚨 Risks of Early Upgrade

**Why NOT upgrade to p=reject immediately:**

1. **Domain is 1 day old** - No historical data on email patterns
2. **No DMARC reports yet** - Can't verify 100% pass rate
3. **Risk of email loss** - If Resend has any config issue, emails will be REJECTED (not spam, LOST)
4. **Industry best practice** - Always gradual: none → quarantine → reject over 4-6 weeks

---

## 📅 Next Steps

- **Feb 19 (1 week)**: Check first DMARC aggregate reports
- **Feb 26 (2 weeks)**: If all reports show 100% pass, upgrade to `p=reject`
- **Feb 28 (Post-upgrade)**: Monitor deliverability for 48 hours

---

## 📧 How to Read DMARC Reports

Reports arrive at `alerts@mail.llm-cost-engine.com` as XML attachments.

**Key metrics to check:**
- `<disposition>`: Should be "none" or "quarantine"
- `<dkim>` → `<result>`: Should be "pass"
- `<spf>` → `<result>`: Should be "pass"

**Tools to parse reports:**
- https://mxtoolbox.com/DmarcReportAnalyzer.aspx
- https://dmarcian.com/dmarc-inspector/

---

**Reminder**: ⏰ **Check this file on Feb 26, 2026** and upgrade if all checks pass.

**Created**: 2026-02-12
**Author**: Claude Sonnet 4.5
**Next Review**: 2026-02-26
