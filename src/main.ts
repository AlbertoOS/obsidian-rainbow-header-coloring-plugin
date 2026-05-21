import { Plugin, MarkdownPostProcessorContext } from "obsidian";
import {
	HeaderColoringSettings,
	DEFAULT_SETTINGS,
	HeaderColoringSettingsTab,
} from "./settings";
import { buildStylesheet, injectStyles } from "./styleInjector";
import { cycleViewPlugin, setCyclePluginState, updateReadingViewCycles } from "./cyclePlugin";

export default class RainbowHeaderColoringPlugin extends Plugin {
	settings!: HeaderColoringSettings;
	private styleEl!: HTMLStyleElement;

	async onload() {
		await this.loadSettings();

		// Dynamic CSS injection is this plugin's core feature — styles.css cannot serve this purpose.
		// eslint-disable-next-line obsidianmd/no-forbidden-elements, obsidianmd/prefer-active-doc
		this.styleEl = document.createElement("style");
		this.styleEl.id = "rainbow-header-coloring";
		// eslint-disable-next-line obsidianmd/prefer-active-doc
		document.head.appendChild(this.styleEl);

		this.rebuildStyles();
		this.addSettingTab(new HeaderColoringSettingsTab(this.app, this));

		// Register CM6 ViewPlugin for per-occurrence color cycling in editor
		this.registerEditorExtension(cycleViewPlugin);

		// Update reading view cycles when a leaf becomes active (new note opened)
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				updateReadingViewCycles(this.app, this.settings);
			}),
		);

		// Post-processor: assign cycle classes to headings after reading view renders
		this.registerMarkdownPostProcessor((_el: HTMLElement, _ctx: MarkdownPostProcessorContext) => {
			updateReadingViewCycles(this.app, this.settings);
		});
	}

	onunload() {
		this.styleEl.remove();
	}

	rebuildStyles(): void {
		const { settings } = this;
		const cycleActive = settings.mode === "colormap" && settings.cycleColors;
		setCyclePluginState(settings.nshades, cycleActive);
		injectStyles(this.styleEl, buildStylesheet(settings));
		updateReadingViewCycles(this.app, settings);
		void this.saveData(settings);
	}

	async loadSettings(): Promise<void> {
		const data = (await this.loadData()) as Partial<HeaderColoringSettings> | null;
		this.settings = {
			...DEFAULT_SETTINGS,
			...data,
			userDefined: Object.fromEntries(
				(["h1", "h2", "h3", "h4", "h5", "h6"] as const).map((k) => [
					k,
					{ ...DEFAULT_SETTINGS.userDefined[k], ...(data?.userDefined?.[k] ?? {}) },
				]),
			) as HeaderColoringSettings["userDefined"],
		};
	}
}
