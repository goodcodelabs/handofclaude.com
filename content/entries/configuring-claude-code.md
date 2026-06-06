+++
title = 'Configuring Claude Code'
date = 2026-06-05
draft = false
tags = ['ai', 'claude', 'anthropic', 'harness', 'settings']
summary = "What is a harness, and what exactly can you configure in Claude Code? A summary of Claude Code settings that can help improve your experience and how they all work."
+++

Last time I mentioned that we'll keep getting better at building harnesses around these models. That word, "harness" is a confusing term, so let's unpack it. Once you understand what a harness actually is, a lot of the magic around tools like Claude Code stop feeling like magic and start feeling more like a useful tool to help you be more productive.

## So what's a Harness?

The model itself is just a thing that predicts text. On its own it can't read your files, run your tests, or remember what you told it yesterday. It's a pattern matching parlor trick.

The harness is everything we build around the model to help guide it. It's the layer that decides what the model can see, what it's allowed to do, and what guardrails it _should_ follow. When you ask Claude Code to fix a bug, it is what feeds it the right files, checks for permissions to run commands, and hands the result back.

Claude Code is a harness. And the nice part is that a lot of how it behaves isn't fixed--it's configurable. Once you know where those knobs live, you can tune the whole thing to fit how you actually work.

## Where your settings live

Claude Code reads its configuration from a few different places, and each one exists for a reason. These are the [configuration scopes](https://code.claude.com/docs/en/settings#configuration-scopes), and the easiest way to reason about them is by asking yourself "who is this setting for?"

**User settings** live in `~/.claude/settings.json`. This is *your settings*, everywhere. Every project on your machine inherits these. It's the right home for personal preferences that have nothing to do with any individual codebase--like your preferred model and the permissions you're comfortable granting across the board. If you'd want it on a new project without thinking about it, it probably belongs here.

**Project settings** live in `.claude/settings.json` inside the repo or project folder, and they should get checked into source control. This is the stuff that should be true for *everyone* working on this project: which tools are allowed, which directories are off-limits and environment variables the project depends on.

**Local project settings** live in `.claude/settings.local.json`, and this one *should not* be checked in. This needs to be added to your `.gitignore`--ALWAYS. This is your personal override for a specific project. Maybe the team config allows a conservative set of commands, but you trust yourself to run a few more in this repo. Put those here, and you won't accidentally force your preferences on everyone else. Claude Code will also add any commands that you tell it to "ALWAYS" be allowed to this file. 

These are not always limited to the project scope, and such, this is an open attack vector. Be careful to ensure this doesn't get committed to the repo and be cautious if you see one in a freshly cloned repo.

If you're working somewhere with managed machines, there's generally a **managed/enterprise** layer that administrators control. Most of us won't touch it day to day, but it's worth knowing it exists.

What goes *in* these files is the same across all of them: permissions for what Claude can do without asking, environment variables, hooks that run on certain events, which model to use, and a pile of smaller toggles.

## When two settings disagree

Here's the obvious question: if the same setting shows up in more than one of those files, who wins?

Claude Code has a clear [order of precedence](https://code.claude.com/docs/en/settings#settings-precedence). Below is the order in which the settings are applied, with the last one always winning.

1. **User settings** (`~/.claude/settings.json`) -- your global defaults
2. **Project settings** (`.claude/settings.json`) -- the team's shared config
3. **Local project settings** (`.claude/settings.local.json`) -- your personal take on this repo
4. **Enterprise managed settings** -- the admin's word is final

The way I keep it straight: the more specific the setting, the more it wins. Your global user settings are the gentle baseline, and is true unless something more specific says otherwise. A project can override your baseline. *Your* local override beats the project and an enterprise policy beats everyone, because that's the whole point of an enterprise policy.

## A few things worth knowing

A couple of settings I reach for often, plus where to go when something's behaving in a way you can't explain.

**Keep Claude away from your secrets.** You can tell Claude Code which files it isn't allowed to read, and `.env` files, which are usually full of API keys are the obvious candidates. The [excluding sensitive files](https://code.claude.com/docs/en/settings#excluding-sensitive-files) docs describe this in more detail.

**Environment variables control more than you'd expect.** A surprising amount of Claude Code's behavior can be flipped through [environment variables](https://code.claude.com/docs/en/env-vars)--things like turning telemetry off, pointing at a different model endpoint, or tuning timeouts. You don't need to memorize them, but it's worth skimming the list once so you know what's possible when you hit a wall.

**When config misbehaves, debug it instead of guessing.** Sooner or later a setting won't take effect and you'll have no idea why. Maybe a higher-priority scope is quietly overriding you. Rather than poking at files in the dark, the [debugging your configuration](https://code.claude.com/docs/en/debug-your-config) guide shows you how to see what Claude Code actually resolved. Nine times out of ten the answer is "oh, the precedence rules are doing exactly what I told them to."

## The takeaway

A harness is just the scaffolding that turns a clever text predictor into something that can do real work on your machine--and Claude Code's scaffolding is yours to adjust. Set your defaults once at the user level. Let your projects carry shared config for the team. Keep your personal overrides local. And when something surprises you, remember that the most specific setting wins.
