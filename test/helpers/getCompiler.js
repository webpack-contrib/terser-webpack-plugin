import path from "path";

import { Volume, createFsFromVolume } from "memfs";
import webpack from "webpack";

/**
 * @param {import("webpack").Configuration | import("webpack").Configuration[]} options options
 * @returns {import("webpack").Compiler | import("webpack").MultiCompiler} compiler
 */
export default function getCompiler(options = {}) {
  const compiler = webpack(
    Array.isArray(options)
      ? options
      : {
          mode: "production",
          bail: true,
          entry: path.resolve(__dirname, "../fixtures/entry.js"),
          optimization: {
            minimize: false,
          },
          output: {
            pathinfo: false,
            path: path.resolve(__dirname, "dist"),
            filename: "[name].js",
            chunkFilename: "[id].[name].js",
          },
          plugins: [],
          ...options,
        },
  );

  compiler.outputFileSystem = createFsFromVolume(new Volume());

  return compiler;
}
