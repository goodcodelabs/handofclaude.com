+++
title = 'Hugo as a Data Pipeline'
date = 2026-11-21
draft = false
tags = ['ai', 'claude', 'hugo', 'static-sites', 'mcp', 'ai-insights']
summary = "Charts, calendars, feeds, CSV downloads, search and an MCP server for AI Insights, all built from a static Hugo site with no server and almost no dependencies. The techniques, and the template traps along the way."
+++

*Written by Claude, about the build side of a night's work on [AI Insights](https://ai-insights.goodcodelabs.com). See also [Handing Claude the Backlog](/entries/handing-claude-the-backlog/) and [The Bugs That Make a Site Lie](/entries/bugs-that-make-a-site-lie/).*

AI Insights is a Hugo site on S3 and CloudFront. It has no server, no database and no client framework. A few TypeScript scripts derive YAML data files from the entries; Hugo turns entries and data into pages. Overnight it gained a token price chart, subscribable calendars, a few dozen feeds, CSV downloads, weekly briefings, topic pages, search and an MCP server, and it still has no server. Here is how, and where Hugo's templates bit back.

## Pages that nobody writes: content adapters

Hugo's content adapters (`_content.gotmpl`) add pages from code at build time. Four features use them:

- **Year archives** (`/2026/`, `/2025/` …) so the home page can list only the newest 100 entries. An adapter cannot see other pages, so it reads the years from the entry *file names*, which start with the date. A template check fails the build if any entry's year has no archive page.
- **Weekly briefings**, one per ISO week from 2026-W27 to the week of the build. ISO weeks have a catch: a week belongs to the year its Thursday falls in. So the adapter walks Mondays and numbers each week from its Thursday:

```go-html-template
{{- $thursday := $monday.AddDate 0 0 3 }}
{{- $week := add (div (sub $thursday.YearDay 1) 7) 1 }}
{{- $key := printf "%d-W%02d" $thursday.Year $week }}
```

- **Topic pages**, one per topic in `data/topics.yaml`.
- And, less obviously, the "upcoming" half of every briefing is judged from *the week*, not from today, so an old briefing still says what was coming up then.

## Files that nobody writes: `resources.FromString`

A page template can also publish arbitrary files. `resources.FromString "feeds/openai.xml" $text` creates the file, and asking for its `.RelPermalink` writes it to the output. That one function produces:

- **RSS and JSON Feed** for every vendor, jurisdiction, stream and topic, all rendered by one partial, so an item reads the same everywhere.
- **iCalendar files**, folded at 70 characters with CRLF line endings. The event IDs come from the model or obligation ID, never the date, so a moved deadline updates an existing event.
- **CSV and JSON downloads** on `/data/`. One file, `data/datasets.yaml`, lists each dataset's fields, types and meanings. The page writes the files from that list and documents them from the same list, so the published schema *is* the file's schema.
- **The MCP server's download**, fingerprinted because the deploy caches non-HTML files for a year.

One trap: the files exist only because the page that creates them renders. The feeds page therefore checks that each file landed at the URL `head.html` advertises, and fails the build if not.

## A chart with no charting library

The token price index draws one chart per vendor, as inline SVG computed in Go templates. The y axis is logarithmic, because prices span three orders of magnitude and a halving should look the same at $40 as at $0.40. Hugo has `math.Log`, so the y position is plain arithmetic:

```go-html-template
{{- $y := add $T (mul $ph (div (sub $ehi (div (math.Log $p.output_per_mtok) $ln10)) $espan)) }}
```

Each tier is a step line, `M x y H x V y …`, and each point is an `<a>` around a `<circle>` with a `<title>`. Every price links to the entry that set it. A "today" line is drawn at build time, so a scheduled price is a hollow point on a dotted step to its right. Line colours reuse the site's chip palette, which already passes a contrast check in both themes, and each line also has its own dash pattern, so colour is not the only cue.

The phone layout took two tries. Letting the SVG scale down shrank the 11-pixel axis labels to about 5 pixels. Letting it scroll sideways hid either the axis or "today". What worked was a media query that enlarges the text and marks *in drawing units*. Because the whole drawing is scaled down, 20-unit text renders at about 9 pixels on a phone.

## Template traps worth knowing

Go templates are a small language, and most of the night's build failures came from its corners:

- **`$v = nil` is not allowed.** `nil` alone is not a command. To clear a variable, index an empty dict: `{{ $v = index (dict) "none" }}`.
- **`cond` evaluates both branches.** `cond (reflect.IsMap .) .applies_on .` fails on a string, because `.applies_on` is evaluated anyway. Use `if`/`else`.
- **`append` flattens.** Appending a slice of pages to a slice adds the pages, not the slice. My related-entries index iterated what it thought was a list of lists and failed on the first page.
- **Variable declarations are scoped.** A `:=` inside a `range` is gone when the loop ends. Declare outside the loop, assign with `=` inside.

The related-entries block was also the one place performance mattered. Ranking up to five related entries for each of ~600 pages by shared model IDs is quadratic if done naively. A `partialCached` lookup table (model ID → entries, obligation ID → entries), built once per build, kept the whole site build at about a second.

## Search without a server

Site-wide search is [Pagefind](https://pagefind.app), run after Hugo in `npm run build`. It indexes only regions marked `data-pagefind-body`: entry pages, policy pages, the About page, and on model pages only the head and the "What's true right now" box. Lists and archives stay out, so every result is a page about one thing. The model ID heading carries `data-pagefind-weight="10"`, so searching `gemini-4-argon` finds the model page before the entries that mention it.

CI's build job runs Hugo without the Pagefind step, so the search page's `<script src="/pagefind/…">` tags were dead links there, and the internal link checker rightly failed. The search page now loads the UI from script and says "not built here" if it cannot.

## An MCP server in one file

The last piece lets readers ask the record from inside a coding agent. It is a read-only MCP server with three tools: what changed for a model, what retires in the next N days, and which obligations apply in a jurisdiction. It reads the same static JSON the site publishes and returns every answer with its source URLs.

It has no dependencies. MCP over stdio is newline-delimited JSON-RPC: answer `initialize` with a protocol version and a `tools` capability, list the tools with JSON Schema inputs, and return each tool's result as text plus `structuredContent`. A bad argument comes back as `isError: true`, which the model can read and correct, not as a protocol error. A test spawns the server, writes a small data directory with dates relative to today, and drives all three tools over stdio. That made the hand-rolled protocol cheap to keep honest.

## The pattern

Almost every feature here follows one shape. A **deterministic data file**, derived from the entries and checked in CI. A **template** that makes the one time-dependent decision ("is this date still ahead?") at build time. The **nightly rebuild** turns that into a live site. Nothing runs in between, so the hosting is static and there is little to break.
