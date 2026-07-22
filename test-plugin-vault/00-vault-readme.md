# 00 — Test Plugin Vault

This vault exists for manual QA of the **Rainbow Header Coloring** plugin during development.

## Setup

Run from the repo root:

```sh
npm run build
npm run install-test
```

Then open this folder as a vault in Obsidian, go to **Settings → Community plugins**, and enable **Rainbow Header Coloring**.

## Test files

| File | What it tests |
|------|---------------|
| `01-happy-path.md` | H1–H6, all levels in sequence |
| `02-code-blocks.md` | Headers inside fenced/backtick code must NOT be colored |
| `03-yaml-frontmatter.md` | YAML frontmatter `#` comments must NOT be colored |
| `04-blockquotes.md` | Headers inside `>` blockquotes |
| `05-inline-formatting.md` | Bold, italic, links, wikilinks, code inside headings |
| `06-real-world-structure.md` | Realistic document with mixed depth + code blocks |
| `07-callouts.md` | Obsidian callout blocks containing headings |
| `08-consecutive-same-level.md` | Many same-level headings — palette cycling |
| `09-edge-cases.md` | Long headings, special chars, setext syntax, end-of-file |

## What to verify

- [ ] **Colormap mode**: H1–H6 each get a distinct color from the active palette
- [ ] **User-defined mode**: per-level colors from settings are applied
- [ ] **Editor (Live Preview + Source)**: `.cm-line.HyperMD-header-N` and `.cm-header-N` selectors match
- [ ] **Reading view**: `h1`–`h6` inside `.markdown-reading-view` are colored
- [ ] **Code blocks**: no coloring applied to `#` lines inside fences
- [ ] **YAML frontmatter**: no coloring applied to the frontmatter block
- [ ] **Toggle modes**: switching colormap ↔ user-defined in settings updates styles live
- [ ] **Enable/disable editor/reading mode**: scope toggles work correctly
- [ ] **Opacity sliders**: background at 0.1 is subtle; font at 1.0 is vivid
- [ ] **Plugin reload**: styles survive disable → enable cycle without leaking DOM elements

## Known behavior (by design)

| Case | Behavior | Notes |
|------|----------|-------|
| Headings inside callout blocks | **Not colored** | Callout CSS overrides plugin styles — acceptable, keeps callout visual identity clean |
| Setext-style headings (`===` / `---`) | **Not colored** — needs DevTools investigation | May be a selector specificity issue in reading view |
| Tab after `##` instead of space | Not colored | Invalid CommonMark — tab-separated headings are not standard markdown |
