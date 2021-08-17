import path from "path";

import TerserPlugin from "../src";

import {
  BrokenCodePlugin,
  compile,
  getCompiler,
  getErrors,
  getWarnings,
  readsAssets,
} from "./helpers";

describe("minify option", () => {
  it("should work", async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "./fixtures/minify/es6.js"),
      output: {
        path: path.resolve(__dirname, "./dist-terser"),
        filename: "[name].js",
        chunkFilename: "[id].[name].js",
      },
    });

    new TerserPlugin({
      terserOptions: {
        keep_fnames: true,
        mangle: {
          reserved: ["baz"],
        },
      },
      minify(file, inputSourceMap, minimizerOptions) {
        // eslint-disable-next-line global-require
        return require("terser").minify(file, minimizerOptions);
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it('should work when the "parallel" option is "true"', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "./fixtures/minify/es6.js"),
      output: {
        path: path.resolve(__dirname, "./dist-terser"),
        filename: "[name].js",
        chunkFilename: "[id].[name].js",
      },
    });

    new TerserPlugin({
      parallel: true,
      minify(file, inputSourceMap, minimizerOptions) {
        // eslint-disable-next-line global-require
        return require("terser").minify(file, minimizerOptions);
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it('should work when the "parallel" option is "false"', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "./fixtures/minify/es6.js"),
      output: {
        path: path.resolve(__dirname, "./dist-terser"),
        filename: "[name].js",
        chunkFilename: "[id].[name].js",
      },
    });

    new TerserPlugin({
      parallel: false,
      minify(file, inputSourceMap, minimizerOptions) {
        // eslint-disable-next-line global-require
        return require("terser").minify(file, minimizerOptions);
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should throw an error when an error", async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "./fixtures/minify/es6.js"),
      output: {
        path: path.resolve(__dirname, "./dist-terser"),
        filename: "[name].js",
        chunkFilename: "[id].[name].js",
      },
    });

    new TerserPlugin({
      minify() {
        throw Error("Error");
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it('should throw an error when an error when the "parallel" option is "true"', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "./fixtures/minify/es6.js"),
      output: {
        path: path.resolve(__dirname, "./dist-terser"),
        filename: "[name].js",
        chunkFilename: "[id].[name].js",
      },
    });

    new TerserPlugin({
      parallel: true,
      minify: () => {
        throw Error("Error");
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it('should throw an error when an error when the "parallel" option is "false"', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "./fixtures/minify/es6.js"),
      output: {
        path: path.resolve(__dirname, "./dist-terser"),
        filename: "[name].js",
        chunkFilename: "[id].[name].js",
      },
    });

    new TerserPlugin({
      parallel: false,
      minify: () => {
        throw Error("Error");
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should snapshot with extracting comments", async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "./fixtures/minify/es5.js"),
      output: {
        path: path.resolve(__dirname, "./dist-uglify-js"),
        filename: "[name].js",
        chunkFilename: "[id].[name].js",
      },
    });

    new TerserPlugin({
      extractComments: true,
      async minify(file) {
        // eslint-disable-next-line global-require
        const result = await require("terser").minify(file, {
          mangle: {
            reserved: ["baz"],
          },
        });

        return { ...result, extractedComments: ["/* Foo */"] };
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work with source maps", async () => {
    const compiler = getCompiler({
      devtool: "source-map",
      entry: path.resolve(__dirname, "./fixtures/minify/es6.js"),
      output: {
        path: path.resolve(__dirname, "./dist-terser"),
        filename: "[name].js",
        chunkFilename: "[id].[name].js",
      },
    });

    new TerserPlugin({
      minify(file, sourceMap) {
        const terserOption = {
          mangle: {
            reserved: ["baz"],
          },
        };

        if (sourceMap) {
          terserOption.sourceMap = {
            content: sourceMap,
          };
        }

        // eslint-disable-next-line global-require
        return require("terser").minify(file, terserOption);
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it('should work with "uglify-js" minimizer', async () => {
    const compiler = getCompiler({
      target: ["es5", "web"],
      entry: path.resolve(__dirname, "./fixtures/minify/es5.js"),
      output: {
        path: path.resolve(__dirname, "./dist-uglify-js"),
        filename: "[name].js",
        chunkFilename: "[id].[name].js",
      },
    });

    new TerserPlugin({
      minify(file) {
        // eslint-disable-next-line global-require
        return require("uglify-js").minify(file, {
          mangle: {
            reserved: ["baz"],
          },
        });
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it('should work with "terser" minimizer', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "./fixtures/minify/es6.js"),
      output: {
        path: path.resolve(__dirname, "./dist-terser"),
        filename: "[name].js",
        chunkFilename: "[id].[name].js",
      },
    });

    new TerserPlugin({
      minify(file) {
        // eslint-disable-next-line global-require
        return require("terser").minify(file, {
          mangle: {
            reserved: ["baz"],
          },
        });
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work with custom minimize function and support warnings and errors", async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "./fixtures/minify/es6.js"),
      output: {
        path: path.resolve(__dirname, "./dist-terser"),
        filename: "[name].js",
        chunkFilename: "[id].[name].js",
      },
    });

    new TerserPlugin({
      minify(file) {
        const isOldNodeJs = process.version.match(/^v(\d+)/)[1] === "10";
        const [[, code]] = Object.entries(file);

        return {
          code,
          warnings: [
            isOldNodeJs
              ? new Error("Warning 1").toString()
              : new Error("Warning 1"),
            "Warnings 2",
          ],
          errors: [
            isOldNodeJs ? "Error 1 [main.js]" : new Error("Error 1"),
            "Error 2",
            { message: "Error 3" },
            { message: "Error 4", filename: "foo.js" },
            { message: "Error 5", filename: "foo.js", line: 0, col: 0 },
            { message: "Error 6", filename: "foo.js", line: 1, col: 1 },
          ],
        };
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work using when the `minify` option is `terserMinify`", async () => {
    const compiler = getCompiler();

    new TerserPlugin({
      minify: TerserPlugin.terserMinify,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work using when the `minify` option is `terserMinify` and generate source maps", async () => {
    const compiler = getCompiler({ devtool: "source-map" });

    new TerserPlugin({
      minify: TerserPlugin.terserMinify,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work using when the `minify` option is `terserMinify` and allows to set `terser` options", async () => {
    const compiler = getCompiler();

    new TerserPlugin({
      minify: TerserPlugin.terserMinify,
      terserOptions: {
        mangle: false,
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work using when the `minify` option is `terserMinify` and ECMA modules output", async () => {
    const compiler = getCompiler({
      experiments: {
        outputModule: true,
      },
    });

    new TerserPlugin({
      minify: TerserPlugin.terserMinify,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work using when the `minify` option is `uglifyJsMinify`", async () => {
    const compiler = getCompiler({
      target: ["web", "es5"],
    });

    new TerserPlugin({
      minify: TerserPlugin.uglifyJsMinify,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work using when the `minify` option is `uglifyJsMinify` and generate source maps", async () => {
    const compiler = getCompiler({
      devtool: "source-map",
      target: ["web", "es5"],
    });

    new TerserPlugin({
      minify: TerserPlugin.uglifyJsMinify,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work using when the `minify` option is `uglifyJsMinify` and allows to set `uglify-js` options", async () => {
    const compiler = getCompiler({
      target: ["web", "es5"],
    });

    new TerserPlugin({
      minify: TerserPlugin.uglifyJsMinify,
      terserOptions: {
        mangle: false,
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work using when the `minify` option is `uglifyJsMinify` and output warnings", async () => {
    const compiler = getCompiler({
      target: ["web", "es6"],
    });

    new TerserPlugin({
      minify: TerserPlugin.uglifyJsMinify,
      terserOptions: {
        warnings: true,
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work using when the `minify` option is `uglifyJsMinify` and output errors", async () => {
    const compiler = getCompiler({
      target: ["web", "es5"],
      bail: false,
    });

    new BrokenCodePlugin().apply(compiler);

    new TerserPlugin({
      minify: TerserPlugin.uglifyJsMinify,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work using when the `minify` option is `uglifyJsMinify` and extract comments", async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "./fixtures/comments.js"),
      devtool: "source-map",
      target: ["web", "es5"],
    });

    new TerserPlugin({
      minify: TerserPlugin.uglifyJsMinify,
      extractComments: true,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work using when the `minify` option is `uglifyJsMinify` and do not extract comments", async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "./fixtures/comments.js"),
      devtool: "source-map",
      target: ["web", "es5"],
    });

    new TerserPlugin({
      minify: TerserPlugin.uglifyJsMinify,
      extractComments: false,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work using when the `minify` option is `swcMinify`", async () => {
    const compiler = getCompiler();

    new TerserPlugin({
      minify: TerserPlugin.swcMinify,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work using when the `minify` option is `swcMinify` and generate source maps", async () => {
    const compiler = getCompiler({ devtool: "source-map" });

    new TerserPlugin({
      minify: TerserPlugin.swcMinify,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work using when the `minify` option is `swcMinify` and allows to set `swc` options", async () => {
    const compiler = getCompiler();

    new TerserPlugin({
      minify: TerserPlugin.swcMinify,
      terserOptions: {
        mangle: false,
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work using when the `minify` option is `swcMinify` and ECMA modules output", async () => {
    const compiler = getCompiler({
      experiments: {
        outputModule: true,
      },
    });

    new TerserPlugin({
      minify: TerserPlugin.swcMinify,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });
});
