# Multi-AI Collaboration Protocol

**Version**: 1.0
**Last Updated**: 2026-02-12

This document defines the standardized collaboration protocol between Claude Code and Gemini in Antigravity environment, optimized for token efficiency and cost-effectiveness.

---

## Core Principle: Token-Optimized Role Distribution

Claude Code has **more limited tokens and rate limits** compared to Gemini. The collaboration strategy maximizes Claude's effectiveness by delegating high-token-cost operations to Gemini.

### Token Cost Analysis

| Operation | Claude Token Cost | Delegate To | Reason |
|-----------|-------------------|-------------|--------|
| **Build/Test Execution** | 5K-20K+ | Gemini 100% | Huge output, repetitive |
| **Extensive Code Review** | 2K-10K+ | Gemini 80% | Requires reading many files |
| **Codebase Exploration** | 3K-15K+ | Gemini 90% | Multiple iterations, Gemini has 2M context |
| **Documentation** | 1K-5K | Gemini 90% | Repetitive, not critical |
| **Simple Development** | 1.5K-4K | Gemini 70% | CRUD, forms, mappings |
| **Complex Development** | 2K-8K | Claude 100% | Critical business logic |
| **Targeted Edits** | 200-800 | Claude 100% | Precise, low cost |
| **Debug & Problem Solving** | 1K-10K | Claude 70% / Gemini 30% | Claude orchestrates, Gemini researches |

---

## Role Definitions

### Claude Code - "Strategic Developer & Architect"

**Focus**: Quality over quantity, critical tasks only
**Token Budget**: ~25% of total workload by token, ~60% by criticality

**Responsibilities**:
- ✅ **Architecture & Design**: System design, critical decisions
- ✅ **Complex Development**: Core business logic, critical paths, state management
- ✅ **Orchestration**: Decide strategy, delegate to Gemini
- ✅ **Targeted Edits**: Precise modifications on files already read
- ✅ **Critical Reviews**: Architectural review, security review
- ✅ **Complex Debugging**: Issues requiring sophisticated tool use

**When to Intervene**:
- Core modules (auth, routing, state management, API integration)
- Critical business logic
- Refactoring that impacts architecture
- Bugs requiring deep investigation

**When NOT to Act**:
- Build/test execution (delegate to Gemini)
- Reading >3 files for research (delegate to Gemini)
- Routine code review (Gemini first pass)
- Simple/repetitive development (delegate to Gemini)

---

### Gemini - "Execution Engine & Context Specialist"

**Focus**: Volume, automation, large context operations
**Token Budget**: ~75% of total workload by token, ~40% by criticality

**Responsibilities**:
- ✅ **Build & Test Automation**: Execute and report results
- ✅ **Code Review First Pass**: Catch obvious bugs, style issues
- ✅ **Codebase Research**: Extensive searches, pattern finding
- ✅ **Simple Development**: CRUD forms, UI components, DTO mappings
- ✅ **Documentation**: Comments, README, guides
- ✅ **Context Preparation**: Read many files, create summaries for Claude
- ✅ **Log Analysis**: Analyze large log files (2M token advantage)

**When to Intervene**:
- Any operation requiring reading >3 files
- Any command output >1000 lines
- Repetitive tasks following existing patterns
- Build/test/lint operations
- Documentation generation

**Communication with Claude**:
- Write results to `.ai/handoff/gemini-to-claude.md`
- Keep summaries concise (save Claude's token budget)
- Highlight only critical findings

---

## File-Based Communication Protocol

All communication happens through standardized files in `.ai/handoff/`:

```
.ai/
├── handoff/
│   ├── claude-to-gemini.md      # Tasks from Claude to Gemini
│   ├── gemini-to-claude.md      # Results from Gemini to Claude
│   ├── shared-context.md        # Shared state and decisions
│   └── archived/
│       └── YYYY-MM-DD-HH-MM/    # Archive completed handoffs
├── context/
│   ├── build-results.md         # Build/test outputs
│   ├── codebase-search.md       # Search results
│   └── review-findings.md       # Review results
└── COLLABORATION.md             # This file
```

### Message Format: Claude → Gemini

```markdown
# Task: [Brief Title]
**Priority**: High / Medium / Low
**Estimated Tokens**: [rough estimate]
**Date**: YYYY-MM-DD HH:MM

## Context
[Brief context - max 200 words]

## Task
[Specific, actionable task]

## Expected Output
- What format
- Where to save results
- What Claude needs to know

## Example
[If applicable]
```

### Message Format: Gemini → Claude

```markdown
# Task Completed: [Title]
**Status**: ✅ Success / ⚠️ Partial / ❌ Failed
**Date**: YYYY-MM-DD HH:MM

## Summary (for Claude)
[Concise summary - max 150 words, save Claude's tokens!]

## Key Findings
- Finding 1
- Finding 2
- Finding 3

## Detailed Results
[Full results in collapsed section or separate file]

## Action Required
[What Claude should do next, if anything]
```

---

## Optimized Workflows

### Workflow 1: New Feature (Complex)

```
1. Claude   → Read requirements, create architectural plan (500 tokens)
2. Claude   → Write task to .ai/handoff/claude-to-gemini.md
              "Research similar patterns in codebase, summarize in 200 words"
3. Gemini   → Extensive codebase search, write summary (saves Claude 5K tokens)
4. Claude   → Read summary, develop core logic (2K tokens)
5. Claude   → Delegate UI/forms to Gemini via handoff
6. Gemini   → Develop UI following patterns (saves Claude 3K tokens)
7. Gemini   → Execute build & tests, report in .ai/context/build-results.md
8. Claude   → Read report, fix critical issues if needed (1K tokens)
9. Gemini   → Code review first pass
10. Claude  → Final architectural review (500 tokens)

CLAUDE TOTAL: ~4K tokens instead of ~15K+
SAVING: 73%
```

### Workflow 2: Bug Fix

```
1. Claude   → Analyze issue, hypothesize causes (500 tokens)
2. Claude   → Delegate search to Gemini
3. Gemini   → Search occurrences, write summary
4. Claude   → Read summary, identify root cause (1K tokens)
5. Claude   → Implement fix with targeted Edit (500 tokens)
6. Gemini   → Run regression tests
7. Claude   → Verify results (200 tokens)

CLAUDE TOTAL: ~2.2K tokens instead of ~8K+
SAVING: 72%
```

### Workflow 3: Extensive Refactoring

```
1. Claude   → Plan refactoring, identify critical files (800 tokens)
2. Gemini   → Create dependency map using large context
3. Claude   → Refactor core components (3K tokens)
4. Gemini   → Apply repetitive refactoring to other files
5. Gemini   → Execute full build & test suite
6. Claude   → Review results, fix breaking changes (1.5K tokens)

CLAUDE TOTAL: ~5.3K tokens instead of ~20K+
SAVING: 73%
```

### Workflow 4: Emergency Bug (Production)

```
1. Claude   → Immediate analysis & hotfix (2K tokens)
2. Gemini   → (parallel) Analyze full production logs
3. Gemini   → Deploy & monitor (if automated)
4. Claude   → Verify fix effectiveness (500 tokens)
5. Gemini   → Write post-mortem documentation

CLAUDE TOTAL: ~2.5K tokens (fast resolution)
```

---

## Golden Rules

### For Claude Code:
1. **If operation reads >3 files → delegate to Gemini**
2. **If command output >1000 lines → delegate to Gemini**
3. **If task is repetitive/mechanical → delegate to Gemini**
4. **If task is critical/architectural → keep it**
5. **Always orchestrate, rarely execute repetitive tasks**

### For Gemini:
1. **Keep summaries for Claude under 200 words**
2. **Save detailed results in separate files**
3. **Highlight only critical findings**
4. **Follow existing project patterns (read CLAUDE.md)**
5. **Report results in standardized format**

### For Both:
1. **Use handoff files for communication**
2. **Archive completed handoffs (keep .ai/handoff/ clean)**
3. **Update shared-context.md with important decisions**
4. **Document workflow deviations for future improvement**

---

## Initialization Protocol

### For Claude Code (Automatic)

Claude Code reads this file automatically via CLAUDE.md reference. No manual initialization needed.

**To verify collaboration mode:**
```
> Am I in collaboration mode with Gemini?
```

Claude should respond acknowledging the protocol and current handoff status.

### For Gemini (Manual Initialization)

**At start of new session, run:**

```
Read .ai/COLLABORATION.md and acknowledge your role as Execution Engine.

Summary of my role:
- Build/test automation
- Code review first pass
- Codebase research
- Simple development
- Documentation
- Context preparation for Claude

I will:
- Check .ai/handoff/claude-to-gemini.md for tasks
- Write results to .ai/handoff/gemini-to-claude.md
- Keep summaries concise (<200 words)
- Save Claude's token budget

Ready for collaboration.
```

---

## Project-Specific Context (HcClientWow)

### Tech Stack
- **Framework**: Angular 18.2.x
- **Monorepo**: Nx 20.3.x
- **UI**: DevExtreme 24.2.x
- **Architecture**: NgModule (PMS), Standalone (SPA/POS)

### Critical Modules (Claude Priority)
- Authentication & Authorization (`libs/core/src/lib/auth/`)
- Routing System (`apps/hc-web-pms/src/app/hc-app-routes.ts`)
- State Management (various `*-model.service.ts`)
- API Integration (`libs/api-services/`)

### Delegate to Gemini
- DevExtreme form generation
- DTO mapping classes
- Theme/SCSS modifications
- i18n translations
- Build/test execution

### Build Commands
```bash
# PMS build (delegate to Gemini)
npx nx build hc-web-pms --configuration=staging

# Run tests (delegate to Gemini)
npx nx test hc-web-pms

# Lint (delegate to Gemini)
npx nx lint hc-web-pms
```

---

## Template: Generic Project (Reusable)

For **new projects or other codebases**, Gemini should:

1. **Read project structure**
   ```bash
   ls -R > .ai/context/project-structure.txt
   ```

2. **Identify tech stack** (package.json, requirements.txt, etc.)

3. **Map critical vs routine modules**
   - Critical → Claude
   - Routine → Gemini

4. **Update shared-context.md** with findings

5. **Propose role distribution** to Claude for approval

---

## Metrics & Optimization

Track collaboration effectiveness:

```markdown
# .ai/metrics/YYYY-MM.md

## Token Savings
- Claude tokens used: X
- Claude tokens saved: Y (delegated to Gemini)
- Saving rate: Z%

## Workflow Distribution
- Workflows Claude-only: N
- Workflows with Gemini: M
- Gemini automation tasks: K

## Issues
- [Date] Issue description & resolution
```

Review monthly to optimize the protocol.

---

## FAQ

**Q: What if Gemini doesn't have file access in Antigravity?**
**A**: Gemini can still receive file contents via handoff (Claude copies relevant content). Less efficient but works.

**Q: Can other AIs join (e.g., GPT-5)?**
**A**: Yes. Add GPT-5 for:
- Architectural design review
- Algorithm reasoning
- Documentation quality review

Define similar handoff protocol in `.ai/handoff/gpt-to-claude.md`.

**Q: What if Claude and Gemini disagree?**
**A**: Human developer (you) is the final decision-maker. Document decision in `shared-context.md`.

**Q: How to handle conflicts in handoff files?**
**A**: Use timestamped sections. Latest timestamp wins. Archive resolved handoffs.

---

## Version History

- **v1.0** (2026-02-12): Initial protocol based on token cost analysis
