# Feature Spec: UX/UI Polish & High-Context Fix

**Objective**: Elevate the visual quality of the Chatbot Simulator to a "Premium/Enterprise" standard and fix a logic gap in model recommendations.

## 1. Visual Polish (Sidebar)
The current "Recommended" badge (🎯) in the sidebar interacts poorly with the model name text.

**Requirements**:
- **Spacing**: Add margin (`ml-2` or `gap-2`) between the Model Name and the Badge.
- **Alignment**: Ensure visual separation so it doesn't look like a typo or rendering glitch.
- **Target File**: `src/app/engines/chatbot-simulator/chatbot-simulator.component.html`

## 2. Visual Polish (Terminal Export)
The current Terminal Export section uses a bright "Neon Green" (`text-green-400`) which clashes with the sophisticated dark/indigo theme of the app.

**Requirements**:
- **Color Palette**: Switch from standard green to **Emerald** (`text-emerald-400` / `text-emerald-300`).
- **Aesthetic**: This slight shift reduces the "hacker script" vibe and aligns better with modern enterprise dashboards (e.g., Vercel, Stripe).
- **Target File**: `src/app/engines/chatbot-simulator/chatbot-simulator.component.html`

## 3. Logic Fix (High Context Recommendations)
Gemini 3 Pro is currently not being recommended even when Input Tokens are extremely high (>100k), which is incorrect for a Pro model.

**Requirements**:
- **Condition**: In `isRecommendedForContext()`, the High Context block (>100k tokens) must explicitly check for `gemini-3-pro` (or ensuring the `pro` string match works as intended for this specific ID).
- **Expected Behavior**: If inputs > 100k, Gemini 3 Pro must show the 🎯 badge.
- **Target File**: `src/app/engines/chatbot-simulator/chatbot-simulator.component.ts`

## 4. Deliverables
- [ ] Code changes applied.
- [ ] Verified via Browser (Sidebar spacing clean, Terminal color softer, Gemini 3 Pro badge active on high context).
