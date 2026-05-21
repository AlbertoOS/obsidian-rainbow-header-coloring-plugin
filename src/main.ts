import { Plugin } from "obsidian";
import {
	HeaderColoringSettings,
	DEFAULT_SETTINGS,
	HeaderColoringSettingsTab,
} from "./settings";
import { buildStylesheet, injectStyles } from "./styleInjector";

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
	}

	onunload() {
		this.styleEl.remove();
	}

	rebuildStyles(): void {
		injectStyles(this.styleEl, buildStylesheet(this.settings));
		void this.saveData(this.settings);
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
