# TODO — Obsidian Header Coloring Plugin

**Status:** Pre-development (unmodified Obsidian sample plugin template)

Inspired by [vscode-markdown-header-coloring](https://github.com/satokaz/vscode-markdown-header-coloring) by satokaz.
Scaffolded from the [obsidian-sample-plugin](https://github.com/obsidianmd/obsidian-sample-plugin) template.

---

## Phase 1 · Project Metadata & Cleanup

- [ ] **Update `manifest.json`** — set `id`, `name`, `description`, `author`, `authorUrl`, `minAppVersion`
- [ ] **Update `package.json`** — set `name`, `description`, `author`, `repository` URL
- [ ] **Rewrite `README.md`** — purpose, features overview, installation steps, settings reference, credits (template + vscode extension inspiration)
- [ ] **Remove sample plugin boilerplate** from `src/main.ts` (ribbon icon, dice command, sample modal, setInterval, click listener)
- [ ] **Clear `src/settings.ts`** — remove `mySetting: string` placeholder; keep structure for real settings

---

## Phase 2 · Architecture Decision & Settings Design

### Approach: CSS injection (not CodeMirror 6 decorations)

Obsidian's Live Preview already adds `.HyperMD-header-N` classes to header lines and
Reading mode renders standard `<h1>`–`<h6>` elements. We generate a CSS stylesheet from
settings and inject it into the document. CSS naturally skips headers inside fenced code
blocks and YAML front matter — no document parsing needed.

This is simpler, more maintainable, and yields the same visual result as the decoration
API approach the VSCode extension uses.

### CSS selectors to target

| Context | Selector | Colors |
|---|---|---|
| Live Preview / Source — line background | `.cm-line.HyperMD-header-1` | background |
| Live Preview / Source — header text | `.cm-line.HyperMD-header-1 .cm-header-1` | foreground |
| Reading view | `.markdown-reading-view h1` | foreground + background |

> **Verify during dev:** Confirm `.HyperMD-header-N` class names in Obsidian's DOM by
> inspecting with DevTools (`Ctrl+Shift+I`). Adjust selectors if needed.

### Settings interface to define in `src/settings.ts`

```ts
interface HeaderColoringSettings {
  mode: "colormap" | "userDefined";          // which coloring strategy
  colormapName: ColormapName;                 // "hsv" | "jet" | "cool" | "warm" | "viridis"
  nshades: number;                            // 10–40, default 20
  fontColorOpacity: number;                   // 0.0–1.0, default 1.0
  backgroundColorOpacity: number;             // 0.0–1.0, default 0.1
  enableEditorMode: boolean;                  // apply to Live Preview / Source mode
  enableReadingMode: boolean;                 // apply to Reading view
  userDefined: {                              // per-level overrides (mode = "userDefined")
    [K in `h${1|2|3|4|5|6}`]: {
      color: string;          // CSS color string or "" (disabled)
      backgroundColor: string;
      bold: boolean;
      italic: boolean;
    };
  };
}
```

---

## Phase 3 · Color Engine (`src/colorEngine.ts`)

- [ ] Implement `hsvToRgba(h: number, s: number, v: number, a: number): string`
  - Returns `"rgba(r, g, b, a)"` CSS string
- [ ] Implement `generateColormapColors(name, nshades, fontOpacity, bgOpacity): ColorEntry[]`
  - `ColorEntry = { font: string; background: string }` (two rgba strings per heading)
  - Default: HSV colormap, cycling hue 0→1 over `nshades` steps at full saturation/value
- [ ] Implement a small set of built-in colormaps as pure functions:
  - `hsv` — full hue rotation (default, like the VSCode extension default)
  - `cool` — cyan → magenta
  - `warm` — yellow → red
  - `greyscale` — white → dark grey
  - (More can be added without breaking changes)
- [ ] Export `COLORMAP_NAMES` constant for use in settings UI dropdown
- [ ] **No external `colormap` npm package** — keep `main.js` small per Obsidian guidelines

---

## Phase 4 · CSS Injector (`src/styleInjector.ts`)

- [ ] Implement `buildStylesheet(settings: HeaderColoringSettings): string`
  - For `mode === "colormap"`: generate `nshades` colors, assign H1–H6 by cycling through them
  - For `mode === "userDefined"`: use per-level `color` and `backgroundColor` directly
  - Emit CSS rules for both editor selectors and reading view selectors (if enabled)
  - Handle opacity: `fontColorOpacity` and `backgroundColorOpacity` applied to rgba alpha
- [ ] Implement `injectStyles(el: HTMLStyleElement, css: string): void` — sets `el.textContent`
- [ ] Plugin creates a `<style id="header-coloring-plugin">` element on load, removes on unload

---

## Phase 5 · Settings UI (`src/settings.ts`)

- [ ] **Mode selector**: Radio or dropdown — `Colormap` / `User defined`
- [ ] **Colormap section** (visible only when `mode === "colormap"`):
  - Dropdown: colormap name (`hsv`, `cool`, `warm`, `greyscale`, …)
  - Slider: number of shades (10–40, step 1, default 20)
  - Slider: font color opacity (0–1, step 0.05, default 1.0)
  - Slider: background opacity (0–1, step 0.05, default 0.1)
- [ ] **User-defined section** (visible only when `mode === "userDefined"`):
  - For each heading level H1–H6:
    - Text input (or color picker): font color
    - Text input (or color picker): background color
    - Toggle: bold
    - Toggle: italic
- [ ] **Scope section**:
  - Toggle: enable in editor (Live Preview + Source)
  - Toggle: enable in reading view
- [ ] **Live preview**: call `rebuildStyles()` on every setting change (no save button needed)
- [ ] **Reset to defaults** button

---

## Phase 6 · Main Plugin (`src/main.ts`)

- [ ] Strip all sample plugin boilerplate
- [ ] `onload()`:
  1. Load settings (`this.loadData()`)
  2. Merge with `DEFAULT_SETTINGS`
  3. Create `<style>` element, append to `document.head`
  4. Inject initial CSS via `buildStylesheet(settings)`
  5. Register settings tab (`this.addSettingTab(...)`)
- [ ] `onunload()`: remove the `<style>` element (clean up DOM)
- [ ] `rebuildStyles()` helper: call `buildStylesheet` → `injectStyles`, then `saveData`
- [ ] Keep `main.ts` under 60 lines; all logic lives in `colorEngine.ts`, `styleInjector.ts`, `settings.ts`

---

## Phase 7 · QA & Testing

- [ ] Build: `npm run build` — must succeed with zero errors
- [ ] Lint: `npm run lint` — must pass
- [ ] **Manual test checklist**:
  - [ ] Headers H1–H6 are colored in Live Preview
  - [ ] Headers H1–H6 are colored in Reading mode
  - [ ] Headers H1–H6 are colored in Source mode
  - [ ] Headings inside fenced code blocks (` ``` `) are **not** colored
  - [ ] Headings inside YAML front matter are **not** colored
  - [ ] Changing settings updates colors immediately (no Obsidian restart needed)
  - [ ] Disabling the plugin removes all injected styles
  - [ ] Re-enabling restores styles correctly
  - [ ] Works in light theme and dark theme
  - [ ] User-defined mode: per-level colors apply correctly
  - [ ] Colormap mode: colors cycle correctly across multiple headings

---

## Phase 8 · Release Prep

- [ ] Final README with at least one screenshot or description of visual result
- [ ] Bump version: `npm run version` (updates `manifest.json` and `versions.json`)
- [ ] Production build: `npm run build`
- [ ] Create GitHub release tagged with the version number (no `v` prefix per `.npmrc`)
  - Attach: `main.js`, `manifest.json`, `styles.css`
- [ ] Submit to Obsidian community directory at https://community.obsidian.md/ via PR to obsidian-releases

---

## Obsidian Developer Policy Compliance

Reference: https://docs.obsidian.md/Developer+policies

| Rule | Status | Notes |
|---|---|---|
| No code obfuscation | ✅ | Source is open, bundled by esbuild (readable output) |
| No dynamic ads | ✅ | No network requests at all |
| No client-side telemetry | ✅ | Fully offline |
| No self-update mechanism | ✅ | Obsidian handles updates |
| LICENSE file present | ✅ | GPL-3.0-only |
| Attribution in README | ✅ | obsidian-sample-plugin + vscode-markdown-header-coloring credited |
| Trademark compliance | ✅ | "Obsidian" in name is acceptable for community plugins |
| No network use | ✅ | Nothing to disclose |

---

## Decisions & Rationale

| Decision | Choice | Reason |
|---|---|---|
| Styling mechanism | CSS injection | Simpler, no CM6 knowledge needed; Obsidian already applies `.HyperMD-header-N` classes |
| Color library | Native implementation | Keep `main.js` small; the `colormap` npm package adds ~100 KB; HSV is 10 lines of math |
| Code block exclusion | Inherent in CSS | CSS selectors for `h1`–`h6` and `.HyperMD-header` don't match code block content |
| Settings persistence | `loadData` / `saveData` | Standard Obsidian plugin pattern |
| File structure | `src/` with 4 files | `main.ts` (lifecycle), `settings.ts` (UI+interface), `colorEngine.ts` (math), `styleInjector.ts` (CSS) |

---

## Open Questions

- Which Obsidian API version introduces stable `.HyperMD-header-N` classes? → verify with DevTools
- Should we support mobile? (set `isDesktopOnly: false` if CSS injection works on iOS/Android)
- Should `styles.css` ship a default fallback or remain empty until settings are saved?
- Add a "preview" section in settings showing sample colored headings?
