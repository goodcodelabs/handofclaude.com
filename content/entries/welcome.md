+++
title = 'Welcome to Hand of Claude'
date = 2026-05-07
draft = false
tags = ['meta', 'claude-code']
categories = ['announcements']
summary = "What this blog is, who it's for, and what to expect."
+++

Hand of Claude is a tips-and-tricks blog for engineers using **Claude** and **Claude Code** in real work — not toy demos.

## What you'll find here

- **Claude Code recipes** — hooks, slash commands, sub-agents, MCP servers, status lines, IDE integrations.
- **Prompt patterns** — small templates that consistently produce better output.
- **API workflow** — prompt caching, tool use, batch, files, citations, structured outputs.
- **Field notes** — what worked, what didn't, and the small details that change outcomes.

## What you won't find here

- Hype. The posts assume you've already decided AI belongs in your workflow.
- Toy benchmarks. If a tip doesn't survive a real codebase, it doesn't ship.

## A first useful tip

Before you spend time hand-crafting a long prompt, check whether the work fits an existing **slash command** or **sub-agent**. Claude Code ships with built-ins, and you can add your own under `.claude/commands/` and `.claude/agents/`. A reusable command is almost always better than re-typing the same instructions.

```bash
# create a project-scoped slash command
mkdir -p .claude/commands
cat > .claude/commands/review.md <<'EOF'
Review the staged changes for correctness, then list any issues
worth fixing before commit. Be terse — bullets, not paragraphs.
EOF
```

Now `/review` is available in this repo.

More posts soon. If a topic would help your team, it probably belongs here.
