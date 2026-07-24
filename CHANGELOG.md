## [1.2.2](https://github.com/AlbertoOS/obsidian-rainbow-header-coloring-plugin/compare/1.2.0...1.2.2) (2026-07-24)

### Bug Fixes

* default to patch bump when no releasable commits found ([5bcab1b](https://github.com/AlbertoOS/obsidian-rainbow-header-coloring-plugin/commit/5bcab1b3fa47453e5476f814d26b86de18dfb145))
* release workflow attestation permission and action version ([#17](https://github.com/AlbertoOS/obsidian-rainbow-header-coloring-plugin/issues/17)) ([f9d08da](https://github.com/AlbertoOS/obsidian-rainbow-header-coloring-plugin/commit/f9d08dab7458e81e4d09e683ac7948bcf521caed))
* use local node_modules for conventional-changelog in release script ([7b31cc0](https://github.com/AlbertoOS/obsidian-rainbow-header-coloring-plugin/commit/7b31cc00d6d92db9f53ea3a86c3e17cd26d58c38))
## [1.2.0](https://github.com/AlbertoOS/obsidian-rainbow-header-coloring-plugin/compare/1.0.0...1.2.0) (2026-07-24)

### Features

* full plugin implementation with cycling, override config, and declarative settings ([8bc4054](https://github.com/AlbertoOS/obsidian-rainbow-header-coloring-plugin/commit/8bc405447de0471e22bff686df73454acc4ab5b5))

### Bug Fixes

* automated review issues — activeDocument, getSettingDefinitions, minAppVersion 1.13.0 ([4f40d72](https://github.com/AlbertoOS/obsidian-rainbow-header-coloring-plugin/commit/4f40d72e478cca5211c379e16e812fc39c0182d3))
* remove unused var via loop, drop dead display() method ([eb9929b](https://github.com/AlbertoOS/obsidian-rainbow-header-coloring-plugin/commit/eb9929b1b2848c084bb3eba3b2195667091a1406))
* suppress unused-vars warning for intentional destructure omit ([d22c66c](https://github.com/AlbertoOS/obsidian-rainbow-header-coloring-plugin/commit/d22c66c1c6846e9177f7cc22009bfec05cd95700))
* use createEl helper, replace display() with update() for 1.13 compat ([7af9348](https://github.com/AlbertoOS/obsidian-rainbow-header-coloring-plugin/commit/7af93481797b20d9d6a1091105082832af98ada7))
## [1.1.0](https://github.com/AlbertoOS/obsidian-rainbow-header-coloring-plugin/compare/1.0.0...1.1.0) (2026-07-23)

### Features

* full plugin implementation with cycling, override config, and declarative settings ([8bc4054](https://github.com/AlbertoOS/obsidian-rainbow-header-coloring-plugin/commit/8bc405447de0471e22bff686df73454acc4ab5b5))

### Bug Fixes

* automated review issues — activeDocument, getSettingDefinitions, minAppVersion 1.13.0 ([4f40d72](https://github.com/AlbertoOS/obsidian-rainbow-header-coloring-plugin/commit/4f40d72e478cca5211c379e16e812fc39c0182d3))
* suppress unused-vars warning for intentional destructure omit ([d22c66c](https://github.com/AlbertoOS/obsidian-rainbow-header-coloring-plugin/commit/d22c66c1c6846e9177f7cc22009bfec05cd95700))
* use createEl helper, replace display() with update() for 1.13 compat ([7af9348](https://github.com/AlbertoOS/obsidian-rainbow-header-coloring-plugin/commit/7af93481797b20d9d6a1091105082832af98ada7))
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
