import { Plugin, MarkdownPostProcessorContext } from "obsidian";
import { HeaderColoringSettings, DEFAULT_SETTINGS, HeaderColoringSettingsTab } from "./settings";
import { buildStylesheet, injectStyles } from "./styleInjector";
import { cycleViewPlugin, setCyclePluginState, updateReadingViewCycles } from "./cyclePlugin";
import { OverrideConfig, loadOverrides, readOverridesText, resolveEffectiveSettings, ensureOverridesFile } from "./overrideConfig";

export default class RainbowHeaderColoringPlugin extends Plugin {
  settings!: HeaderColoringSettings;
  overrides: OverrideConfig = {};
  overridesText = "";
  private styleEl!: HTMLStyleElement;

  async onload() {
    await this.loadSettings();
    await ensureOverridesFile(this.app);
    await this.reloadOverrides();

    // Dynamic CSS injection is this plugin's core feature — the stylesheet content
    // is rebuilt from settings at runtime and cannot be a static styles.css file.
    this.styleEl = activeDocument.createElement("style");
    this.styleEl.id = "rainbow-header-coloring";
    activeDocument.head.appendChild(this.styleEl);

    this.rebuildStyles();
    this.addSettingTab(new HeaderColoringSettingsTab(this.app, this));

    // Register CM6 ViewPlugin for per-occurrence color cycling in editor
    this.registerEditorExtension(cycleViewPlugin);

    // Rebuild styles (and reading view cycles) whenever the active leaf changes
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        this.rebuildStyles();
      })
    );

    // Post-processor: assign cycle classes to headings after reading view renders
    this.registerMarkdownPostProcessor((_el: HTMLElement, _ctx: MarkdownPostProcessorContext) => {
      const effective = this.effectiveSettings();
      updateReadingViewCycles(this.app, effective);
    });
  }

  onunload() {
    this.styleEl.remove();
  }

  /** Reload overrides.jsonc from disk and update cached state. */
  async reloadOverrides(): Promise<void> {
    this.overridesText = await readOverridesText(this.app);
    this.overrides = await loadOverrides(this.app);
  }

  /** Compute effective settings for the currently active file. */
  effectiveSettings(): HeaderColoringSettings {
    const activeFile = this.app.workspace.getActiveFile();
    return resolveEffectiveSettings(activeFile?.path ?? null, this.settings, this.overrides);
  }

  rebuildStyles(): void {
    const effective = this.effectiveSettings();
    const cycleActive = effective.mode === "colormap" && effective.cycleColors;
    setCyclePluginState(effective.nshades, cycleActive);
    injectStyles(this.styleEl, buildStylesheet(effective));
    updateReadingViewCycles(this.app, effective);
    void this.saveData(this.settings);
  }

  async loadSettings(): Promise<void> {
    const data = (await this.loadData()) as Partial<HeaderColoringSettings> | null;
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...data,
      userDefined: Object.fromEntries(
        (["h1", "h2", "h3", "h4", "h5", "h6"] as const).map((k) => [k, { ...DEFAULT_SETTINGS.userDefined[k], ...(data?.userDefined?.[k] ?? {}) }])
      ) as HeaderColoringSettings["userDefined"],
    };
  }
}
