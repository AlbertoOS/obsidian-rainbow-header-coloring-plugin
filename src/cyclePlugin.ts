import { ViewPlugin, Decoration, type DecorationSet, type EditorView, type ViewUpdate } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import type { App } from "obsidian";
import type { HeaderColoringSettings } from "./settings";

// Module-level state shared with the plugin instance
let _nshades = 20;
let _enabled = true;

export function setCyclePluginState(nshades: number, enabled: boolean): void {
  _nshades = nshades;
  _enabled = enabled;
}

const ATX_HEADER_RE = /^#{1,6}\s/;
const SETEXT_H1_RE = /^={2,}\s*$/;
const SETEXT_H2_RE = /^-{2,}\s*$/;

/** Build decorations that assign rhc-cycle-N classes to heading lines. */
function buildDecorations(view: EditorView): DecorationSet {
  if (!_enabled) return Decoration.none;

  const builder = new RangeSetBuilder<Decoration>();
  const doc = view.state.doc;
  let headingCount = 0;
  let inFrontmatter = false;
  let frontmatterChecked = false;
  let inFencedBlock = false;
  let fenceChar = "";

  for (let lineNum = 1; lineNum <= doc.lines; lineNum++) {
    const line = doc.line(lineNum);
    const text = line.text;

    // YAML frontmatter: only if first non-empty line is "---"
    if (!frontmatterChecked) {
      if (text.trim() === "") continue;
      frontmatterChecked = true;
      if (text === "---") {
        inFrontmatter = true;
        continue;
      }
    }
    if (inFrontmatter) {
      if (text === "---" || text === "...") inFrontmatter = false;
      continue;
    }

    // Fenced code blocks
    const fenceMatch = text.match(/^(`{3,}|~{3,})/);
    if (fenceMatch) {
      const ch = fenceMatch[1]![0]!;
      if (!inFencedBlock) {
        inFencedBlock = true;
        fenceChar = ch;
      } else if (ch === fenceChar) {
        inFencedBlock = false;
      }
      continue;
    }
    if (inFencedBlock) continue;

    // Check for ATX heading (# through ######)
    if (ATX_HEADER_RE.test(text)) {
      const cycleIdx = headingCount % _nshades;
      headingCount++;
      builder.add(line.from, line.from, Decoration.line({ class: `rhc-cycle-${cycleIdx}` }));
      continue;
    }

    // Check for setext heading: next line is all === (H1) or --- (H2)
    if (lineNum < doc.lines && text.trim() !== "") {
      const nextText = doc.line(lineNum + 1).text;
      if (SETEXT_H1_RE.test(nextText) || SETEXT_H2_RE.test(nextText)) {
        const cycleIdx = headingCount % _nshades;
        headingCount++;
        builder.add(line.from, line.from, Decoration.line({ class: `rhc-cycle-${cycleIdx}` }));
      }
    }
  }

  return builder.finish();
}

class CyclePlugin {
  decorations: DecorationSet;
  private lastEnabled: boolean;
  private lastNshades: number;

  constructor(view: EditorView) {
    this.lastEnabled = _enabled;
    this.lastNshades = _nshades;
    this.decorations = buildDecorations(view);
  }

  update(update: ViewUpdate): void {
    const settingsChanged = _enabled !== this.lastEnabled || _nshades !== this.lastNshades;
    if (update.docChanged || update.viewportChanged || settingsChanged) {
      this.lastEnabled = _enabled;
      this.lastNshades = _nshades;
      this.decorations = buildDecorations(update.view);
    }
  }
}

export const cycleViewPlugin = ViewPlugin.fromClass(CyclePlugin, {
  decorations: (v) => v.decorations,
});

/** Update rhc-cycle-N classes on heading elements in reading view. */
export function updateReadingViewCycles(app: App, settings: HeaderColoringSettings): void {
  const shouldCycle = settings.mode === "colormap" && settings.cycleColors && settings.enableReadingMode;

  // Remove all existing cycle classes from reading view headings
  app.workspace.containerEl
    .querySelectorAll<HTMLElement>(
      ".markdown-reading-view h1, .markdown-reading-view h2, .markdown-reading-view h3, .markdown-reading-view h4, .markdown-reading-view h5, .markdown-reading-view h6"
    )
    .forEach((el) => {
      el.classList.forEach((cls) => {
        if (cls.startsWith("rhc-cycle-")) el.classList.remove(cls);
      });
    });

  if (!shouldCycle) return;

  // Re-assign cycle classes sequentially across all headings in each reading pane
  app.workspace.containerEl.querySelectorAll<HTMLElement>(".markdown-reading-view .markdown-preview-section").forEach((section) => {
    let count = 0;
    section.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6").forEach((el) => {
      el.classList.add(`rhc-cycle-${count % settings.nshades}`);
      count++;
    });
  });
}
