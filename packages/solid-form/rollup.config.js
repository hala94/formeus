import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";

const config = defineConfig({
  external: ["@9/form-core", "solid-js", "solid-js/store"],
  input: "src/index.ts",
  output: [
    {
      file: "dist/lib/index.mjs",
      format: "es",
    },
    {
      file: "dist/lib/index.js",
      format: "cjs",
    },
  ],
  plugins: [
    typescript({
      declaration: true,
      outDir: "dist",
      sourceMap: false, //  Enable during dev only ? Enabling it ships the source.
    }),
  ],
});

export default config;
