# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-01

### Features

- Color markdown headers H1–H6 with customizable palettes
- Colormap mode: HSV (rainbow), cool, warm, and greyscale palettes
- Color cycling: sequential headings each get a distinct shade from the palette
- User-defined mode: explicit font color, background color, bold, and italic per heading level
- Editor (Live Preview + Source) and Reading view support, each independently toggleable
- Setext-style heading support (underlined with `===` or `---`)
- Override config: per-vault, per-folder, and per-file settings via a JSONC file
- Settings search support (Obsidian 1.13+ declarative API)

### Fixes

- Softer palette: saturation reduced to 0.75 for a less harsh appearance
- Use `activeDocument` instead of `document` for multi-window Obsidian support

[1.0.0]: https://github.com/AlbertoOS/obsidian-rainbow-header-coloring-plugin/releases/tag/1.0.0
