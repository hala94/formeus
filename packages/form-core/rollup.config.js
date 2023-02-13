import { defineConfig } from "rollup"
import typescript from "@rollup/plugin-typescript"
import terser from "@rollup/plugin-terser"

/// using file: instead of dir: causes rollup to bundle the files.
/// config can be array of configs, disable watch rebuild of all bundles

const config = defineConfig({
  external: [],
  input: ["src/index.ts"],
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
