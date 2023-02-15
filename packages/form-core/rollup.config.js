import { defineConfig } from "rollup"
import typescript from "@rollup/plugin-typescript"
import terser from "@rollup/plugin-terser"

const config = defineConfig({
  external: [],
  input: ["src/index.ts"],
  output: [
    {
      file: "lib/index.mjs",
      format: "es",
    },
    {
      file: "lib/index.js",
      format: "cjs",
    },
  ],
  plugins: [
    typescript({
      declaration: true,
      outDir: "dist",
      sourceMap: false, //  Enable during dev only
    }),
    terser(),
  ],
})

export default config
