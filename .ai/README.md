<!-- Truncated for brevity - this file would contain full AI workflow documentation -->
# AI-Assisted Development Workflow

This directory contains context files, plans, and outputs for AI-assisted development using either **Claude Code** or **Antigravity AI Agent**.

## 🚀 Quick Start: Cross-AI Commands

These commands work with **both** Claude Code and Gemini (Antigravity):

```bash
# Start working on TFS
hc-start <tfs_id>                  # Creates task, branch, and plan context

# Finish task
hc-finish <task_id> <hours>        # Updates task, generates description

# Release to DEV/STAGING
hc-release [pms|spa|pos]           # Merges through release chain
```

**For Claude Code users:** You can also use `/start`, `/finish`, `/release` slash commands.

**For Gemini users:** Use the `hc-*` commands above directly in your prompts.

See [`scripts/commands/README.md`](../scripts/commands/README.md) for full documentation.

## 📁 Directory Structure

```
.ai/
├── context/              # Context files prepared for AI consumption
│   ├── <tfs_id>-plan-context.md          # For implementation planning
│   └── <tfs_id>-description-context.md   # For auto-description
├── plans/                # AI-generated implementation plans
│   └── <tfs_id>.md
├── output/               # AI-generated outputs
│   └── <tfs_id>-description.txt
└── README.md             # This file
```

## 🤖 Supported AI Agents

Both AI agents work identically with these workflows:

| Feature | Claude Code | Antigravity AI Agent |
|---------|-------------|---------------------|
| Read context files | ✅ | ✅ |
| Generate plans | ✅ | ✅ |
| Generate descriptions | ✅ | ✅ |
| Execute scripts | ✅ | ✅ |
| Slash commands | ✅ `/start` `/finish` `/release` | ❌ (use hc-* commands) |
| Cross-AI commands | ✅ `hc-start` `hc-finish` `hc-release` | ✅ `hc-start` `hc-finish` `hc-release` |

## 🎯 Two Main Workflows

### 1. **Implementation Planning** (Start of Development)

**Purpose**: Generate detailed implementation plan from requirements.

**Input**:
- TFS field: "Analisi sviluppo da fare" (requirements)
- Project structure
- Relevant existing files

**Output**:
- `.ai/plans/<tfs_id>.md` - Step-by-step implementation guide

**How to use**:

#### With Claude Code:
```bash
# Automatic
claude /start
# Select "yes" for AI planning

# Or manual
./scripts/ai/prepare-plan-context.sh 11257
claude /generate-plan 11257
```

#### With Antigravity AI Agent:
```bash
# Prepare context
./scripts/ai/prepare-plan-context.sh 11257

# Read context file
cat .ai/context/11257-plan-context.md

# Ask your AI agent:
"Based on this context, generate a detailed implementation plan
following the instructions at the end of the file.
Save it to .ai/plans/11257.md"
```

---

### 2. **Auto-Description** (End of Development)

**Purpose**: Automatically generate development description and test case.

**Input**:
- Original requirements ("Analisi sviluppo da fare")
- Implementation plan (if exists)
- Git diff (actual code changes)

**Output**:
- `.ai/output/<tfs_id>-description.txt` with:
  - `DESCRIZIONE_SVILUPPO`: Technical summary
  - `CASE_TEST`: Test instructions

**How to use**:

#### With Claude Code:
```bash
# Automatic
claude /finish
# Select "yes" for AI description

# Or manual
./scripts/ai/prepare-description-context.sh 11257
claude /generate-description 11257
./scripts/workflows/finish-with-ai.sh 67890 4.5
```

#### With Antigravity AI Agent:
```bash
# Prepare context
./scripts/ai/prepare-description-context.sh 11257

# Read context file
cat .ai/context/11257-description-context.md

# Ask your AI agent:
"Based on this context (requirements, plan, and git diff),
generate DESCRIZIONE_SVILUPPO and CASE_TEST following the format
specified in the instructions. Save to .ai/output/11257-description.txt"

# Apply to Azure DevOps
./scripts/workflows/finish-with-ai.sh 67890 4.5
```

---

## 📋 Complete Workflow Example

### Scenario: Fixing bug #11257

#### Step 1: Start with Planning

```bash
# Option A: Claude Code
claude /start
# > TFS ID? 11257
# > Generate plan? yes
# ✅ Plan saved to .ai/plans/11257.md

# Option B: Antigravity Agent
./scripts/workflows/start-with-plan.sh 11257 --skip
# (Then use your AI agent with context file)
```

#### Step 2: Develop

```bash
# Follow implementation plan
cat .ai/plans/11257.md

# ... code changes ...
git add . && git commit -m "Fix overbooking logic"
```

#### Step 3: Finish with Auto-Description

```bash
# Option A: Claude Code
claude /finish
# > Task ID? 67890
# > Hours? 4.5
# > Generate description? yes
# ✅ Description applied to Azure DevOps

# Option B: Antigravity Agent
./scripts/workflows/finish-with-ai.sh 67890 4.5
# (Follow instructions to use your AI agent)
```

#### Step 4: Release

```bash
# Option A: Claude Code
claude /release
# > Which app? PMS
# ✅ Release completed

# Option B: Antigravity Agent (or manual)
# From feature branch (Ipotesi 1):
./scripts/workflows/release-from-branch.sh pms

# From predevelop_merge (Ipotesi 2):
./scripts/workflows/release-current.sh pms

# The script will:
# - Check for updates and conflicts
# - Merge through: predevelop_merge → predevelop → develop
# - Push to all branches
# - Trigger DEV and STAGING pipelines
```

---

## 🔧 Context File Format

### Plan Context (`<tfs_id>-plan-context.md`)

Contains:
- Task information (ID, title, module, type)
- Original requirements from "Analisi sviluppo da fare"
- Project structure
- Relevant existing files
- Instructions for AI

### Description Context (`<tfs_id>-description-context.md`)

Contains:
- Task information
- Original requirements
- Implementation plan (if exists)
- List of modified files
- Git diff statistics
- Detailed code changes (first 500 lines)
- Instructions for AI with output format

---

## ⚙️ Configuration

### Azure DevOps Field Names

**✅ VERIFIED Field Mapping** (tested on TFS #11261):

| UI Field Name | Azure DevOps API Field | Script Variable |
|---------------|----------------------|-----------------|
| Analisi Sviluppo da fare | `System.Description` | `ANALISI` |
| Descrizione Sviluppo effettuato | `Custom.DescrizioneSviluppoeffettuato` | `DEV_DESC` |
| Case Test | `Microsoft.VSTS.Common.AcceptanceCriteria` | `TEST_CASE` |
| ModuleName (PMS/SPA/POS) | `Proxima.ModuleName` | `MODULE` |
| Tipologia | `Proxima.SegnalazioneType` | `TIPOLOGIA` |

**Notes**:
- `System.Description` contains HTML tags (`<div>...</div>`) - scripts strip them automatically
- `Proxima.SegnalazioneType` format: "1 - Errore", "2 - Nuova implementazione", "3 - Miglioria"
- Scripts extract the first digit to determine branch type (1=fix, 2/3=feature)

---

## 🎓 Best Practices

### For Implementation Planning:
1. ✅ Review "Analisi sviluppo da fare" before generating plan
2. ✅ Edit the plan if AI misses important details
3. ✅ Keep plan file updated if approach changes
4. ✅ Reference plan during development

### For Auto-Description:
1. ✅ Review AI-generated description before applying
2. ✅ Ensure git diff is meaningful (commit frequently)
3. ✅ Edit output file if description needs adjustments
4. ✅ Keep descriptions concise (2-4 sentences)
5. ✅ Make test cases actionable and specific

### General:
1. ✅ Commit changes before running finish workflow
2. ✅ Use meaningful commit messages (AI reads them)
3. ✅ Keep context files for reference
4. ✅ Clean old context files periodically

---

## 🐛 Troubleshooting

### "Context file not found"
Run the prepare script first:
```bash
./scripts/ai/prepare-plan-context.sh <tfs_id>
# or
./scripts/ai/prepare-description-context.sh <tfs_id>
```

### "Field 'Custom.AnalisiSviluppoDaFare' not found"
Find correct field name:
```bash
az boards work-item show --id <TFS_ID> --output json | grep -i "analisi"
```
Update `scripts/ai/prepare-plan-context.sh` and `prepare-description-context.sh`.

### "Output file format incorrect"
Ensure AI output follows exact format:
```
DESCRIZIONE_SVILUPPO: [text here]
CASE_TEST: [text here]
```

Edit `.ai/output/<tfs_id>-description.txt` manually if needed.

### "Git diff is empty"
- Commit your changes first
- Verify you're on the correct branch
- Check that predevelop_merge branch exists

---

## 📚 More Information

See full documentation:
- [scripts/README.md](../scripts/README.md) - All automation scripts
- [CLAUDE.md](../CLAUDE.md) - Project overview and workflows
