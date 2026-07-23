import { App, PluginSettingTab } from "obsidian";
import type RainbowHeaderColoringPlugin from "./main";
import { COLORMAP_NAMES, COLORMAP_LABELS, type ColormapName } from "./colorEngine";

export interface UserDefinedHeaderLevel {
  color: string;
  backgroundColor: string;
  enableBackground: boolean;
  bold: boolean;
  italic: boolean;
}

export interface HeaderColoringSettings {
  mode: "colormap" | "userDefined";
  colormapName: ColormapName;
  nshades: number;
  fontColorOpacity: number;
  backgroundColorOpacity: number;
  cycleColors: boolean;
  enableEditorMode: boolean;
  enableReadingMode: boolean;
  userDefined: { [K in `h${1 | 2 | 3 | 4 | 5 | 6}`]: UserDefinedHeaderLevel };
}

const DEFAULT_LEVEL_COLORS: Record<string, string> = {
  h1: "#e06c75",
  h2: "#e5c07b",
  h3: "#98c379",
  h4: "#56b6c2",
  h5: "#61afef",
  h6: "#c678dd",
};

function defaultUserDefined(): HeaderColoringSettings["userDefined"] {
  const result = {} as HeaderColoringSettings["userDefined"];
  (["h1", "h2", "h3", "h4", "h5", "h6"] as const).forEach((k) => {
    result[k] = {
      color: DEFAULT_LEVEL_COLORS[k] ?? "#000000",
      backgroundColor: DEFAULT_LEVEL_COLORS[k] ?? "#000000",
      enableBackground: false,
      bold: false,
      italic: false,
    };
  });
  return result;
}

export const DEFAULT_SETTINGS: HeaderColoringSettings = {
  mode: "colormap",
  colormapName: "hsv",
  nshades: 20,
  fontColorOpacity: 1.0,
  backgroundColorOpacity: 0.1,
  cycleColors: true,
  enableEditorMode: true,
  enableReadingMode: true,
  userDefined: defaultUserDefined(),
};

export class HeaderColoringSettingsTab extends PluginSettingTab {
  plugin: RainbowHeaderColoringPlugin;

  constructor(app: App, plugin: RainbowHeaderColoringPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  /**
   * Declarative settings definitions for Obsidian 1.13+ settings search.
   * Replaces the imperative display() method (minAppVersion >= 1.13.0).
   */
  getSettingDefinitions() {
    const s = this.plugin.settings;
    const colormapOptions: Record<string, string> = {};
    for (const name of COLORMAP_NAMES) {
      colormapOptions[name] = COLORMAP_LABELS[name];
    }

    return [
      // ── Mode ──────────────────────────────────────────────────────────
      {
        name: "Coloring mode",
        desc: "Colormap cycles through a built-in palette; user defined lets you set a color per heading level.",
        control: {
          type: "dropdown" as const,
          key: "mode",
          options: { colormap: "Colormap", userDefined: "User defined" },
          defaultValue: s.mode,
        },
      },
      // ── Scope ─────────────────────────────────────────────────────────
      {
        type: "group" as const,
        heading: "Scope",
        items: [
          {
            name: "Enable in editor",
            desc: "Apply colors in the editor (live preview and source mode).",
            control: { type: "toggle" as const, key: "enableEditorMode", defaultValue: s.enableEditorMode },
          },
          {
            name: "Enable in reading view",
            desc: "Apply colors when reading notes.",
            control: { type: "toggle" as const, key: "enableReadingMode", defaultValue: s.enableReadingMode },
          },
        ],
      },
      // ── Colormap ──────────────────────────────────────────────────────
      ...(s.mode === "colormap"
        ? [
            {
              type: "group" as const,
              heading: "Colormap",
              items: [
                {
                  name: "Palette",
                  desc: "Color palette used to color heading levels.",
                  control: { type: "dropdown" as const, key: "colormapName", options: colormapOptions, defaultValue: s.colormapName },
                },
                {
                  name: "Number of shades",
                  desc: "How many color steps in the palette (10–40).",
                  control: { type: "slider" as const, key: "nshades", min: 10, max: 40, step: 1, defaultValue: s.nshades },
                },
                {
                  name: "Font color opacity",
                  desc: "Opacity of header text color (0 = transparent, 1 = solid).",
                  control: {
                    type: "slider" as const,
                    key: "fontColorOpacity",
                    min: 0,
                    max: 1,
                    step: 0.05,
                    defaultValue: s.fontColorOpacity,
                    displayFormat: (v: number) => v.toFixed(2),
                  },
                },
                {
                  name: "Background color opacity",
                  desc: "Opacity of header background color (0 = transparent, 1 = solid).",
                  control: {
                    type: "slider" as const,
                    key: "backgroundColorOpacity",
                    min: 0,
                    max: 1,
                    step: 0.05,
                    defaultValue: s.backgroundColorOpacity,
                    displayFormat: (v: number) => v.toFixed(2),
                  },
                },
                {
                  name: "Cycle colors across headings",
                  desc: "When enabled, each heading gets a unique color from the palette regardless of level, cycling sequentially through the document.",
                  control: { type: "toggle" as const, key: "cycleColors", defaultValue: s.cycleColors },
                },
              ],
            },
          ]
        : []),
    ];
  }
}

