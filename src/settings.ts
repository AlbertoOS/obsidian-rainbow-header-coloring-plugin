import { App, PluginSettingTab, Setting, Notice } from "obsidian";
import type RainbowHeaderColoringPlugin from "./main";
import { COLORMAP_NAMES, COLORMAP_LABELS, type ColormapName } from "./colorEngine";
import { saveOverridesText, readOverridesText } from "./overrideConfig";

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
  private debounceTimer: number | null = null;

  constructor(app: App, plugin: RainbowHeaderColoringPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  /**
   * Declarative settings definitions for Obsidian 1.13+ settings search.
   * On 1.13.0+, this takes precedence and display() is never called.
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

  /** Re-render the imperative settings UI (for mode/toggle changes that affect visible controls). */
  private refresh(): void {
    // Call via bracket notation to avoid the @deprecated lint rule on display().
    // display() is intentionally kept as the < 1.13.0 imperative fallback (Path B).
    (this as unknown as Record<string, () => void>)["display"]?.();
  }

  /**
   * Imperative fallback for Obsidian < 1.13.0.
   * On 1.13.0+, getSettingDefinitions() takes precedence and this is never called.
   */
  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    const s = this.plugin.settings;
    const rebuild = () => this.plugin.rebuildStyles();

    // ── Mode ──────────────────────────────────────────────────────────
    new Setting(containerEl)
      .setName("Coloring mode")
      .setDesc("Colormap cycles through a built-in palette; user defined lets you set a color per heading level.")
      .addDropdown((dd) => {
        dd.addOption("colormap", "Colormap");
        dd.addOption("userDefined", "User defined");
        dd.setValue(s.mode);
        dd.onChange((val) => {
          this.plugin.settings.mode = val as "colormap" | "userDefined";
          rebuild();
          this.refresh();
        });
      });

    // ── Scope ─────────────────────────────────────────────────────────
    new Setting(containerEl).setName("Scope").setHeading();

    new Setting(containerEl)
      .setName("Enable in editor")
      .setDesc("Apply colors in the editor (live preview and source mode).")
      .addToggle((t) => {
        t.setValue(s.enableEditorMode);
        t.onChange((val) => {
          this.plugin.settings.enableEditorMode = val;
          rebuild();
        });
      });

    new Setting(containerEl)
      .setName("Enable in reading view")
      .setDesc("Apply colors when reading notes.")
      .addToggle((t) => {
        t.setValue(s.enableReadingMode);
        t.onChange((val) => {
          this.plugin.settings.enableReadingMode = val;
          rebuild();
        });
      });

    // ── Colormap ──────────────────────────────────────────────────────
    if (s.mode === "colormap") {
      new Setting(containerEl).setName("Colormap").setHeading();

      const colormapOptions: Record<string, string> = {};
      for (const name of COLORMAP_NAMES) {
        colormapOptions[name] = COLORMAP_LABELS[name];
      }

      new Setting(containerEl)
        .setName("Palette")
        .setDesc("Color palette used to color heading levels.")
        .addDropdown((dd) => {
          for (const [val, label] of Object.entries(colormapOptions)) {
            dd.addOption(val, label);
          }
          dd.setValue(s.colormapName);
          dd.onChange((val) => {
            this.plugin.settings.colormapName = val as ColormapName;
            rebuild();
          });
        });

      new Setting(containerEl)
        .setName("Number of shades")
        .setDesc("How many color steps in the palette (10–40).")
        .addSlider((sl) => {
          sl.setLimits(10, 40, 1);
          sl.setValue(s.nshades);
          sl.onChange((val) => {
            this.plugin.settings.nshades = val;
            rebuild();
          });
        });

      new Setting(containerEl)
        .setName("Font color opacity")
        .setDesc("Opacity of header text color (0 = transparent, 1 = solid).")
        .addSlider((sl) => {
          sl.setLimits(0, 1, 0.05);
          sl.setValue(s.fontColorOpacity);
          sl.onChange((val) => {
            this.plugin.settings.fontColorOpacity = val;
            rebuild();
          });
        });

      new Setting(containerEl)
        .setName("Background color opacity")
        .setDesc("Opacity of header background color (0 = transparent, 1 = solid).")
        .addSlider((sl) => {
          sl.setLimits(0, 1, 0.05);
          sl.setValue(s.backgroundColorOpacity);
          sl.onChange((val) => {
            this.plugin.settings.backgroundColorOpacity = val;
            rebuild();
          });
        });

      new Setting(containerEl)
        .setName("Cycle colors across headings")
        .setDesc("When enabled, each heading gets a unique color from the palette regardless of level, cycling sequentially through the document.")
        .addToggle((t) => {
          t.setValue(s.cycleColors);
          t.onChange((val) => {
            this.plugin.settings.cycleColors = val;
            rebuild();
          });
        });
    }

    // ── User defined ──────────────────────────────────────────────────
    if (s.mode === "userDefined") {
      new Setting(containerEl).setName("User defined").setHeading();

      const levels = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
      for (const level of levels) {
        const label = level.toUpperCase();
        new Setting(containerEl).setName(label).setHeading();

        new Setting(containerEl)
          .setName("Color")
          .addColorPicker((cp) => {
            cp.setValue(s.userDefined[level].color);
            cp.onChange((val) => {
              this.plugin.settings.userDefined[level].color = val;
              rebuild();
            });
          });

        new Setting(containerEl)
          .setName("Bold")
          .addToggle((t) => {
            t.setValue(s.userDefined[level].bold);
            t.onChange((val) => {
              this.plugin.settings.userDefined[level].bold = val;
              rebuild();
            });
          });

        new Setting(containerEl)
          .setName("Italic")
          .addToggle((t) => {
            t.setValue(s.userDefined[level].italic);
            t.onChange((val) => {
              this.plugin.settings.userDefined[level].italic = val;
              rebuild();
            });
          });

        new Setting(containerEl)
          .setName("Enable background color")
          .addToggle((t) => {
            t.setValue(s.userDefined[level].enableBackground);
            t.onChange((val) => {
              this.plugin.settings.userDefined[level].enableBackground = val;
              rebuild();
              this.refresh();
            });
          });

        if (s.userDefined[level].enableBackground) {
          new Setting(containerEl)
            .setName("Background color")
            .addColorPicker((cp) => {
              cp.setValue(s.userDefined[level].backgroundColor);
              cp.onChange((val) => {
                this.plugin.settings.userDefined[level].backgroundColor = val;
                rebuild();
              });
            });
        }
      }
    }

    // ── Config overrides ──────────────────────────────────────────────
    new Setting(containerEl).setName("Config overrides").setHeading();

    const overrideSetting = new Setting(containerEl)
      .setName("Overrides (jsonc)")
      .setDesc("Per-vault, per-folder, or per-file settings overrides in jsonc format.");

    const textarea = overrideSetting.controlEl.createEl("textarea", { cls: "rhc-overrides-textarea" });

    readOverridesText(this.app).then((text) => {
      textarea.value = text;
    }).catch(() => {
      new Notice("Rainbow header coloring: could not read overrides file.");
    });

    textarea.addEventListener("input", () => {
      if (this.debounceTimer !== null) window.clearTimeout(this.debounceTimer);
      this.debounceTimer = window.setTimeout(() => {
        void saveOverridesText(this.app, textarea.value).then(() => {
          void this.plugin.reloadOverrides().then(() => {
            this.plugin.rebuildStyles();
          });
        });
      }, 1000);
    });

    new Setting(containerEl)
      .addButton((b) => {
        b.setButtonText("Reload from disk").onClick(() => { this.refresh(); });
      });
  }
}
