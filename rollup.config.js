import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

const build = process.env.BUILD || "development";
const isDev = build === "development";

const options = {
  /**
   * Change the file name of the output file here.
   */
  filename: "analytics.js",

  /**
   * Determines in what build mode the plugin should be build. The default here takes
   * from the environment (ex. CLI arguments) with "development" as fallback.
   */
  build: process.env.BUILD || "development",
};
/**
 * @type {import("rollup").RollupOptions}
 */
const config = [
  {
    // Regular ESNext build
    input: "./src/index.ts",
    output: [
      {
        dir: "./dist/esm",
        format: "esm",
        exports: "named",
        entryFileNames: "[name].mjs",
        preserveModules: true,
      },
      {
        file: "./dist/index.min.js",
        format: "cjs",
      },
    ],
    plugins: [
      typescript(),
      terser({
        compress: {
          passes: 5,
          unsafe: true,
        },
        format: {
          comments: false,
          quote_style: 1,
          wrap_iife: false,
          preamble:
            "// Get the latest version: https://github.com/Basssiiie/OpenRCT2-FlexUI",
        },
      }),
    ],
  },
  {
    // Declaration file packaging
    input: "./src/index.ts",
    output: {
      file: "./dist/index.d.ts",
      format: "esm",
    },
    plugins: [
      dts({
        tsconfig: "./tsconfig.json",
        compilerOptions: {
          declaration: true,
          declarationDir: "./@types",
          emitDeclarationOnly: true,
          target: "ESNext",
        },
        exclude: ["./src/**/*.d.ts", "./tests/**/*"],
      }),
    ],
  },
];
export default config;
