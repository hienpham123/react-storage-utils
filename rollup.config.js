import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import postcss from "rollup-plugin-postcss";
import dts from "rollup-plugin-dts";
import { terser } from "rollup-plugin-terser";
import packageJson from "./package.json";

export default [
  {
    input: "src/index.ts",
    output: [
      { file: packageJson.main, format: "cjs", sourcemap: true },
      { file: packageJson.module, format: "esm", sourcemap: true },
    ],
    // 👇 Fix lỗi "this is undefined" của Fluent UI
    context: "window",

    // 👇 Giúp bỏ qua React và deps khỏi bundle
    external: [
      "react",
      "react-dom",
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.peerDependencies || {}),
    ],

    plugins: [
      resolve({
        extensions: [".ts", ".tsx", ".js"],
        browser: true,
        preferBuiltins: false, // tránh xung đột với code browser
      }),

      // 👇 Fix lỗi "this is undefined" của @microsoft/load-themed-styles
      commonjs({
        transformMixedEsModules: true,
      }),

      typescript({ tsconfig: "./tsconfig.json" }),
      json(),
      postcss(),
      terser(),
    ],

    // 👇 Ẩn warning "this is undefined" cho sạch console
    onwarn(warning, warn) {
      if (warning.code === "THIS_IS_UNDEFINED") return;
      warn(warning);
    },
  },

  // Build type declarations
  {
    input: "src/index.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts()],
    external: [/\.css$/, /\.less$/, /\.scss$/],
  },
];
