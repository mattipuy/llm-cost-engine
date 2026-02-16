# .ai/ Directory - Complete Index

This directory contains TWO independent AI systems:

---

## 🔵 System 1: Workflow Automation (Start/Finish/Release)

**Purpose**: Azure DevOps integration & workflow automation
**For**: Daily development workflows on THIS project (HcClientWow)
**Documentation**: [README.md](README.md)

**Features**:
- `/start` - Start TFS with branch creation & planning
- `/finish` - Finish task with Azure DevOps updates
- `/release` - Release code through branch chain

**Files**:
- `README.md` - Workflow automation guide
- `context/` - TFS context files
- `plans/` - AI-generated implementation plans
- `output/` - AI-generated descriptions

---

## 🟢 System 2: Multi-AI Collaboration (Claude + Gemini)

**Purpose**: Token-optimized collaboration between Claude Code & Gemini
**For**: ANY project (fully portable & reusable)
**Documentation**: [MULTI-AI-SETUP.md](MULTI-AI-SETUP.md)

**Features**:
- Token optimization (save 70-80% of Claude's tokens)
- File-based AI communication
- Role-based task delegation
- Generic initialization system

**Files**:
- `MULTI-AI-SETUP.md` - Quick start & export guide ⭐ START HERE
- `COLLABORATION.md` - Full protocol documentation
- `templates/` - Initialization prompts (copy to other projects)
  - `claude-init-prompt.md` - Paste at Claude session start
  - `gemini-init-prompt.md` - Paste at Gemini session start
  - `README.md` - Template usage guide
- `handoff/` - AI communication files (session-specific)
  - `claude-to-gemini.md` - Claude writes tasks
  - `gemini-to-claude.md` - Gemini writes results
  - `shared-context.md` - Shared decisions
- `.gitignore` - Git rules (commit templates, ignore handoffs)

---

## Quick Decision Guide

**I want to...**

| Goal | System | File to Read |
|------|--------|--------------|
| Start working on a TFS | System 1 | [README.md](README.md) |
| Use `/start` `/finish` `/release` | System 1 | [README.md](README.md) |
| Optimize Claude's token usage | System 2 | [MULTI-AI-SETUP.md](MULTI-AI-SETUP.md) |
| Copy AI collab to another project | System 2 | [MULTI-AI-SETUP.md](MULTI-AI-SETUP.md) |
| Initialize Claude + Gemini collaboration | System 2 | [templates/README.md](templates/README.md) |
| Understand the collaboration protocol | System 2 | [COLLABORATION.md](COLLABORATION.md) |

---

## These Systems Are Independent

- ✅ You can use **System 1** (workflows) without **System 2** (multi-AI)
- ✅ You can use **System 2** (multi-AI) without **System 1** (workflows)
- ✅ You can use both together (they don't conflict)

---

## Getting Started

### For THIS Project (HcClientWow)

**Daily workflows**: Read [README.md](README.md)

**Token optimization**: Read [MULTI-AI-SETUP.md](MULTI-AI-SETUP.md) → Paste initialization prompts

### For OTHER Projects

**Copy multi-AI system**:
```bash
# Copy these files to new project:
cp -r .ai/templates /new-project/.ai/
cp .ai/COLLABORATION.md /new-project/.ai/
cp .ai/MULTI-AI-SETUP.md /new-project/.ai/
cp .ai/.gitignore /new-project/.ai/

# Create structure
mkdir -p /new-project/.ai/handoff/archived
mkdir -p /new-project/.ai/context
```

**Then initialize**: Follow [MULTI-AI-SETUP.md](MULTI-AI-SETUP.md)

---

**Last Updated**: 2026-02-12
