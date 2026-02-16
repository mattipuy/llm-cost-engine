# Multi-AI Collaboration Setup

**Purpose**: Token-optimized collaboration between Claude Code and Gemini.
**Status**: Production-ready, reusable across projects.
**Version**: 1.0 (2026-02-12)

---

## 🎯 What This Solves

**Problem**: Claude Code has limited tokens/rate limits compared to Gemini.

**Impact**:
- Single build = 5K-20K tokens wasted
- Code search = 3K-15K tokens wasted
- 10 builds/day = 50K-200K tokens (Claude's budget exhausted)

**Solution**: Token-optimized role distribution

| Task Type | Claude Tokens | Delegate To | Saving |
|-----------|---------------|-------------|--------|
| Build/Test | 5K-20K | Gemini | 98% |
| Code Search | 3K-15K | Gemini | 95% |
| Code Review | 2K-10K | Gemini (first pass) | 80% |
| Simple Dev | 1.5K-4K | Gemini | 70% |
| Complex Dev | 2K-8K | Claude | - |
| Architecture | 500-2K | Claude | - |

**Result**: Claude does ~25% token volume but ~60% criticality.

---

## 📦 What's Included

This system provides:

✅ **Generic initialization prompts** (work on ANY project)
✅ **File-based communication protocol** (no manual copy-paste)
✅ **Role definitions** (clear responsibilities)
✅ **Workflow templates** (proven patterns)
✅ **Portable structure** (copy to any project)

---

## 🚀 Quick Start (New Project)

### 1. Copy Structure

```bash
# Copy .ai/ directory to your project
cp -r /path/to/source/.ai/templates /your/project/.ai/
cp -r /path/to/source/.ai/COLLABORATION.md /your/project/.ai/
cp -r /path/to/source/.ai/MULTI-AI-SETUP.md /your/project/.ai/

# Create handoff structure
mkdir -p /your/project/.ai/handoff/archived /your/project/.ai/context /your/project/.ai/metrics
```

### 2. Initialize Claude Code

```bash
cd /your/project
claude

# Copy-paste ENTIRE content of:
cat .ai/templates/claude-init-prompt.md
```

**Expected response**: Claude acknowledges collaboration mode.

### 3. Initialize Gemini

Open Gemini and copy-paste ENTIRE content of:
```bash
cat .ai/templates/gemini-init-prompt.md
```

**Expected response**: Gemini reports readiness.

### 4. Start Working

Both AIs are now initialized! Work as usual - they'll collaborate automatically.

---

## ⚡ How Collaboration Works (Automatic & Transparent)

**Key Principle**: You interact naturally. Claude **automatically** decides when to delegate.

### You Always Start with Claude

```
User → Claude → (auto-delegates if needed) → Gemini → Claude → User
       ↑                                                         ↑
     Entry point                                          Final result
```

**Why start with Claude?**
- Claude is the **orchestrator** - decides what to delegate
- Gemini is the **executor** - waits for tasks from Claude
- Starting with Gemini = no one to decide delegation strategy

### Example 1: Build Execution (Automatic Delegation)

```
1. You → Claude: "Build the project and run tests"

   Claude (automatically):
   - Thinks: "Build costs 15K tokens → DELEGATE"
   - Writes: .ai/handoff/claude-to-gemini.md
   - Responds: "✅ Delegating build to Gemini (saves ~15K tokens).

                Next: Ask Gemini to 'check for pending tasks'"

2. You → Gemini: "Check for pending tasks"

   Gemini (automatically):
   - Reads: .ai/handoff/claude-to-gemini.md
   - Finds: "Build and test execution"
   - Executes: npm run build && npm test
   - Writes: .ai/handoff/gemini-to-claude.md (200 word summary)
   - Responds: "✅ Build done. Results ready for Claude."

3. You → Claude: "Read results from Gemini"

   Claude (automatically):
   - Reads: .ai/handoff/gemini-to-claude.md (200 words, not 10K!)
   - Archives: Exchange
   - Responds: "Build successful. 52 tests passed. 2 warnings:
                - AuthService.ts:45 - Deprecated API
                - ApiBase.ts:120 - Deprecated method"
```

**Token saving**: 14,800 tokens (98%)

### Example 2: Simple Edit (No Delegation)

```
1. You → Claude: "Fix typo in line 45 of AuthService.ts"

   Claude (automatically):
   - Thinks: "Simple edit, ~500 tokens → KEEP"
   - Uses: Edit tool
   - Responds: "Fixed typo in AuthService.ts:45"
```

**No delegation** - Claude handled directly (efficient!)

### File Management (Overwrite vs Accumulate)

**How handoff files work**:

| File | Behavior | Purpose |
|------|----------|---------|
| `claude-to-gemini.md` | **OVERWRITE** | Only 1 active task at a time |
| `gemini-to-claude.md` | **OVERWRITE** | Only 1 active result at a time |
| `archived/*.md` | **ACCUMULATE** | History of completed exchanges |
| `shared-context.md` | **APPEND** | Long-term shared memory |

**Automatic archiving**:
- When Claude delegates new task → Previous task archived to `archived/YYYY-MM-DD-HH-MM-task.md`
- When Claude reads results → Entire exchange archived, both files cleared
- Prevents infinite file growth ✅
- Keeps workspace clean ✅

**Example archived file** (`archived/2026-02-12-15-30-build.md`):
```markdown
# Archived Exchange - Build Execution

## Task (from Claude)
Execute build and run all tests

## Results (from Gemini)
Status: ✅ Success
Build completed in 47s
All 52 tests passed
2 warnings (deprecated APIs)

## Archived At
2026-02-12 15:45:23
```

### Workflow Decision Tree (Claude's Internal Logic)

```
User → Claude: "Do something"
    ↓
┌────────────────────────────────────┐
│ Claude analyzes token cost:       │
│ - >3 file reads?                  │
│ - Output >1000 lines?             │
│ - Repetitive development?         │
└─────┬──────────────────┬───────────┘
      │                  │
   YES (High cost)    NO (Low cost)
      │                  │
      ↓                  ↓
  DELEGATE           HANDLE DIRECTLY
      │                  │
      ↓                  ↓
  Write handoff      Use tools
      ↓              (Edit, Read)
      ↓                  │
  Tell user:             ↓
  "Ask Gemini"      Done → User
      ↓
  User → Gemini
      ↓
  Gemini executes
      ↓
  Writes results
      ↓
  User → Claude
      ↓
  Claude reads
      ↓
  Archives
      ↓
  Done → User
```

**You never see this** - Claude decides automatically!

---

## 📂 Directory Structure

```
YOUR-PROJECT/
├── .ai/
│   ├── MULTI-AI-SETUP.md          ← This file (copy to new projects)
│   ├── COLLABORATION.md           ← Full protocol (copy to new projects)
│   ├── .gitignore                 ← Git rules (copy to new projects)
│   │
│   ├── templates/                 ← COPY THESE (reusable!)
│   │   ├── claude-init-prompt.md ← Full initialization for Claude
│   │   ├── gemini-init-prompt.md ← Full initialization for Gemini
│   │   └── README.md             ← Usage guide
│   │
│   ├── handoff/                   ← DO NOT COPY (session-specific)
│   │   ├── claude-to-gemini.md   ← Claude writes tasks
│   │   ├── gemini-to-claude.md   ← Gemini writes results
│   │   ├── shared-context.md     ← Shared decisions
│   │   └── archived/             ← Completed handoffs
│   │
│   ├── context/                   ← DO NOT COPY (session-specific)
│   │   ├── build-results.md      ← Build outputs
│   │   └── codebase-search.md    ← Search results
│   │
│   └── metrics/                   ← DO NOT COPY (session-specific)
│       └── 2026-02.md            ← Monthly metrics
```

---

## 🔄 How It Works

### Communication Flow

```
┌─ User ──────────────────────────────────────┐
│ "Build the project"                         │
└──────────┬───────────────────────────────────┘
           │
┌──────────▼───────────────────────────────────┐
│ Claude Code                                  │
│ • Recognizes: High token cost (5K-20K)      │
│ • Writes task to: claude-to-gemini.md       │
└──────────┬───────────────────────────────────┘
           │
┌──────────▼───────────────────────────────────┐
│ Gemini                                       │
│ • Reads: claude-to-gemini.md                │
│ • Executes: npm run build                   │
│ • Captures: 10,000 lines output             │
│ • Writes summary (<200 words) to:           │
│   gemini-to-claude.md                       │
└──────────┬───────────────────────────────────┘
           │
┌──────────▼───────────────────────────────────┐
│ Claude Code                                  │
│ • Reads: gemini-to-claude.md (200 words)    │
│ • Token cost: 200 (instead of 10,000!)      │
│ • Reports to user: "Build successful"       │
└──────────────────────────────────────────────┘

RESULT: 98% token saving (9,800 tokens saved)
```

### Role Distribution

**Claude Code - "Strategic Developer"**
- Architecture & design
- Complex business logic
- Critical debugging
- Orchestration

**Gemini - "Execution Engine"**
- Build/test automation
- Codebase searches
- Code review (first pass)
- Simple/repetitive development
- Documentation

---

## 📋 Complete Example Workflow

### Scenario: Add New Feature

**1. User Request**
> "Add a Guest CRUD module following existing patterns"

**2. Claude (Planning - 500 tokens)**
```
> I'll create the architecture. Delegating pattern research to Gemini.

[Writes to .ai/handoff/claude-to-gemini.md]
Task: Find all CRUD modules and summarize the pattern
```

**3. Gemini (Research - saves Claude 5K tokens)**
```
[Searches codebase extensively]
[Writes to .ai/handoff/gemini-to-claude.md]

Summary: Found 5 CRUD modules. Pattern:
- {Entity}Service for business logic
- {Entity}Component for UI
- {Entity}Model for state
```

**4. Claude (Core Dev - 2K tokens)**
```
[Reads 150-word summary]
> Creating GuestService, GuestModel...

[Implements core]

> Delegating UI to Gemini
[Writes task to claude-to-gemini.md]
```

**5. Gemini (UI Dev - saves Claude 3K tokens)**
```
[Creates GuestComponent following pattern]
[Writes summary to gemini-to-claude.md]
```

**6. Gemini (Build & Test - saves Claude 10K tokens)**
```
[Executes build & tests]
[Writes results to gemini-to-claude.md]

Summary: ✅ Build successful, 52/52 tests pass
```

**7. Claude (Review - 500 tokens)**
```
[Reads summary]
> Guest module created. All tests passing.
```

**Token Savings**: Claude used 3K tokens instead of 18K+ (83% saving)

---

## 📦 Exporting to New Project

### Method 1: Manual Copy (Simple)

```bash
# In new project
mkdir -p .ai/{templates,handoff/archived,context,metrics}

# Copy reusable files
cp /source/.ai/templates/* .ai/templates/
cp /source/.ai/COLLABORATION.md .ai/
cp /source/.ai/MULTI-AI-SETUP.md .ai/
cp /source/.ai/.gitignore .ai/

# Initialize (paste prompts)
claude  # Paste .ai/templates/claude-init-prompt.md
# (Gemini in separate window - paste gemini-init-prompt.md)
```

### Method 2: Git Submodule (Team)

```bash
# Create template repo once
git init ai-collaboration-templates
cd ai-collaboration-templates
mkdir -p .ai/{templates,handoff,context}
# ... copy files ...
git add . && git commit -m "Init templates"
git remote add origin <repo-url>
git push

# Use in any project
cd /your/project
git submodule add <repo-url> .ai-templates
cp -r .ai-templates/.ai .
```

### Method 3: Automation Script

Create `~/bin/init-ai-collab`:

```bash
#!/bin/bash
# Initialize AI collaboration in current project

TEMPLATES="$HOME/.ai-collaboration-templates"

if [ ! -d "$TEMPLATES" ]; then
  echo "❌ Templates not found at $TEMPLATES"
  echo "Clone from: git clone <repo-url> $TEMPLATES"
  exit 1
fi

mkdir -p .ai/{templates,handoff/archived,context,metrics}
cp -r "$TEMPLATES/templates"/* .ai/templates/
cp "$TEMPLATES/COLLABORATION.md" .ai/
cp "$TEMPLATES/MULTI-AI-SETUP.md" .ai/
cp "$TEMPLATES/.gitignore" .ai/

echo "✅ AI collaboration initialized"
echo ""
echo "Next steps:"
echo "1. claude → Paste .ai/templates/claude-init-prompt.md"
echo "2. gemini → Paste .ai/templates/gemini-init-prompt.md"
```

**Usage**:
```bash
cd /any/project
init-ai-collab
```

---

## 🔧 Files to Copy vs Not Copy

### ✅ ALWAYS COPY (Reusable Infrastructure)

- `templates/` - All initialization prompts
- `COLLABORATION.md` - Protocol documentation
- `MULTI-AI-SETUP.md` - This file
- `.gitignore` - Git rules

### ❌ NEVER COPY (Session-Specific)

- `handoff/*.md` - Temporary communication
- `context/*.md` - Build outputs, search results
- `metrics/*.md` - Session metrics

### 🔨 CREATE EMPTY (Structure Only)

```bash
mkdir -p .ai/handoff/archived .ai/context .ai/metrics
```

---

## 🎯 What Makes This Generic

### Works on ANY:

✅ **Tech stack**: Angular, React, Python, .NET, Java, Go, Rust, etc.
✅ **Project size**: Scripts to enterprise monorepos
✅ **Domain**: Web apps, APIs, data science, DevOps, mobile, etc.
✅ **Team size**: Solo developers to large teams

### No Hardcoding

- ❌ No project-specific paths
- ❌ No technology assumptions
- ❌ No build tool requirements
- ✅ Adapts to project structure automatically

### Optional Project-Specific Customization

Create `.ai/COLLABORATION.md` in new project with:
- Build commands for that project
- Critical vs routine modules
- Team conventions

Both AIs will read it automatically.

---

## 🐛 Troubleshooting

### Issue: Claude not delegating

**Solution**: Re-paste `templates/claude-init-prompt.md`

Or remind explicitly:
```
> Use collaboration mode - delegate this build to Gemini
```

### Issue: Gemini not finding tasks

**Check**: Does `handoff/claude-to-gemini.md` have content?

```bash
cat .ai/handoff/claude-to-gemini.md
```

If empty, Claude didn't write task. Remind Claude.

### Issue: Directory not found

**Solution**:
```bash
mkdir -p .ai/handoff/archived .ai/context
```

---

## 📊 Measuring Success

Track in `.ai/metrics/YYYY-MM.md`:

```markdown
## Token Savings - February 2026

- Claude tokens used: 45,000
- Claude tokens saved: 135,000 (delegated to Gemini)
- Saving rate: 75%

## Workflow Distribution

- Claude-only workflows: 12
- Collaborative workflows: 38
- Gemini automation tasks: 87

## Key Optimizations

- [2026-02-12] Delegating all builds to Gemini: 15K tokens/day saved
- [2026-02-15] Gemini doing first-pass reviews: 8K tokens/day saved
```

---

## 🚀 Advanced: Creating Shared Template Repository

For teams using this across many projects:

### 1. Create Template Repository

```bash
mkdir ai-collaboration-templates
cd ai-collaboration-templates

mkdir -p .ai/{templates,handoff,context,metrics}

# Copy reusable files
cp /source/.ai/templates/* .ai/templates/
cp /source/.ai/COLLABORATION.md .ai/
cp /source/.ai/MULTI-AI-SETUP.md .ai/
cp /source/.ai/.gitignore .ai/

# Create README
cat > README.md << 'EOF'
# AI Collaboration Templates

Reusable initialization system for Claude Code + Gemini collaboration.

## Usage

```bash
# In any project
cp -r .ai /your/project/
cd /your/project
claude  # Paste .ai/templates/claude-init-prompt.md
```

See .ai/MULTI-AI-SETUP.md for full documentation.
EOF

git init
git add .
git commit -m "Initial AI collaboration templates"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Use in Projects

```bash
# Option A: Direct copy
git clone <repo-url> ~/ai-collab-templates
cp -r ~/ai-collab-templates/.ai /your/project/

# Option B: Git submodule
cd /your/project
git submodule add <repo-url> .ai-templates
cp -r .ai-templates/.ai .

# Option C: Download release
curl -L <repo-url>/archive/v1.0.tar.gz | tar xz
cp -r ai-collaboration-templates-1.0/.ai .
```

### 3. Update All Projects

When templates improve:

```bash
# Update template repo
cd ~/ai-collab-templates
git pull

# Update projects
cd /project1 && cp -r ~/ai-collab-templates/.ai/templates .ai/
cd /project2 && cp -r ~/ai-collab-templates/.ai/templates .ai/
# ... etc
```

---

## 📚 Full Documentation

- **templates/README.md** - Initialization system & usage
- **COLLABORATION.md** - Complete protocol documentation
- **templates/claude-init-prompt.md** - Claude initialization (paste at session start)
- **templates/gemini-init-prompt.md** - Gemini initialization (paste at session start)

---

## 🎓 Best Practices

### Initialization
1. ✅ Always paste full prompts (don't summarize)
2. ✅ Initialize at start of EVERY session
3. ✅ Verify acknowledgment from both AIs

### During Work
1. ✅ Let Claude orchestrate, Gemini execute
2. ✅ Check handoff files if collaboration seems broken
3. ✅ Archive completed handoffs to keep workspace clean

### Project-Specific
1. ✅ Create `.ai/COLLABORATION.md` for project-specific details
2. ✅ Document build commands in project COLLABORATION.md
3. ✅ Identify critical vs routine modules upfront

---

## 🆘 Support & Contributions

### Issues

- Template issues → Update `templates/*.md`
- Protocol issues → Update `COLLABORATION.md`
- Project-specific → Update project's `COLLABORATION.md`

### Improvements

When discovering optimizations:
1. Update relevant template
2. Version in git
3. Share with team
4. Update this file's version history

---

## 📝 Version History

- **v1.0** (2026-02-12): Initial production-ready system
  - Generic initialization prompts
  - File-based handoff protocol
  - Token optimization strategy
  - Portable across projects
  - Complete documentation

---

## 📄 License

Use freely in your projects. Attribution appreciated but not required.

---

**This system is production-tested on Angular/Nx monorepos and designed to work on ANY project.**

**Token savings: 70-80% average**

**Setup time: 5 minutes**

**Reusability: 100%**
