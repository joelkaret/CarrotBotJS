import { defineConfig } from "tsup";

export default defineConfig({
	external: ["undici"],
	entry: ["src/bot.ts"],
	format: ["esm"],
	clean: true,
	sourcemap: true,
	dts: false,
	minify: false,
	target: "es2022",
	splitting: false,
	treeshake: false,
});
