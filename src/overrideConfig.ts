import type { App } from "obsidian";
import type { HeaderColoringSettings, UserDefinedHeaderLevel } from "./settings";
import { DEFAULT_SETTINGS } from "./settings";

/** A partial settings override — any subset of HeaderColoringSettings. */
export type PartialHeaderSettings = Partial<Omit<HeaderColoringSettings, "userDefined">> & {
  userDefined?: Partial<{ [K in `h${1 | 2 | 3 | 4 | 5 | 6}`]: Partial<UserDefinedHeaderLevel> }>;
};

/** The shape of the overrides.jsonc file. */
export interface OverrideConfig {
  /** Applies to every file in the vault. */
  vault?: PartialHeaderSettings;
  /**
   * Applies to files inside matching folders.
   * Keys are folder paths relative to vault root (e.g. "Work", "Personal/Journal").
   * Use "" for the vault root. More specific paths override parent folders.
   */
  folders?: Record<string, PartialHeaderSettings>;
  /**
   * Applies to specific files.
   * Keys are file paths relative to vault root including extension (e.g. "Work/Meeting.md").
   */
  files?: Record<string, PartialHeaderSettings>;
}

function overridePath(app: App): string {
  return `${app.vault.configDir}/plugins/rainbow-header-coloring/overrides.jsonc`;
}

export const DEFAULT_OVERRIDE_TEMPLATE = `{
  // Override plugin settings per vault, folder, or file.
  // Any key from the plugin settings can be specified in each block.
  // Priority: file > folder (most specific) > vault > plugin UI settings.
  //
  // Available keys:
  //   mode: "colormap" | "userDefined"
  //   colormapName: "hsv" | "cool" | "warm" | "greyscale"
  //   nshades: 10–40
  //   fontColorOpacity: 0.0–1.0
  //   backgroundColorOpacity: 0.0–1.0
  //   cycleColors: true | false
  //   enableEditorMode: true | false
  //   enableReadingMode: true | false
  //   userDefined: { h1: { color, backgroundColor, enableBackground, bold, italic }, ... }

  // Vault-wide overrides (applies to all files unless overridden below):
  "vault": {
  },

  // Folder overrides (relative path from vault root, no leading slash):
  "folders": {
    // "Work": { "colormapName": "warm" },
    // "Personal/Journal": { "cycleColors": false }
  },

  // File overrides (relative path including .md extension):
  "files": {
    // "Daily Notes/2024-01-01.md": { "mode": "userDefined" }
  }
}
`;

/** Strip JSONC comments (single-line and block) so the result is valid JSON. */
function stripJsoncComments(text: string): string {
  // Remove block comments first, then line comments
  return text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n\r]*/g, "");
}

/** Load and parse the overrides.jsonc file. Returns empty config on any error. */
export async function loadOverrides(app: App): Promise<OverrideConfig> {
  try {
    const text = await app.vault.adapter.read(overridePath(app));
    return JSON.parse(stripJsoncComments(text)) as OverrideConfig;
  } catch {
    return {};
  }
}

/** Read the raw text of overrides.jsonc, returning the default template if absent. */
export async function readOverridesText(app: App): Promise<string> {
  try {
    return await app.vault.adapter.read(overridePath(app));
  } catch {
    return DEFAULT_OVERRIDE_TEMPLATE;
  }
}

/** Write raw text to overrides.jsonc and return the parsed config (or empty on parse error). */
export async function saveOverridesText(app: App, text: string): Promise<OverrideConfig> {
  await app.vault.adapter.write(overridePath(app), text);
  try {
    return JSON.parse(stripJsoncComments(text)) as OverrideConfig;
  } catch {
    return {};
  }
}

/** Deep-merge a partial override into base settings. */
function mergeSettings(base: HeaderColoringSettings, override: PartialHeaderSettings): HeaderColoringSettings {
  // Spread top-level fields, exclude userDefined (handled separately below)
  const { userDefined: _ud, ...overrideRest } = override;
  const merged: HeaderColoringSettings = { ...base, ...overrideRest };
  if (override.userDefined) {
    merged.userDefined = Object.fromEntries(
      (["h1", "h2", "h3", "h4", "h5", "h6"] as const).map((k) => [k, { ...base.userDefined[k], ...(override.userDefined?.[k] ?? {}) }])
    ) as HeaderColoringSettings["userDefined"];
  }
  return merged;
}

/**
 * Compute the effective settings for a given file path.
 *
 * Merge order (most specific wins):
 *   DEFAULT_SETTINGS ← UI settings ← vault override ← folder overrides (general→specific) ← file override
 */
export function resolveEffectiveSettings(filePath: string | null, baseSettings: HeaderColoringSettings, overrides: OverrideConfig): HeaderColoringSettings {
  let effective: HeaderColoringSettings = { ...baseSettings, userDefined: { ...baseSettings.userDefined } };

  // 1. Vault-wide override
  if (overrides.vault && Object.keys(overrides.vault).length > 0) {
    effective = mergeSettings(effective, overrides.vault);
  }

  if (filePath && overrides.folders && Object.keys(overrides.folders).length > 0) {
    // 2. Folder overrides — apply from root down to the most specific matching folder
    const lastSlash = filePath.lastIndexOf("/");
    const folderPath = lastSlash >= 0 ? filePath.substring(0, lastSlash) : "";

    // Build ancestor chain: ["", "Work", "Work/Projects"] for "Work/Projects/file.md"
    const ancestors: string[] = [""];
    if (folderPath) {
      const parts = folderPath.split("/");
      let current = "";
      for (const part of parts) {
        current = current ? `${current}/${part}` : part;
        ancestors.push(current);
      }
    }

    for (const ancestor of ancestors) {
      const folderOverride = overrides.folders[ancestor];
      if (folderOverride) {
        effective = mergeSettings(effective, folderOverride);
      }
    }
  }

  // 3. File override
  if (filePath && overrides.files?.[filePath]) {
    effective = mergeSettings(effective, overrides.files[filePath]);
  }

  return effective;
}

/** Initialise the overrides.jsonc file with the default template if it doesn't exist. */
export async function ensureOverridesFile(app: App): Promise<void> {
  try {
    await app.vault.adapter.read(overridePath(app));
  } catch {
    await app.vault.adapter.write(overridePath(app), DEFAULT_OVERRIDE_TEMPLATE);
  }
}

/** Return the DEFAULT_SETTINGS object (re-exported for use in override docs). */
export { DEFAULT_SETTINGS };
