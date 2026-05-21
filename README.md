# Obsidian Rainbow Header Coloring Plugin

Color your markdown headers (H1–H6) in Obsidian with customizable colors — in both the editor and reading view.

> **Status:** Work in progress — see [TODO.md](TODO.md) for the development roadmap.

---

## Features

- **Colormap mode** — automatically assigns a distinct color to each heading level (H1–H6) cycling through a built-in palette (HSV, cool, warm, greyscale, and more)
- **User-defined mode** — set an explicit font color and background color for each heading level independently
- **Both views** — colors apply in Live Preview, Source mode, and Reading view
- **Lightweight** — no external runtime dependencies; color generation is built in

---

## Installation

### Community plugin directory

> Not yet published. Coming soon.

### Manual install (development / testing)

1. Build the plugin:
   ```sh
   npm install
   npm run build
   ```
2. Copy `main.js`, `manifest.json`, and `styles.css` to your vault:
   ```
   <Vault>/.obsidian/plugins/rainbow-header-coloring/
   ```
3. Reload Obsidian and enable the plugin in **Settings → Community plugins**.

---

## Settings

| Setting | Default | Description |
|---|---|---|
| Mode | `colormap` | `colormap` cycles colors automatically; `userDefined` gives per-level control |
| Colormap | `hsv` | Color palette used in colormap mode (`hsv`, `cool`, `warm`, `greyscale`) |
| Shades | `20` | Number of color steps in the colormap (10–40) |
| Font opacity | `1.0` | Opacity of the generated header text color |
| Background opacity | `0.1` | Opacity of the generated header background color |
| Enable in editor | `true` | Apply coloring in Live Preview and Source mode |
| Enable in reading view | `true` | Apply coloring in Reading view |
| H1–H6 colors | (empty) | Per-level font and background colors (user-defined mode only) |

---

## Development

```sh
# Install dependencies
npm install

# Dev build with watch
npm run dev

# Production build
npm run build

# Lint
npm run lint
```

See [TODO.md](TODO.md) for the full development roadmap.

---

## Credits

- Scaffolded from the [obsidian-sample-plugin](https://github.com/obsidianmd/obsidian-sample-plugin) template by Obsidian
- Inspired by [vscode-markdown-header-coloring](https://github.com/satokaz/vscode-markdown-header-coloring) by [satokaz](https://github.com/satokaz)

---

## License

[GPL-3.0-only](LICENSE)
