// tsup.config.ts
import { defineConfig } from "tsup-preset-solid";

export default defineConfig(
  // entries (array or single object)
  [
    // first entry in array should be the main one (index)
    {
      // entries with '.tsx' extension will have `solid` export condition generated
      entry: "src/index.ts",
      // Setting `true` will generate a development-only entry
      devEntry: false,
      // Setting `true` will generate a server-only entry
      serverEntry: false,
    },
  ],
  // additional options
  {
    // Setting `true` will console.log the package.json fields
    printInstructions: true,
    // Setting `true` will write export fields to package.json
    writePackageJson: true,
    // Setting `true` will remove all `console.*` calls and `debugger` statements
    dropConsole: false,
    // Setting `true` will generate a CommonJS build alongside ESM (default: `false`)
    cjs: true,
  }
);
