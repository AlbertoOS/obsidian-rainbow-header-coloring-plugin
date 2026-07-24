import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig(
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.js", "eslint.config.mts", "manifest.json"],
        },
        tsconfigRootDir: import.meta.dirname as string,
        extraFileExtensions: [".json"],
      },
    },
  },
  ...obsidianmd.configs.recommended,
  globalIgnores(["node_modules", "dist", "esbuild.config.mjs", "eslint.config.js", "version-bump.mjs", "scripts/", "versions.json", "package.json", "main.js", "test-plugin-vault"])
);
