import { defineConfig } from "rollup"
import typescript from "@rollup/plugin-typescript"
import terser from "@rollup/plugin-terser"

const config = defineConfig({
  external: ["@9/form-core", "svelte/store"],
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
    terser(),
  ],
})

export default config
