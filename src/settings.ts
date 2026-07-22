import { App, PluginSettingTab, Setting, Notice } from "obsidian";
import type RainbowHeaderColoringPlugin from "./main";
import { COLORMAP_NAMES, COLORMAP_LABELS, type ColormapName } from "./colorEngine";
import { saveOverridesText } from "./overrideConfig";

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

const LEVEL_LABELS = ["H1", "H2", "H3", "H4", "H5", "H6"] as const;

export class HeaderColoringSettingsTab extends PluginSettingTab {
  plugin: RainbowHeaderColoringPlugin;

  constructor(app: App, plugin: RainbowHeaderColoringPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  /**
   * Declarative settings definitions for Obsidian 1.13+ settings search.
   * Path B dual support: this method runs on 1.13+, display() runs on older versions.
   * Both must be kept in sync.
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

  /**
   * Imperative fallback for Obsidian < 1.13.0.
   * On 1.13.0+, getSettingDefinitions() takes over and this method is not called.
   */
  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // ── Mode ─────────────────────────────────────────────────────────────
    new Setting(containerEl)
      .setName("Coloring mode")
      .setDesc("Colormap cycles through a built-in palette; user defined lets you set a color per heading level.")
      .addDropdown((dd) =>
        dd
          .addOption("colormap", "Colormap")
          .addOption("userDefined", "User defined")
          .setValue(this.plugin.settings.mode)
          .onChange((value) => {
            this.plugin.settings.mode = value as "colormap" | "userDefined";
            this.plugin.rebuildStyles();
            // eslint-disable-next-line @typescript-eslint/no-deprecated -- intentional: display() is kept for Obsidian < 1.13 compat
            this.display();
          })
      );

    // ── Scope ─────────────────────────────────────────────────────────────
    new Setting(containerEl).setName("Scope").setHeading();

    new Setting(containerEl)
      .setName("Enable in editor")
      .setDesc("Apply colors in the editor (live preview and source mode).")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.enableEditorMode).onChange((v) => {
          this.plugin.settings.enableEditorMode = v;
          this.plugin.rebuildStyles();
        })
      );

    new Setting(containerEl)
      .setName("Enable in reading view")
      .setDesc("Apply colors when reading notes.")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.enableReadingMode).onChange((v) => {
          this.plugin.settings.enableReadingMode = v;
          this.plugin.rebuildStyles();
        })
      );

    // ── Colormap settings ─────────────────────────────────────────────────
    if (this.plugin.settings.mode === "colormap") {
      new Setting(containerEl).setName("Colormap").setHeading();

      new Setting(containerEl)
        .setName("Palette")
        .setDesc("Color palette used to color heading levels.")
        .addDropdown((dd) => {
          for (const name of COLORMAP_NAMES) {
            dd.addOption(name, COLORMAP_LABELS[name]);
          }
          return dd.setValue(this.plugin.settings.colormapName).onChange((v) => {
            this.plugin.settings.colormapName = v as ColormapName;
            this.plugin.rebuildStyles();
          });
        });

      new Setting(containerEl)
        .setName("Number of shades")
        .setDesc("How many color steps in the palette (10–40).")
        .addSlider((s) =>
          s
            .setLimits(10, 40, 1)
            .setValue(this.plugin.settings.nshades)
            .setDisplayFormat((v) => String(v))
            .onChange((v) => {
              this.plugin.settings.nshades = v;
              this.plugin.rebuildStyles();
            })
        );

      new Setting(containerEl)
        .setName("Font color opacity")
        .setDesc("Opacity of header text color (0 = transparent, 1 = solid).")
        .addSlider((s) =>
          s
            .setLimits(0, 1, 0.05)
            .setValue(this.plugin.settings.fontColorOpacity)
            .setDisplayFormat((v) => v.toFixed(2))
            .onChange((v) => {
              this.plugin.settings.fontColorOpacity = v;
              this.plugin.rebuildStyles();
            })
        );

      new Setting(containerEl)
        .setName("Background color opacity")
        .setDesc("Opacity of header background color (0 = transparent, 1 = solid).")
        .addSlider((s) =>
          s
            .setLimits(0, 1, 0.05)
            .setValue(this.plugin.settings.backgroundColorOpacity)
            .setDisplayFormat((v) => v.toFixed(2))
            .onChange((v) => {
              this.plugin.settings.backgroundColorOpacity = v;
              this.plugin.rebuildStyles();
            })
        );

      new Setting(containerEl)
        .setName("Cycle colors across headings")
        .setDesc("When enabled, each heading gets a unique color from the palette regardless of level, cycling sequentially through the document.")
        .addToggle((t) =>
          t.setValue(this.plugin.settings.cycleColors).onChange((v) => {
            this.plugin.settings.cycleColors = v;
            this.plugin.rebuildStyles();
          })
        );
    }

    // ── User-defined settings ─────────────────────────────────────────────
    if (this.plugin.settings.mode === "userDefined") {
      new Setting(containerEl).setName("Header colors").setHeading();

      (["h1", "h2", "h3", "h4", "h5", "h6"] as const).forEach((key, idx) => {
        const cfg = this.plugin.settings.userDefined[key];

        new Setting(containerEl).setName(LEVEL_LABELS[idx] ?? `H${idx + 1}`).setHeading();

        new Setting(containerEl).setName("Font color").addColorPicker((cp) =>
          cp.setValue(cfg.color).onChange((v) => {
            cfg.color = v;
            this.plugin.rebuildStyles();
          })
        );

        new Setting(containerEl).setName("Bold").addToggle((t) =>
          t.setValue(cfg.bold).onChange((v) => {
            cfg.bold = v;
            this.plugin.rebuildStyles();
          })
        );

        new Setting(containerEl).setName("Italic").addToggle((t) =>
          t.setValue(cfg.italic).onChange((v) => {
            cfg.italic = v;
            this.plugin.rebuildStyles();
          })
        );

        new Setting(containerEl).setName("Enable background color").addToggle((t) =>
          t.setValue(cfg.enableBackground).onChange((v) => {
            cfg.enableBackground = v;
            this.plugin.rebuildStyles();
          })
        );

        new Setting(containerEl).setName("Background color").addColorPicker((cp) =>
          cp.setValue(cfg.backgroundColor).onChange((v) => {
            cfg.backgroundColor = v;
            this.plugin.rebuildStyles();
          })
        );
      });
    }

    // ── Config overrides ──────────────────────────────────────────────────
    new Setting(containerEl).setName("Config overrides").setHeading();

    new Setting(containerEl)
      .setName("Override file")
      .setDesc(
        `Stored at ${this.app.vault.configDir}/plugins/rainbow-header-coloring/overrides.jsonc. ` +
          "Supports vault, folder, and file scopes. Edit here or directly on disk. " +
          "Changes are applied immediately on save."
      );

    // Debounce timer for auto-save
    let saveTimer: ReturnType<typeof window.setTimeout> | null = null;

    const overrideTextArea = new Setting(containerEl)
      .setName("Overrides (jsonc)")
      .setDesc("Edit the overrides config. Use // for comments. Saves automatically 1 s after you stop typing.")
      .addTextArea((ta) => {
        ta.inputEl.rows = 18;
        ta.inputEl.addClass("rhc-overrides-textarea");
        ta.setValue(this.plugin.overridesText);
        ta.onChange((value) => {
          if (saveTimer) window.clearTimeout(saveTimer);
          saveTimer = window.setTimeout(async () => {
            this.plugin.overrides = await saveOverridesText(this.plugin.app, value);
            this.plugin.overridesText = value;
            this.plugin.rebuildStyles();
          }, 1000);
        });
        return ta;
      });

    new Setting(containerEl).addButton((btn) =>
      btn.setButtonText("Reload from disk").onClick(async () => {
        await this.plugin.reloadOverrides();
        this.plugin.rebuildStyles();
        // Refresh the textarea value
        overrideTextArea.components.forEach((c) => {
          if ("setValue" in c) (c as { setValue: (v: string) => void }).setValue(this.plugin.overridesText);
        });
        new Notice("Overrides reloaded.");
      })
    );
  }
}
