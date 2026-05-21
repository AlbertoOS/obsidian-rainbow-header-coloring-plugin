import { App, PluginSettingTab, Setting } from "obsidian";
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

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// ── Mode ─────────────────────────────────────────────────────────────
		new Setting(containerEl)
			.setName("Coloring mode")
			.setDesc(
				"Colormap cycles through a built-in palette; user defined lets you set a color per heading level.",
			)
			.addDropdown((dd) =>
				dd
					.addOption("colormap", "Colormap")
					.addOption("userDefined", "User defined")
					.setValue(this.plugin.settings.mode)
					.onChange((value) => {
						this.plugin.settings.mode = value as "colormap" | "userDefined";
						this.plugin.rebuildStyles();
						this.display();
					}),
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
				}),
			);

		new Setting(containerEl)
			.setName("Enable in reading view")
			.setDesc("Apply colors when reading notes.")
			.addToggle((t) =>
				t.setValue(this.plugin.settings.enableReadingMode).onChange((v) => {
					this.plugin.settings.enableReadingMode = v;
					this.plugin.rebuildStyles();
				}),
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
						.setDynamicTooltip()
						.onChange((v) => {
							this.plugin.settings.nshades = v;
							this.plugin.rebuildStyles();
						}),
				);

			new Setting(containerEl)
				.setName("Font color opacity")
				.setDesc("Opacity of header text color (0 = transparent, 1 = solid).")
				.addSlider((s) =>
					s
						.setLimits(0, 1, 0.05)
						.setValue(this.plugin.settings.fontColorOpacity)
						.setDynamicTooltip()
						.onChange((v) => {
							this.plugin.settings.fontColorOpacity = v;
							this.plugin.rebuildStyles();
						}),
				);

			new Setting(containerEl)
				.setName("Background color opacity")
				.setDesc("Opacity of header background color (0 = transparent, 1 = solid).")
				.addSlider((s) =>
					s
						.setLimits(0, 1, 0.05)
						.setValue(this.plugin.settings.backgroundColorOpacity)
						.setDynamicTooltip()
						.onChange((v) => {
							this.plugin.settings.backgroundColorOpacity = v;
							this.plugin.rebuildStyles();
						}),
				);
		}

		// ── User-defined settings ─────────────────────────────────────────────
		if (this.plugin.settings.mode === "userDefined") {
			new Setting(containerEl).setName("Header colors").setHeading();

			(["h1", "h2", "h3", "h4", "h5", "h6"] as const).forEach((key, idx) => {
				const cfg = this.plugin.settings.userDefined[key];

				new Setting(containerEl).setName(LEVEL_LABELS[idx] ?? `H${idx + 1}`).setHeading();

				new Setting(containerEl)
					.setName("Font color")
					.addColorPicker((cp) =>
						cp.setValue(cfg.color).onChange((v) => {
							cfg.color = v;
							this.plugin.rebuildStyles();
						}),
					);

				new Setting(containerEl)
					.setName("Bold")
					.addToggle((t) =>
						t.setValue(cfg.bold).onChange((v) => {
							cfg.bold = v;
							this.plugin.rebuildStyles();
						}),
					);

				new Setting(containerEl)
					.setName("Italic")
					.addToggle((t) =>
						t.setValue(cfg.italic).onChange((v) => {
							cfg.italic = v;
							this.plugin.rebuildStyles();
						}),
					);

				new Setting(containerEl)
					.setName("Enable background color")
					.addToggle((t) =>
						t.setValue(cfg.enableBackground).onChange((v) => {
							cfg.enableBackground = v;
							this.plugin.rebuildStyles();
						}),
					);

				new Setting(containerEl)
					.setName("Background color")
					.addColorPicker((cp) =>
						cp.setValue(cfg.backgroundColor).onChange((v) => {
							cfg.backgroundColor = v;
							this.plugin.rebuildStyles();
						}),
					);
			});
		}
	}
}
