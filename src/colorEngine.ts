export type ColormapName = "hsv" | "cool" | "warm" | "greyscale";

export const COLORMAP_NAMES: ColormapName[] = ["hsv", "cool", "warm", "greyscale"];

export const COLORMAP_LABELS: Record<ColormapName, string> = {
	hsv: "HSV (rainbow)",
	cool: "Cool (cyan → magenta)",
	warm: "Warm (red → yellow)",
	greyscale: "Greyscale",
};

export interface ColorEntry {
	font: string;
	background: string;
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
	const i = Math.floor(h * 6);
	const f = h * 6 - i;
	const p = v * (1 - s);
	const q = v * (1 - f * s);
	const t = v * (1 - (1 - f) * s);
	switch (i % 6) {
		case 0: return [v, t, p];
		case 1: return [q, v, p];
		case 2: return [p, v, t];
		case 3: return [p, q, v];
		case 4: return [t, p, v];
		default: return [v, p, q];
	}
}

function toRgba(r: number, g: number, b: number, a: number): string {
	return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
}

function colormapColor(name: ColormapName, t: number): [number, number, number] {
	switch (name) {
		case "hsv":       return hsvToRgb(t, 0.75, 1);
		case "cool":      return hsvToRgb(0.5 + t * 0.33, 0.75, 1); // cyan → magenta
		case "warm":      return hsvToRgb(t * 0.17, 0.75, 1);        // red → yellow
		case "greyscale": { const v = 0.9 - t * 0.65; return [v, v, v]; }
	}
}

export function generateColormapColors(
	name: ColormapName,
	nshades: number,
	fontOpacity: number,
	bgOpacity: number,
): ColorEntry[] {
	return Array.from({ length: nshades }, (_, i) => {
		const t = nshades > 1 ? i / (nshades - 1) : 0;
		const [r, g, b] = colormapColor(name, t);
		return {
			font: toRgba(r, g, b, fontOpacity),
			background: toRgba(r, g, b, bgOpacity),
		};
	});
}
