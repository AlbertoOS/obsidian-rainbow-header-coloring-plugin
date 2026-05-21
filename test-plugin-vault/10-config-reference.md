# Config reference — all available settings with defaults

This file demonstrates all available override keys. Copy any block into
`overrides.jsonc` (Settings → Config overrides, or edit the file directly).

---

## Full defaults reference

```jsonc
{
  "vault": {
    // Coloring mode: "colormap" cycles a palette; "userDefined" gives per-level control
    "mode": "colormap",

    // Which palette to use (colormap mode only)
    // Options: "hsv" | "cool" | "warm" | "greyscale"
    "colormapName": "hsv",

    // Number of color steps in the palette (10–40)
    "nshades": 20,

    // Opacity of header text color (0 = transparent, 1 = solid)
    "fontColorOpacity": 1.0,

    // Opacity of header background color (0 = transparent, 1 = solid)
    "backgroundColorOpacity": 0.1,

    // Cycle colors across headings sequentially (colormap mode only)
    // true = each heading gets the next color regardless of level (matches VSCode extension)
    // false = H1–H6 are spread evenly across the palette
    "cycleColors": true,

    // Apply coloring in the editor (live preview and source mode)
    "enableEditorMode": true,

    // Apply coloring in reading view
    "enableReadingMode": true,

    // Per-level colors used when mode = "userDefined"
    "userDefined": {
      "h1": { "color": "#e06c75", "backgroundColor": "#e06c75", "enableBackground": false, "bold": false, "italic": false },
      "h2": { "color": "#e5c07b", "backgroundColor": "#e5c07b", "enableBackground": false, "bold": false, "italic": false },
      "h3": { "color": "#98c379", "backgroundColor": "#98c379", "enableBackground": false, "bold": false, "italic": false },
      "h4": { "color": "#56b6c2", "backgroundColor": "#56b6c2", "enableBackground": false, "bold": false, "italic": false },
      "h5": { "color": "#61afef", "backgroundColor": "#61afef", "enableBackground": false, "bold": false, "italic": false },
      "h6": { "color": "#c678dd", "backgroundColor": "#c678dd", "enableBackground": false, "bold": false, "italic": false }
    }
  },
  "folders": {},
  "files": {}
}
```

---

## Usage examples

### Disable background in a specific folder

```jsonc
{
  "vault": {},
  "folders": {
    "Work": { "backgroundColorOpacity": 0 }
  },
  "files": {}
}
```

### Use warm palette for daily notes

```jsonc
{
  "vault": {},
  "folders": {
    "Daily Notes": { "colormapName": "warm", "nshades": 10 }
  },
  "files": {}
}
```

### Greyscale for a single file

```jsonc
{
  "vault": {},
  "folders": {},
  "files": {
    "Archive/old-project.md": { "colormapName": "greyscale" }
  }
}
```

### User-defined mode for the vault, colormap for a specific folder

```jsonc
{
  "vault": { "mode": "userDefined" },
  "folders": {
    "Creative": { "mode": "colormap", "colormapName": "cool", "cycleColors": true }
  },
  "files": {}
}
```

### Disable coloring entirely for one file

```jsonc
{
  "vault": {},
  "folders": {},
  "files": {
    "Templates/plain.md": { "enableEditorMode": false, "enableReadingMode": false }
  }
}
```

---

## Override resolution order

Priority (highest wins): **file** > **folder (most specific)** > **folder (parent)** > **vault** > **plugin UI settings**

Overrides are *merged*, not replaced — only the keys you specify are changed.
