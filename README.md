# Obsidian Rainbow Header Coloring Plugin

Color your markdown headers (H1–H6) in Obsidian with customizable colors — in both the editor and reading view.

---

## Features

- **Colormap mode** — automatically assigns a distinct color to each heading level (H1–H6) from a built-in palette (HSV rainbow, cool, warm, greyscale)
- **User-defined mode** — set an explicit font color and background color for each heading level independently, with optional bold and italic
- **Both views** — colors apply in Live Preview, Source mode, and Reading view
- **Lightweight** — no external runtime dependencies; color generation is built in (~50 lines of math)

---

## Installation

### Community plugin directory

1. Open Obsidian and go to **Settings → Community plugins**.
2. Select **Browse** and search for **Rainbow Header Coloring**.
3. Select **Install**, then **Enable**.

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

### Colormap mode

| Setting | Default | Description |
|---|---|---|
| Mode | `colormap` | `colormap` cycles colors automatically; `userDefined` gives per-level control |
| Colormap | `hsv` | Color palette (`hsv`, `cool`, `warm`, `greyscale`) |
| Shades | `20` | Number of color steps in the palette (10–40) |
| Font opacity | `1.0` | Opacity of the generated header text color (0.0–1.0) |
| Background opacity | `0.1` | Opacity of the generated header background color (0.0–1.0) |
| Enable in editor | `true` | Apply coloring in Live Preview and Source mode |
| Enable in reading view | `true` | Apply coloring in Reading view |

### User-defined mode

Per heading level (H1–H6):

| Setting | Default | Description |
|---|---|---|
| Font color | One Dark Pro palette | CSS color for the heading text |
| Background color | One Dark Pro palette | CSS color for the heading background |
| Enable background | `true` | Toggle background color on/off per level |
| Bold | `false` | Make the heading bold |
| Italic | `false` | Make the heading italic |

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

# Build and install into the test vault
npm run install-test
```

### Test vault

A `test-plugin-vault/` directory is included in the repo with 9 markdown files covering all edge cases (code blocks, YAML frontmatter, blockquotes, callouts, inline formatting, etc.). After running `npm run install-test`, open that folder as an Obsidian vault to do manual QA.

See [CHANGELOG](https://github.com/AlbertoOS/obsidian-rainbow-header-coloring-plugin/releases) for release history.

---

## Credits

- Scaffolded from the [obsidian-sample-plugin](https://github.com/obsidianmd/obsidian-sample-plugin) template by Obsidian
- Inspired by [vscode-markdown-header-coloring](https://github.com/satokaz/vscode-markdown-header-coloring) by [satokaz](https://github.com/satokaz)

---

## License

[MIT](LICENSE)
