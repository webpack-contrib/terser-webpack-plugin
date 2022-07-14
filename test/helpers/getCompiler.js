const path = require("path");

const webpack = require("webpack");
const { createFsFromVolume, Volume } = require("memfs");

module.exports = function getCompiler(options = {}) {
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
        }
  );

  compiler.outputFileSystem = createFsFromVolume(new Volume());

  return compiler;
};
