import type { HeaderColoringSettings } from "./settings";
import { generateColormapColors } from "./colorEngine";

const LEVELS = [1, 2, 3, 4, 5, 6] as const;

function editorRules(
	level: number,
	font: string,
	bg: string,
	bold: boolean,
	italic: boolean,
): string {
	const textProps = [`color: ${font}`];
	if (bold) textProps.push("font-weight: bold");
	if (italic) textProps.push("font-style: italic");
	return [
		`.cm-line.HyperMD-header-${level} { background-color: ${bg}; }`,
		`.cm-line.HyperMD-header-${level} .cm-header-${level} { ${textProps.join("; ")}; }`,
	].join("\n");
}

function readingRules(
	level: number,
	font: string,
	bg: string,
	bold: boolean,
	italic: boolean,
): string {
	const props = [`color: ${font}`, `background-color: ${bg}`];
	if (bold) props.push("font-weight: bold");
	if (italic) props.push("font-style: italic");
	return `.markdown-reading-view h${level} { ${props.join("; ")}; }`;
}

export function buildStylesheet(settings: HeaderColoringSettings): string {
	const rules: string[] = [];

	if (settings.mode === "colormap") {
		const colors = generateColormapColors(
			settings.colormapName,
			settings.nshades,
			settings.fontColorOpacity,
			settings.backgroundColorOpacity,
		);
		LEVELS.forEach((level, i) => {
			// Spread 6 levels evenly across the nshades palette
			const idx = Math.round(i * (colors.length - 1) / (LEVELS.length - 1));
			const entry = colors[idx] ?? colors[colors.length - 1];
			if (!entry) return;
			if (settings.enableEditorMode)
				rules.push(editorRules(level, entry.font, entry.background, false, false));
			if (settings.enableReadingMode)
				rules.push(readingRules(level, entry.font, entry.background, false, false));
		});
	} else {
		LEVELS.forEach((level) => {
			const key = `h${level}` as const;
			const cfg = settings.userDefined[key];
			const font = cfg.color || "inherit";
			const bg = cfg.enableBackground ? cfg.backgroundColor : "transparent";
			if (settings.enableEditorMode)
				rules.push(editorRules(level, font, bg, cfg.bold, cfg.italic));
			if (settings.enableReadingMode)
				rules.push(readingRules(level, font, bg, cfg.bold, cfg.italic));
		});
	}

	return rules.join("\n");
}

export function injectStyles(el: HTMLStyleElement, css: string): void {
	el.textContent = css;
}
