# TODO — Obsidian Rainbow Header Coloring Plugin

**Status:** Core implementation complete — ready for QA (Phase 7)

Inspired by [vscode-markdown-header-coloring](https://github.com/satokaz/vscode-markdown-header-coloring) by satokaz.
Scaffolded from the [obsidian-sample-plugin](https://github.com/obsidianmd/obsidian-sample-plugin) template.

---

## Phase 1 · Project Metadata & Cleanup ✅

- [x] **Update `manifest.json`** — set `id`, `name`, `description`, `author`, `authorUrl`, `minAppVersion`
- [x] **Update `package.json`** — set `name`, `description`, `author`, `repository` URL
- [x] **Rewrite `README.md`** — purpose, features overview, installation steps, settings reference, credits
- [x] **Remove sample plugin boilerplate** from `src/main.ts`
- [x] **Clear `src/settings.ts`** — replaced with `HeaderColoringSettings` interface and real UI

---

## Phase 2 · Architecture Decision & Settings Design ✅

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

## Phase 3 · Color Engine (`src/colorEngine.ts`) ✅

- [x] Implement `hsvToRgb` and `toRgba` helpers
- [x] Implement `colormapColor(name, t)` for `hsv`, `cool`, `warm`, `greyscale`
- [x] Implement `generateColormapColors(name, nshades, fontOpacity, bgOpacity): ColorEntry[]`
- [x] Export `COLORMAP_NAMES` and `COLORMAP_LABELS` constants for settings UI
- [x] **No external `colormap` npm package** — pure math, ~50 lines

---

## Phase 4 · CSS Injector (`src/styleInjector.ts`) ✅

- [x] Implement `buildStylesheet(settings): string`
  - [x] Colormap mode: spread 6 heading levels evenly across `nshades` palette
  - [x] User-defined mode: per-level color, background, bold, italic
  - [x] Editor selectors (`.cm-line.HyperMD-header-N`, `.cm-header-N`) and reading view (`h1`–`h6`)
- [x] Implement `injectStyles(el, css)` — sets `el.textContent`

---

## Phase 5 · Settings UI (`src/settings.ts`) ✅

- [x] `HeaderColoringSettings` interface with all fields
- [x] `DEFAULT_SETTINGS` with sensible defaults (HSV colormap, opacity 1.0/0.1)
- [x] `HeaderColoringSettingsTab` with:
  - [x] Mode dropdown (colormap / user defined)
  - [x] Scope toggles (editor / reading view)
  - [x] Colormap section: palette dropdown, shades slider, opacity sliders
  - [x] User-defined section: per-level color pickers, bold/italic toggles, background toggles
  - [x] Live rebuild on every setting change (no save button)

---

## Phase 6 · Main Plugin (`src/main.ts`) ✅

- [x] Strip all sample plugin boilerplate
- [x] `onload()`: load settings, create `<style>` element, inject CSS, register settings tab
- [x] `onunload()`: remove the `<style>` element (clean DOM)
- [x] `rebuildStyles()`: `buildStylesheet` → `injectStyles` → `saveData`
- [x] Deep-merge `loadSettings()` for nested `userDefined` object
- [x] `main.ts` under 45 lines

---

## Phase 7 · QA & Testing

- [x] Build: `npm run build` — must succeed with zero errors
- [x] Lint: `npm run lint` — must pass
- [x] **Test vault in repo** (`test-plugin-vault/`):
  - 9 markdown files covering all edge cases (happy path, code blocks, YAML frontmatter, blockquotes, inline formatting, real-world structure, callouts, consecutive same-level, edge cases)
  - Run `npm run install-test` to build and copy artifacts into the vault
  - Open `test-plugin-vault/` in Obsidian and enable **Rainbow Header Coloring**
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
- [ ] **Beta testing via BRAT** (optional, before public submission):
  - Testers install the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin
  - They add your GitHub repo URL in BRAT → **Add Beta Plugin**
  - No public release required — useful for community feedback before submission

---

## Phase 8 · Release Prep

- [ ] **GitHub repo settings**: go to **Settings → Actions → General → Workflow permissions**, select **Read and write permissions**, save. Required for the release workflow to create GitHub releases.
- [ ] Final README with at least one screenshot or description of visual result
- [ ] Ensure `manifest.json` passes all submission requirements:
  - `id` does not contain "obsidian" — currently `"rainbow-header-coloring"` ✅
  - `description` ≤250 chars, ends with period, no emoji/special chars, sentence case ✅
  - `fundingUrl` absent (not accepting donations) ✅
  - `isDesktopOnly: false` (no Node/Electron APIs used) ✅
  - `minAppVersion` set appropriately ✅
- [ ] Bump version: `npm run version` (updates `manifest.json` and `versions.json`)
- [ ] Production build: `npm run build`
- [ ] **Create GitHub release** (via GitHub Actions — automated):
  - Create an annotated tag matching the version in `manifest.json`:
    ```bash
    git tag -a 1.0.0 -m "1.0.0"
    git push origin 1.0.0
    ```
  - The `.github/workflows/release.yml` workflow triggers automatically
  - It builds the plugin and creates a **draft** GitHub release with `main.js`, `manifest.json`, `styles.css` attached
  - Go to **Releases** on GitHub, edit the draft, add release notes, and **Publish**
- [ ] **Submit to Obsidian community directory**:
  1. Go to [community.obsidian.md](https://community.obsidian.md) and sign in with your Obsidian account
  2. Link your GitHub account to your profile
  3. Select **Plugins → New plugin**
  4. Enter the GitHub repository URL
  5. Review and agree to the Developer policies
  6. Select **Submit**
  - The automated review checks `manifest.json` at HEAD — make sure it's committed and accurate
  - The `id` must be unique across all published plugins
  - Address any automated review feedback by publishing a new release with an incremented version

---

## Obsidian Developer Policy Compliance

Reference: https://docs.obsidian.md/Developer+policies  
Submission requirements: https://docs.obsidian.md/Plugins/Releasing/Submission+requirements+for+plugins  
Plugin guidelines: https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines

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
  | Plugin `id` doesn't contain "obsidian" | ✅ | id is `"rainbow-header-coloring"` |
| Plugin ID not in command IDs | ✅ | Obsidian auto-prefixes; register commands without the prefix |
| `fundingUrl` absent | ✅ | Not accepting donations |
| `isDesktopOnly: false` | ✅ | No Node.js / Electron APIs used; CSS injection works on mobile |
| Description ≤250 chars, ends with period, no emoji | ✅ | Currently 105 chars |
| No `innerHTML`/`outerHTML`/`insertAdjacentHTML` | ✅ | Using `createEl()`, DOM API only |
| Use `this.app` not global `app` | ✅ | Enforced throughout |
| Settings headings via `setHeading()` | ✅ | Not using `<h2>` tags |
| No hardcoded inline styles | ✅ | Plugin uses CSS injection via `<style>` tag (intentional for this plugin's function) |
| All sample code removed | ✅ | No `MyPlugin`, `SampleSettingTab`, or sample boilerplate remains |

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
