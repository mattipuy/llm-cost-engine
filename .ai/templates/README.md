# Multi-AI Collaboration Templates

**Purpose**: Standardized initialization system for Claude Code + Gemini collaboration across ANY project.

---

## Quick Start (New Session)

### 1. Initialize Claude Code

```bash
# Open project in terminal
cd /path/to/your/project

# Start Claude Code
claude

# Paste initialization prompt
```

Copy-paste the **entire content** of [`claude-init-prompt.md`](claude-init-prompt.md) into Claude Code.

**Expected response**: Claude acknowledges collaboration mode and summarizes role.

### 2. Initialize Gemini

Open Gemini (Gemini 3.0 Pro or 2.5 Flash) and paste the **entire content** of [`gemini-init-prompt.md`](gemini-init-prompt.md).

**Expected response**: Gemini acknowledges collaboration mode and reports readiness.

### 3. Start Working

Now both AIs are initialized and know their roles. Work as usual.

**Claude Code will**:
- Focus on critical/architectural work
- Delegate expensive operations to Gemini via `.ai/handoff/claude-to-gemini.md`

**Gemini will**:
- Check `.ai/handoff/claude-to-gemini.md` for tasks
- Execute builds, searches, reviews, etc.
- Report results in `.ai/handoff/gemini-to-claude.md`

---

## Files in This Directory

| File | Purpose |
|------|---------|
| `claude-init-prompt.md` | Full initialization prompt for Claude Code |
| `gemini-init-prompt.md` | Full initialization prompt for Gemini |
| `README.md` | This file - usage instructions |

---

## How It Works

### Token Optimization Strategy

**Problem**: Claude Code has more limited tokens/rate limits than Gemini.

**Solution**: Distribute work based on token cost:
- **Claude Code (25-30% token volume)**: Critical/architectural work
- **Gemini (70-75% token volume)**: Builds, searches, repetitive tasks

### Communication Protocol

All communication happens via **files** in `.ai/handoff/`:

```
Your Project/
├── .ai/
│   ├── handoff/
│   │   ├── claude-to-gemini.md    ← Claude writes tasks
│   │   ├── gemini-to-claude.md    ← Gemini writes results
│   │   ├── shared-context.md      ← Shared decisions
│   │   └── archived/              ← Old handoffs
│   ├── context/
│   │   ├── build-results.md       ← Build outputs
│   │   ├── codebase-search.md     ← Search results
│   │   └── review-findings.md     ← Review findings
│   ├── templates/                 ← This directory
│   │   ├── claude-init-prompt.md
│   │   ├── gemini-init-prompt.md
│   │   └── README.md
│   └── COLLABORATION.md           ← Protocol documentation
```

### Example Workflow

**Scenario**: User asks Claude to build the project

```
┌─ User ───────────────────────────────────────┐
│ "Build the project and run tests"           │
└──────────────┬────────────────────────────────┘
               │
┌──────────────▼────────────────────────────────┐
│ Claude Code                                   │
│ - Recognizes: High token cost (5K-20K)       │
│ - Decision: Delegate to Gemini               │
│ - Action: Write task to claude-to-gemini.md  │
└──────────────┬────────────────────────────────┘
               │
┌──────────────▼────────────────────────────────┐
│ Gemini                                        │
│ - Reads: claude-to-gemini.md                 │
│ - Executes: npm run build && npm test        │
│ - Captures: Full output (thousands of lines) │
│ - Writes: Concise summary to                 │
│           gemini-to-claude.md (<200 words)   │
└──────────────┬────────────────────────────────┘
               │
┌──────────────▼────────────────────────────────┐
│ Claude Code                                   │
│ - Reads: gemini-to-claude.md (summary only)  │
│ - Token usage: ~200 tokens (instead of 10K!) │
│ - Reports to user: Build status              │
└───────────────────────────────────────────────┘
```

**Result**: Claude saves 9,800 tokens (98% reduction!)

---

## Reusability Across Projects

### These templates are 100% generic and work on:

- ✅ **Any tech stack**: Angular, React, Vue, Python, .NET, Java, Go, etc.
- ✅ **Any project size**: Small scripts to large monorepos
- ✅ **Any domain**: Web apps, APIs, data science, DevOps, etc.
- ✅ **New or existing projects**

### No modification needed!

The prompts are:
- Technology-agnostic
- Self-adapting to project structure
- Focused on universal principles (token optimization, role distribution)

### Project-specific customization (optional)

For project-specific details, create `.ai/COLLABORATION.md` in your project root with:
- Tech stack & build commands
- Critical vs routine module identification
- Custom workflow patterns
- Team conventions

Both AIs will read it automatically if present.

---

## Setting Up a New Project

### Option 1: Manual Setup (5 minutes)

```bash
# In your project root
mkdir -p .ai/handoff/archived .ai/context .ai/templates

# Copy templates
cp /path/to/source/.ai/templates/*.md .ai/templates/

# Copy protocol doc (optional but recommended)
cp /path/to/source/.ai/COLLABORATION.md .ai/

# Initialize Claude Code
claude
# [Paste claude-init-prompt.md content]

# Initialize Gemini (separate window)
# [Paste gemini-init-prompt.md content]
```

### Option 2: Template Repository (Recommended)

Create a **template repository** with this structure:

```
ai-collaboration-template/
├── .ai/
│   ├── handoff/
│   │   ├── .gitkeep
│   │   └── archived/
│   ├── context/
│   │   └── .gitkeep
│   ├── templates/
│   │   ├── claude-init-prompt.md
│   │   ├── gemini-init-prompt.md
│   │   └── README.md
│   └── COLLABORATION.md
└── README.md
```

**Usage**:
```bash
# Copy to new project
cp -r ai-collaboration-template/.ai /path/to/new-project/

# Or use as git submodule
git submodule add https://github.com/yourorg/ai-collaboration-template .ai-templates
```

### Option 3: Automation Script (Advanced)

Create a script `init-ai-collab.sh`:

```bash
#!/bin/bash
# Initialize AI collaboration in current project

# Create directory structure
mkdir -p .ai/handoff/archived .ai/context .ai/templates

# Copy templates from template repo
TEMPLATE_REPO="/path/to/ai-collaboration-template"
cp -r $TEMPLATE_REPO/.ai/* .ai/

echo "✅ AI collaboration structure initialized"
echo ""
echo "Next steps:"
echo "1. Start Claude Code and paste: .ai/templates/claude-init-prompt.md"
echo "2. Start Gemini and paste: .ai/templates/gemini-init-prompt.md"
echo "3. Start collaborating!"
```

**Usage**:
```bash
cd /path/to/project
./init-ai-collab.sh
```

---

## Verifying Collaboration Mode

### In Claude Code

```
> Am I in collaboration mode with Gemini?
```

**Expected response**: Claude summarizes its role and delegation strategy.

### In Gemini

```
> Are you in collaboration mode with Claude?
```

**Expected response**: Gemini summarizes its role and checks for tasks.

### Check Handoff Files

```bash
# Check for Claude's tasks to Gemini
cat .ai/handoff/claude-to-gemini.md

# Check for Gemini's results to Claude
cat .ai/handoff/gemini-to-claude.md

# Check shared context
cat .ai/handoff/shared-context.md
```

---

## Best Practices

### 1. Always Initialize Both AIs

Don't skip initialization! The prompts contain critical context:
- Role definitions
- Token optimization rules
- Communication protocols
- Workflow patterns

### 2. Archive Completed Handoffs

Keep `.ai/handoff/` clean:

```bash
# After task completion, archive handoff
mv .ai/handoff/claude-to-gemini.md \
   .ai/handoff/archived/$(date +%Y-%m-%d-%H-%M)-task-name.md
```

Or let Claude/Gemini do it automatically when task completes.

### 3. Review Metrics Monthly

Track collaboration effectiveness:

```bash
# Create monthly metrics file
cat > .ai/metrics/2026-02.md << EOF
## Token Savings
- Claude tokens used: X
- Claude tokens saved: Y
- Saving rate: Z%

## Workflow Distribution
- Claude-only workflows: N
- Collaborative workflows: M
EOF
```

### 4. Update Prompts as Needed

When discovering new optimization patterns:
- Update `claude-init-prompt.md` and `gemini-init-prompt.md`
- Version in git
- Share with team

### 5. Use Project-Specific COLLABORATION.md

For complex projects, create `.ai/COLLABORATION.md` with:
- Build commands
- Critical module list
- Team conventions
- Custom workflows

---

## Troubleshooting

### Issue: Claude not delegating tasks

**Symptoms**: Claude tries to run builds/searches itself

**Solution**: Re-paste initialization prompt to remind Claude of collaboration mode

**Alternative**: Ask explicitly:
```
> Delegate this build to Gemini via handoff file
```

### Issue: Gemini not finding tasks

**Symptoms**: Gemini says "no tasks found"

**Solution**: Check that Claude wrote to `.ai/handoff/claude-to-gemini.md`:
```bash
cat .ai/handoff/claude-to-gemini.md
```

If empty, Claude may have forgotten protocol. Re-initialize Claude.

### Issue: Results too verbose (wasting Claude's tokens)

**Symptoms**: Gemini writes 1000+ word summaries

**Solution**: Remind Gemini:
```
> Your summaries for Claude must be under 200 words. Rewrite concisely.
```

### Issue: Directory structure missing

**Symptoms**: File operation errors

**Solution**: Create structure:
```bash
mkdir -p .ai/handoff/archived .ai/context
```

---

## Advanced: Custom Skills

You can create custom Claude Code skills for automation:

### Skill: /init-collab

Create `.claude/skills/init-collab.js`:

```javascript
// Initialize AI collaboration structure
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'init-collab',
  description: 'Initialize AI collaboration structure',
  async execute() {
    // Create directories
    const dirs = [
      '.ai/handoff/archived',
      '.ai/context',
      '.ai/templates',
      '.ai/metrics'
    ];

    dirs.forEach(dir => {
      fs.mkdirSync(dir, { recursive: true });
    });

    console.log('✅ AI collaboration structure initialized');
    console.log('Copy templates from .ai/templates/ to get started');
  }
};
```

**Usage**:
```
> /init-collab
```

### Skill: /delegate

Create `.claude/skills/delegate.js`:

```javascript
// Delegate task to Gemini
module.exports = {
  name: 'delegate',
  description: 'Delegate task to Gemini',
  async execute(args) {
    const task = args.join(' ');

    // Write to handoff file
    const handoffPath = '.ai/handoff/claude-to-gemini.md';
    const content = `
# Task: ${task}
**Priority**: Medium
**Date**: ${new Date().toISOString()}

## Task
${task}

## Expected Output
Report results in gemini-to-claude.md
`;

    fs.writeFileSync(handoffPath, content);
    console.log('✅ Task delegated to Gemini');
    console.log('Written to:', handoffPath);
  }
};
```

**Usage**:
```
> /delegate Build the project and run tests
```

---

## Team Adoption

### Rolling Out to Team

1. **Create template repository** with `.ai/` structure
2. **Document in team wiki** with this README
3. **Training session** (30 minutes):
   - Show token savings
   - Demo workflow
   - Practice initialization
4. **Gradual rollout**:
   - Week 1: Pilot with 2-3 developers
   - Week 2: Expand to full team
   - Week 3: Gather feedback, optimize

### Team Repository Structure

```
your-company/ai-collaboration/
├── .ai/
│   ├── templates/
│   │   ├── claude-init-prompt.md
│   │   ├── gemini-init-prompt.md
│   │   └── README.md
│   └── COLLABORATION.md
├── docs/
│   ├── getting-started.md
│   ├── best-practices.md
│   └── troubleshooting.md
└── scripts/
    └── init-ai-collab.sh
```

**Share across projects**:
- Git submodule
- npm package (private registry)
- Copy script

---

## FAQ

**Q: Do I need to re-initialize every session?**
**A**: Yes, for now. Claude Code sessions are stateless. Future versions may support persistent configuration.

**Q: Can I use this with other AIs (GPT-5, etc.)?**
**A**: Yes! Create similar initialization prompts. The protocol is AI-agnostic.

**Q: What if my team doesn't have Gemini?**
**A**: Adapt the prompt for available AI (GPT-5, etc.). Core principles remain the same.

**Q: Does this work for solo developers?**
**A**: Absolutely! Even more valuable - automate your own workflow.

**Q: Can I simplify the prompts?**
**A**: You can, but shorter prompts = less context = less effective collaboration. The length is intentional.

**Q: How do I share this across multiple projects?**
**A**: Use git submodules, template repositories, or copy scripts. See "Option 2: Template Repository" above.

---

## Version History

- **v1.0** (2026-02-12): Initial template system
  - Claude initialization prompt
  - Gemini initialization prompt
  - File-based handoff protocol
  - Token optimization strategy

---

## Contributing

Improvements welcome! When updating prompts:

1. Test on multiple project types
2. Verify token savings
3. Update version history
4. Share with team

---

## License

Adapt freely for your organization. Attribution appreciated but not required.
