import crypto from "crypto";

import path from "path";

import { SourceMapConsumer } from "source-map";
import CopyWebpackPlugin from "copy-webpack-plugin";
import RequestShortener from "webpack/lib/RequestShortener";
import { javascript, SourceMapDevToolPlugin } from "webpack";

import TerserPlugin from "../src/index";

import {
  BrokenCodePlugin,
  ModifyExistingAsset,
  compile,
  countPlugins,
  EmitNewAsset,
  getCompiler,
  getErrors,
  getWarnings,
  readAsset,
  readsAssets,
} from "./helpers";

jest.setTimeout(10000);

expect.addSnapshotSerializer({
  test: (value) => {
    // For string that are valid JSON
    if (typeof value !== "string") {
      return false;
    }

    try {
      return typeof JSON.parse(value) === "object";
    } catch (e) {
      return false;
    }
  },
  print: (value) => JSON.stringify(JSON.parse(value), null, 2),
});

describe("TerserPlugin", () => {
  const rawSourceMap = {
    version: 3,
    file: "test.js",
    names: ["bar", "baz", "n"],
    sources: ["one.js", "two.js"],
    sourceRoot: "http://example.com/www/js/",
    mappings:
      "CAAC,IAAI,IAAM,SAAUA,GAClB,OAAOC,IAAID;CCDb,IAAI,IAAM,SAAUE,GAClB,OAAOA",
  };
  const emptyRawSourceMap = {
    version: 3,
    sources: [],
    mappings: "",
  };

  it("should work (without options)", async () => {
    const compiler = getCompiler();

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work in multi compiler mode", async () => {
    const multiCompiler = getCompiler([
      {
        mode: "production",
        bail: true,
        cache: { type: "memory" },
        entry: path.resolve(__dirname, "./fixtures/entry.js"),
        output: {
          path: path.resolve(__dirname, "./dist"),
          filename: "[name]-1.js",
          chunkFilename: "[id]-1.[name].js",
        },
        optimization: {
          minimize: false,
        },
      },
      {
        mode: "production",
        bail: true,
        cache: { type: "memory" },
        entry: path.resolve(__dirname, "./fixtures/entry.js"),
        output: {
          path: path.resolve(__dirname, "./dist"),
          filename: "[name]-2.js",
          chunkFilename: "[id]-2.[name].js",
        },
        optimization: {
          minimize: false,
        },
        plugins: [new TerserPlugin()],
      },
      {
        mode: "production",
        bail: true,
        cache: { type: "memory" },
        entry: path.resolve(__dirname, "./fixtures/import-export/entry.js"),
        output: {
          path: path.resolve(__dirname, "./dist-MultiCompiler"),
          filename: "[name]-3.js",
          chunkFilename: "[id]-3.[name].js",
        },
        optimization: {
          minimize: false,
        },
        plugins: [new TerserPlugin()],
      },
    ]);

    const emptyPluginCount = countPlugins(multiCompiler.compilers[0]);
    const expectedPluginCount = countPlugins(multiCompiler.compilers[1]);

    expect(emptyPluginCount).not.toEqual(expectedPluginCount);

    multiCompiler.compilers.slice(2).forEach((compiler) => {
      const pluginCount = countPlugins(compiler);

      expect(pluginCount).not.toEqual(emptyPluginCount);
      expect(pluginCount).toEqual(expectedPluginCount);
      expect(pluginCount).toMatchSnapshot("compiler plugin count");
    });

    const multiStats = await compile(multiCompiler);

    multiStats.stats.forEach((stats, index) => {
      expect(
        readsAssets(multiCompiler.compilers[index], stats)
      ).toMatchSnapshot("assets");
      expect(getErrors(stats)).toMatchSnapshot("errors");
      expect(getWarnings(stats)).toMatchSnapshot("warnings");
    });
  });

  it("should work when some of assets do not contain source maps", async () => {
    const compiler = getCompiler({
      devtool: "source-map",
      module: {
        rules: [
          {
            test: /\.js$/i,
            loader: require.resolve("./fixtures/emit-loader.js"),
          },
        ],
      },
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work in multi compiler mode with the one plugin", async () => {
    const plugins = [new TerserPlugin()];
    const multiCompiler = getCompiler([
      {
        mode: "production",
        bail: true,
        cache: { type: "memory" },
        entry: path.resolve(__dirname, "./fixtures/entry.js"),
        output: {
          path: path.resolve(__dirname, "./dist"),
          filename: "[name]-1.js",
          chunkFilename: "[id]-1.[name].js",
        },
        optimization: {
          minimize: false,
        },
      },
      {
        mode: "production",
        bail: true,
        cache: { type: "memory" },
        entry: path.resolve(__dirname, "./fixtures/entry.js"),
        output: {
          path: path.resolve(__dirname, "./dist"),
          filename: "[name]-2.js",
          chunkFilename: "[id]-2.[name].js",
        },
        optimization: {
          minimize: false,
        },
        plugins,
      },
      {
        mode: "production",
        bail: true,
        cache: { type: "memory" },
        entry: path.resolve(__dirname, "./fixtures/import-export/entry.js"),
        output: {
          path: path.resolve(__dirname, "./dist-MultiCompiler"),
          filename: "[name]-3.js",
          chunkFilename: "[id]-3.[name].js",
        },
        optimization: {
          minimize: false,
        },
        plugins,
      },
    ]);

    const emptyPluginCount = countPlugins(multiCompiler.compilers[0]);
    const expectedPluginCount = countPlugins(multiCompiler.compilers[1]);

    expect(emptyPluginCount).not.toEqual(expectedPluginCount);

    multiCompiler.compilers.slice(2).forEach((compiler) => {
      const pluginCount = countPlugins(compiler);

      expect(pluginCount).not.toEqual(emptyPluginCount);
      expect(pluginCount).toEqual(expectedPluginCount);
      expect(pluginCount).toMatchSnapshot("compiler plugin count");
    });

    const multiStats = await compile(multiCompiler);

    multiStats.stats.forEach((stats, index) => {
      expect(
        readsAssets(multiCompiler.compilers[index], stats)
      ).toMatchSnapshot("assets");
      expect(getErrors(stats)).toMatchSnapshot("errors");
      expect(getWarnings(stats)).toMatchSnapshot("warnings");
    });
  });

  it("should work in multi compiler mode with the one plugin and with the same file", async () => {
    const plugins = [new TerserPlugin()];
    const multiCompiler = getCompiler([
      {
        mode: "production",
        bail: true,
        cache: { type: "memory" },
        entry: path.resolve(__dirname, "./fixtures/entry.js"),
        output: {
          path: path.resolve(__dirname, "./dist-0"),
          filename: "[name].js",
          chunkFilename: "[id].[name].js",
        },
        optimization: {
          minimize: false,
        },
        plugins,
      },
      {
        mode: "production",
        bail: true,
        cache: { type: "memory" },
        entry: path.resolve(__dirname, "./fixtures/entry.js"),
        output: {
          path: path.resolve(__dirname, "./dist-1"),
          filename: "[name].js",
          chunkFilename: "[id].[name].js",
        },
        optimization: {
          minimize: false,
        },
        plugins,
      },
      {
        mode: "production",
        bail: true,
        cache: { type: "memory" },
        entry: path.resolve(__dirname, "./fixtures/entry.js"),
        output: {
          path: path.resolve(__dirname, "./dist-2"),
          filename: "[name].js",
          chunkFilename: "[id].[name].js",
        },
        optimization: {
          minimize: false,
        },
        plugins,
      },
      {
        mode: "production",
        bail: true,
        cache: { type: "memory" },
        entry: path.resolve(__dirname, "./fixtures/entry.js"),
        output: {
          path: path.resolve(__dirname, "./dist-3"),
          filename: "[name].js",
          chunkFilename: "[id].[name].js",
        },
        optimization: {
          minimize: false,
        },
        plugins,
      },
      {
        mode: "production",
        bail: true,
        cache: { type: "memory" },
        entry: path.resolve(__dirname, "./fixtures/entry.js"),
        output: {
          path: path.resolve(__dirname, "./dist-4"),
          filename: "[name].js",
          chunkFilename: "[id].[name].js",
        },
        optimization: {
          minimize: false,
        },
        plugins,
      },
    ]);

    const multiStats = await compile(multiCompiler);

    multiStats.stats.forEach((stats, index) => {
      expect(
        readsAssets(multiCompiler.compilers[index], stats)
      ).toMatchSnapshot("assets");
      expect(getErrors(stats)).toMatchSnapshot("errors");
      expect(getWarnings(stats)).toMatchSnapshot("warnings");
    });
  });

  it("should work as a plugin", async () => {
    const compiler = getCompiler({
      plugins: [new TerserPlugin()],
    });

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work as a minimizer", async () => {
    const compiler = getCompiler({
      optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
      },
    });

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it('should work with "file-loader"', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "fixtures/file-loader.js"),
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it('should work with "asset" module type', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "fixtures/asset-resource.js"),
      experiments: {
        asset: true,
      },
      module: {
        rules: [
          {
            test: /emitted\.js$/i,
            type: "asset/resource",
            generator: {
              filename: "[name][ext]",
            },
          },
        ],
      },
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it('should work and respect "terser" errors (the "parallel" option is "true")', async () => {
    const compiler = getCompiler();

    new TerserPlugin({
      parallel: true,
      minify(input) {
        // eslint-disable-next-line global-require
        return require("terser").minify(`${input}1()2()3()`);
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(/node_modules(\/|\\)terser/.test(stats.compilation.errors[0])).toBe(
      true
    );
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it('should work and respect "terser" errors (the "parallel" option is "false")', async () => {
    const compiler = getCompiler();

    new TerserPlugin({
      parallel: false,
      minify(input) {
        // eslint-disable-next-line global-require
        return require("terser").minify(`${input}1()2()3()`);
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(/node_modules(\/|\\)terser/.test(stats.compilation.errors[0])).toBe(
      true
    );
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should regenerate hash", async () => {
    const mockUpdateHashForChunk = jest.fn();
    const compiler = getCompiler({
      entry: {
        js: path.resolve(__dirname, "./fixtures/entry.js"),
        mjs: path.resolve(__dirname, "./fixtures/entry.mjs"),
        importExport: path.resolve(
          __dirname,
          "./fixtures/import-export/entry.js"
        ),
        AsyncImportExport: path.resolve(
          __dirname,
          "./fixtures/async-import-export/entry.js"
        ),
      },
      output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "[name].[contenthash].js",
        chunkFilename: "[id].[name].[contenthash].js",
      },
    });

    compiler.hooks.thisCompilation.tap("TerserPlugin", (compilation) => {
      javascript.JavascriptModulesPlugin.getCompilationHooks(
        compilation
      ).chunkHash.tap("TerserPlugin", mockUpdateHashForChunk);
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");

    // On each chunk we have 2 calls (we have 1 async chunk and 4 initial).
    // First call do `webpack`.
    // Second call do `TerserPlugin`.

    // We have 1 async chunk (1 * 2 = 2 calls) and 4 initial chunks (4 * 2 = 8 calls)
    expect(mockUpdateHashForChunk).toHaveBeenCalledTimes(10);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
  });

  it("isSourceMap method", () => {
    expect(TerserPlugin.isSourceMap(null)).toBe(false);
    expect(TerserPlugin.isSourceMap()).toBe(false);
    expect(TerserPlugin.isSourceMap({})).toBe(false);
    expect(TerserPlugin.isSourceMap([])).toBe(false);
    expect(TerserPlugin.isSourceMap("foo")).toBe(false);
    expect(TerserPlugin.isSourceMap({ version: 3 })).toBe(false);
    expect(TerserPlugin.isSourceMap({ sources: "" })).toBe(false);
    expect(TerserPlugin.isSourceMap({ mappings: [] })).toBe(false);
    expect(TerserPlugin.isSourceMap({ version: 3, sources: "" })).toBe(false);
    expect(TerserPlugin.isSourceMap({ version: 3, mappings: [] })).toBe(false);
    expect(TerserPlugin.isSourceMap({ sources: "", mappings: [] })).toBe(false);
    expect(
      TerserPlugin.isSourceMap({ version: 3, sources: "", mappings: [] })
    ).toBe(false);
    expect(TerserPlugin.isSourceMap(rawSourceMap)).toBe(true);
    expect(TerserPlugin.isSourceMap(emptyRawSourceMap)).toBe(true);
  });

  it("buildError method", () => {
    const error = new Error("Message");

    error.stack = null;

    expect(TerserPlugin.buildError(error, "test.js")).toMatchSnapshot();

    const errorWithLineAndCol = new Error("Message");

    errorWithLineAndCol.stack = null;
    errorWithLineAndCol.line = 1;
    errorWithLineAndCol.col = 1;

    expect(
      TerserPlugin.buildError(
        errorWithLineAndCol,
        "test.js",
        // eslint-disable-next-line no-undefined
        undefined,
        new SourceMapConsumer(rawSourceMap)
      )
    ).toMatchSnapshot();

    const otherErrorWithLineAndCol = new Error("Message");

    otherErrorWithLineAndCol.stack = null;
    otherErrorWithLineAndCol.line = 1;
    otherErrorWithLineAndCol.col = 1;

    expect(
      TerserPlugin.buildError(
        otherErrorWithLineAndCol,
        "test.js",
        new RequestShortener("/example.com/www/js/"),
        new SourceMapConsumer(rawSourceMap)
      )
    ).toMatchSnapshot();

    const errorWithStack = new Error("Message");

    errorWithStack.stack = "Stack";

    expect(
      TerserPlugin.buildError(errorWithStack, "test.js")
    ).toMatchSnapshot();
  });

  it("should respect the hash options #1", async () => {
    const compiler = getCompiler({
      output: {
        pathinfo: false,
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js",
        chunkFilename: "[id].[name].js",
        hashDigest: "hex",
        hashDigestLength: 20,
        hashFunction: "sha256",
        hashSalt: "salt",
      },
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should respect hash options #2", async () => {
    function sha256() {
      return crypto.createHash("sha256");
    }

    const compiler = getCompiler({
      output: {
        pathinfo: false,
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js",
        chunkFilename: "[id].[name].js",
        hashDigest: "hex",
        hashDigestLength: 20,
        hashFunction: sha256,
        hashSalt: "salt",
      },
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should emit an error on a broken code in parallel mode", async () => {
    const compiler = getCompiler({
      entry: {
        one: path.resolve(__dirname, "./fixtures/entry.js"),
        two: path.resolve(__dirname, "./fixtures/entry.js"),
      },
      optimization: {
        minimize: false,
        emitOnErrors: true,
      },
    });

    new BrokenCodePlugin().apply(compiler);

    new TerserPlugin({ parallel: true }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should emit an error on a broken code in not parallel mode", async () => {
    const compiler = getCompiler({
      entry: {
        one: path.resolve(__dirname, "./fixtures/entry.js"),
        two: path.resolve(__dirname, "./fixtures/entry.js"),
      },
      optimization: {
        minimize: false,
        emitOnErrors: true,
      },
    });

    new BrokenCodePlugin().apply(compiler);

    new TerserPlugin({ parallel: false }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should write stdout and stderr of workers to stdout and stderr of main process in parallel mode", async () => {
    const { write: stdoutWrite } = process.stdout;
    const { write: stderrWrite } = process.stderr;

    let stdoutOutput = "";
    let stderrOutput = "";

    process.stdout.write = (str) => {
      stdoutOutput += str;
    };

    process.stderr.write = (str) => {
      stderrOutput += str;
    };

    const compiler = getCompiler({
      entry: {
        one: path.resolve(__dirname, "./fixtures/empty.js"),
        two: path.resolve(__dirname, "./fixtures/empty.js"),
      },
    });

    new TerserPlugin({
      parallel: true,
      minify: () => {
        // eslint-disable-next-line no-console
        process.stdout.write("stdout\n");
        // eslint-disable-next-line no-console
        process.stderr.write("stderr\n");

        return { code: "" };
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(stdoutOutput).toMatchSnapshot("process stdout output");
    expect(stderrOutput).toMatchSnapshot("process stderr output");
    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");

    process.stdout.write = stdoutWrite;
    process.stderr.write = stderrWrite;
  });

  it("should write stdout and stderr of workers to stdout and stderr of main process in not parallel mode", async () => {
    const { write: stdoutWrite } = process.stdout;
    const { write: stderrWrite } = process.stderr;

    let stdoutOutput = "";
    let stderrOutput = "";

    process.stdout.write = (str) => {
      stdoutOutput += str;
    };

    process.stderr.write = (str) => {
      stderrOutput += str;
    };

    const compiler = getCompiler({
      entry: {
        one: path.resolve(__dirname, "./fixtures/empty.js"),
        two: path.resolve(__dirname, "./fixtures/empty.js"),
      },
    });

    new TerserPlugin({
      parallel: false,
      minify: () => {
        // eslint-disable-next-line no-console
        process.stdout.write("stdout\n");
        // eslint-disable-next-line no-console
        process.stderr.write("stderr\n");

        return { code: "" };
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(stdoutOutput).toMatchSnapshot("process stdout output");
    expect(stderrOutput).toMatchSnapshot("process stderr output");
    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");

    process.stdout.write = stdoutWrite;
    process.stderr.write = stderrWrite;
  });

  it("should work with ES modules", async () => {
    const multiCompiler = getCompiler([
      {
        mode: "production",
        bail: true,
        entry: path.resolve(__dirname, "./fixtures/entry.js"),
        optimization: {
          minimize: false,
        },
        output: {
          pathinfo: false,
          path: path.resolve(__dirname, "dist/a"),
          filename: "[name].js",
          chunkFilename: "[id].[name].js",
        },
        plugins: [
          new CopyWebpackPlugin({
            patterns: [
              {
                from: path.resolve(__dirname, "./fixtures/copy.js"),
              },
              {
                from: path.resolve(__dirname, "./fixtures/copy.cjs"),
              },
              {
                from: path.resolve(__dirname, "./fixtures/copy.mjs"),
              },
            ],
          }),
          new TerserPlugin(),
        ],
      },
      {
        mode: "production",
        bail: true,
        entry: path.resolve(__dirname, "./fixtures/entry.js"),
        optimization: {
          minimize: false,
        },
        output: {
          pathinfo: false,
          path: path.resolve(__dirname, "dist/b"),
          filename: "[name].js",
          chunkFilename: "[id].[name].js",
        },
        experiments: {
          outputModule: true,
        },
        plugins: [
          new CopyWebpackPlugin({
            patterns: [
              {
                from: path.resolve(__dirname, "./fixtures/copy.js"),
              },
              {
                from: path.resolve(__dirname, "./fixtures/copy.cjs"),
              },
              {
                from: path.resolve(__dirname, "./fixtures/copy.mjs"),
              },
            ],
          }),
          new TerserPlugin(),
        ],
      },
    ]);

    const multiStats = await compile(multiCompiler);

    multiStats.stats.forEach((stats, index) => {
      expect(
        readsAssets(multiCompiler.compilers[index], stats)
      ).toMatchSnapshot("assets");
      expect(getErrors(stats)).toMatchSnapshot("errors");
      expect(getWarnings(stats)).toMatchSnapshot("warnings");
    });
  });

  it("should work with child compilation", async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "fixtures/worker-loader.js"),
      devtool: false,
      module: {
        rules: [
          {
            test: /\.worker\.js$/i,
            loader: "worker-loader",
            options: {
              filename: "[name].worker.js",
              chunkFilename: "[name].chunk.worker.js",
            },
          },
        ],
      },
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work and show minimized assets in stats", async () => {
    const compiler = getCompiler();

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);
    const stringStats = stats.toString({ relatedAssets: true });
    const printedCompressed = stringStats.match(/\[minimized]/g);

    expect(printedCompressed ? printedCompressed.length : 0).toBe(1);
    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work and show related assets in stats", async () => {
    const compiler = getCompiler({
      entry: { comments: path.resolve(__dirname, "./fixtures/comments-4.js") },
      devtool: "source-map",
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(stats.toString().indexOf("2 related asset") !== -1).toBe(true);
    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work and generate real content hash", async () => {
    const compiler = getCompiler({
      entry: {
        app: path.resolve(__dirname, "./fixtures/async-import-export/entry"),
      },
      output: {
        pathinfo: false,
        path: path.resolve(__dirname, "dist"),
        filename: "[name].[contenthash].[chunkhash].[fullhash].js",
        chunkFilename: "[name].[contenthash].[chunkhash].[fullhash].js",
      },
      optimization: {
        minimize: false,
        realContentHash: true,
      },
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);
    const {
      compilation: {
        assets,
        options: { output },
      },
    } = stats;

    for (const assetName of Object.keys(assets)) {
      const [, webpackHash] = assetName.match(/^.+?\.(.+?)\..+$/);
      const { hashDigestLength, hashDigest, hashFunction } = output;
      const cryptoHash = crypto
        .createHash(hashFunction)
        .update(readAsset(assetName, compiler, stats))
        .digest(hashDigest)
        .slice(0, hashDigestLength);

      expect(webpackHash).toBe(cryptoHash);
    }

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work and use memory cache out of box", async () => {
    const compiler = getCompiler({
      entry: {
        js: path.resolve(__dirname, "./fixtures/entry.js"),
        mjs: path.resolve(__dirname, "./fixtures/entry.mjs"),
        importExport: path.resolve(
          __dirname,
          "./fixtures/import-export/entry.js"
        ),
        AsyncImportExport: path.resolve(
          __dirname,
          "./fixtures/async-import-export/entry.js"
        ),
      },
      cache: true,
      output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "[name].js",
        chunkFilename: "[id].[name].js",
      },
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(stats.compilation.emittedAssets.size).toBe(5);
    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");

    await new Promise(async (resolve) => {
      const newStats = await compile(compiler);

      expect(newStats.compilation.emittedAssets.size).toBe(0);
      expect(readsAssets(compiler, newStats)).toMatchSnapshot("assets");
      expect(getWarnings(newStats)).toMatchSnapshot("errors");
      expect(getErrors(newStats)).toMatchSnapshot("warnings");

      resolve();
    });
  });

  it('should work and use memory cache when the "cache" option is "true"', async () => {
    const compiler = getCompiler({
      entry: {
        js: path.resolve(__dirname, "./fixtures/entry.js"),
        mjs: path.resolve(__dirname, "./fixtures/entry.mjs"),
        importExport: path.resolve(
          __dirname,
          "./fixtures/import-export/entry.js"
        ),
        AsyncImportExport: path.resolve(
          __dirname,
          "./fixtures/async-import-export/entry.js"
        ),
      },
      cache: true,
      output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "[name].js",
        chunkFilename: "[id].[name].js",
      },
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(stats.compilation.emittedAssets.size).toBe(5);
    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");

    await new Promise(async (resolve) => {
      const newStats = await compile(compiler);

      expect(newStats.compilation.emittedAssets.size).toBe(0);
      expect(readsAssets(compiler, newStats)).toMatchSnapshot("assets");
      expect(getWarnings(newStats)).toMatchSnapshot("errors");
      expect(getErrors(newStats)).toMatchSnapshot("warnings");

      resolve();
    });
  });

  it('should work and use memory cache when the "cache" option is "true" and the asset has been changed', async () => {
    const compiler = getCompiler({
      entry: {
        js: path.resolve(__dirname, "./fixtures/entry.js"),
        mjs: path.resolve(__dirname, "./fixtures/entry.mjs"),
        importExport: path.resolve(
          __dirname,
          "./fixtures/import-export/entry.js"
        ),
        AsyncImportExport: path.resolve(
          __dirname,
          "./fixtures/async-import-export/entry.js"
        ),
      },
      cache: true,
      output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "[name].js",
        chunkFilename: "[id].[name].js",
      },
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(stats.compilation.emittedAssets.size).toBe(5);
    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");

    new ModifyExistingAsset({ name: "js.js" }).apply(compiler);

    await new Promise(async (resolve) => {
      const newStats = await compile(compiler);

      expect(newStats.compilation.emittedAssets.size).toBe(1);
      expect(readsAssets(compiler, newStats)).toMatchSnapshot("assets");
      expect(getWarnings(newStats)).toMatchSnapshot("errors");
      expect(getErrors(newStats)).toMatchSnapshot("warnings");

      resolve();
    });
  });

  it('should work with source map and use memory cache when the "cache" option is "true"', async () => {
    const compiler = getCompiler({
      devtool: "source-map",
      entry: {
        js: path.resolve(__dirname, "./fixtures/entry.js"),
        mjs: path.resolve(__dirname, "./fixtures/entry.mjs"),
        importExport: path.resolve(
          __dirname,
          "./fixtures/import-export/entry.js"
        ),
        AsyncImportExport: path.resolve(
          __dirname,
          "./fixtures/async-import-export/entry.js"
        ),
      },
      cache: true,
      output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "[name].js",
        chunkFilename: "[id].[name].js",
      },
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(stats.compilation.emittedAssets.size).toBe(10);
    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");

    await new Promise(async (resolve) => {
      const newStats = await compile(compiler);

      expect(newStats.compilation.emittedAssets.size).toBe(0);
      expect(readsAssets(compiler, newStats)).toMatchSnapshot("assets");
      expect(getWarnings(newStats)).toMatchSnapshot("errors");
      expect(getErrors(newStats)).toMatchSnapshot("warnings");

      resolve();
    });
  });

  it('should work with source map and use memory cache when the "cache" option is "true" and the asset has been changed', async () => {
    const compiler = getCompiler({
      devtool: "source-map",
      entry: {
        js: path.resolve(__dirname, "./fixtures/entry.js"),
        mjs: path.resolve(__dirname, "./fixtures/entry.mjs"),
        importExport: path.resolve(
          __dirname,
          "./fixtures/import-export/entry.js"
        ),
        AsyncImportExport: path.resolve(
          __dirname,
          "./fixtures/async-import-export/entry.js"
        ),
      },
      cache: true,
      output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "[name].js",
        chunkFilename: "[id].[name].js",
      },
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(stats.compilation.emittedAssets.size).toBe(10);
    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");

    new ModifyExistingAsset({ name: "js.js" }).apply(compiler);

    await new Promise(async (resolve) => {
      const newStats = await compile(compiler);

      expect(newStats.compilation.emittedAssets.size).toBe(2);
      expect(readsAssets(compiler, newStats)).toMatchSnapshot("assets");
      expect(getWarnings(newStats)).toMatchSnapshot("errors");
      expect(getErrors(newStats)).toMatchSnapshot("warnings");

      resolve();
    });
  });

  it('should work, extract comments in different files and use memory cache memory cache when the "cache" option is "true"', async () => {
    const compiler = getCompiler({
      entry: {
        one: path.resolve(__dirname, "./fixtures/comments.js"),
        two: path.resolve(__dirname, "./fixtures/comments-2.js"),
        three: path.resolve(__dirname, "./fixtures/comments-3.js"),
        four: path.resolve(__dirname, "./fixtures/comments-4.js"),
      },
      cache: true,
      output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "[name].js",
        chunkFilename: "[id].[name].js",
      },
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(stats.compilation.emittedAssets.size).toBe(10);
    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");

    await new Promise(async (resolve) => {
      const newStats = await compile(compiler);

      expect(newStats.compilation.emittedAssets.size).toBe(0);
      expect(readsAssets(compiler, newStats)).toMatchSnapshot("assets");
      expect(getWarnings(newStats)).toMatchSnapshot("errors");
      expect(getErrors(newStats)).toMatchSnapshot("warnings");

      resolve();
    });
  });

  it('should work, extract comments in different files and use memory cache memory cache when the "cache" option is "true" and the asset has been changed', async () => {
    const compiler = getCompiler({
      entry: {
        one: path.resolve(__dirname, "./fixtures/comments.js"),
        two: path.resolve(__dirname, "./fixtures/comments-2.js"),
        three: path.resolve(__dirname, "./fixtures/comments-3.js"),
        four: path.resolve(__dirname, "./fixtures/comments-4.js"),
      },
      cache: true,
      output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "[name].js",
        chunkFilename: "[id].[name].js",
      },
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(stats.compilation.emittedAssets.size).toBe(10);
    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");

    new ModifyExistingAsset({ name: "two.js", comment: true }).apply(compiler);

    await new Promise(async (resolve) => {
      const newStats = await compile(compiler);

      expect(newStats.compilation.emittedAssets.size).toBe(2);
      expect(readsAssets(compiler, newStats)).toMatchSnapshot("assets");
      expect(getWarnings(newStats)).toMatchSnapshot("errors");
      expect(getErrors(newStats)).toMatchSnapshot("warnings");

      resolve();
    });
  });

  it('should work, extract comments in one file and use memory cache memory cache when the "cache" option is "true"', async () => {
    const compiler = getCompiler({
      entry: {
        one: path.resolve(__dirname, "./fixtures/comments.js"),
        two: path.resolve(__dirname, "./fixtures/comments-2.js"),
        three: path.resolve(__dirname, "./fixtures/comments-3.js"),
        four: path.resolve(__dirname, "./fixtures/comments-4.js"),
      },
      cache: true,
      output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "[name].js",
        chunkFilename: "[id].[name].js",
      },
    });

    new TerserPlugin({
      extractComments: {
        filename: "licenses.txt",
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(stats.compilation.emittedAssets.size).toBe(6);
    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");

    await new Promise(async (resolve) => {
      const newStats = await compile(compiler);

      expect(newStats.compilation.emittedAssets.size).toBe(0);
      expect(readsAssets(compiler, newStats)).toMatchSnapshot("assets");
      expect(getWarnings(newStats)).toMatchSnapshot("errors");
      expect(getErrors(newStats)).toMatchSnapshot("warnings");

      resolve();
    });
  });

  it('should work, extract comments in one file and use memory cache memory cache when the "cache" option is "true" and the asset has been changed', async () => {
    const compiler = getCompiler({
      entry: {
        one: path.resolve(__dirname, "./fixtures/comments.js"),
        two: path.resolve(__dirname, "./fixtures/comments-2.js"),
        three: path.resolve(__dirname, "./fixtures/comments-3.js"),
        four: path.resolve(__dirname, "./fixtures/comments-4.js"),
      },
      cache: true,
      output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "[name].js",
        chunkFilename: "[id].[name].js",
      },
    });

    new TerserPlugin({
      extractComments: {
        filename: "licenses.txt",
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(stats.compilation.emittedAssets.size).toBe(6);
    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");

    new ModifyExistingAsset({ name: "two.js", comment: true }).apply(compiler);

    await new Promise(async (resolve) => {
      const newStats = await compile(compiler);

      expect(newStats.compilation.emittedAssets.size).toBe(2);
      expect(readsAssets(compiler, newStats)).toMatchSnapshot("assets");
      expect(getWarnings(newStats)).toMatchSnapshot("errors");
      expect(getErrors(newStats)).toMatchSnapshot("warnings");

      resolve();
    });
  });

  it('should work and do not use memory cache when the "cache" option is "false"', async () => {
    const compiler = getCompiler({
      entry: {
        js: path.resolve(__dirname, "./fixtures/entry.js"),
        mjs: path.resolve(__dirname, "./fixtures/entry.mjs"),
        importExport: path.resolve(
          __dirname,
          "./fixtures/import-export/entry.js"
        ),
        AsyncImportExport: path.resolve(
          __dirname,
          "./fixtures/async-import-export/entry.js"
        ),
      },
      cache: false,
      output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "[name].js",
        chunkFilename: "[id].[name].js",
      },
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(stats.compilation.emittedAssets.size).toBe(5);
    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");

    await new Promise(async (resolve) => {
      const newStats = await compile(compiler);

      expect(newStats.compilation.emittedAssets.size).toBe(5);
      expect(readsAssets(compiler, newStats)).toMatchSnapshot("assets");
      expect(getWarnings(newStats)).toMatchSnapshot("errors");
      expect(getErrors(newStats)).toMatchSnapshot("warnings");

      resolve();
    });
  });

  it('should work with the "devtool" option and the "false" value', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "./fixtures/entry.js"),
      devtool: false,
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it('should work with "devtool" option and the "source-map" value', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "./fixtures/entry.js"),
      devtool: "source-map",
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it('should work with "devtool" option and the "inline-source-map" value', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "./fixtures/entry.js"),
      devtool: "inline-source-map",
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it('should work with "devtool" option and the "hidden-source-map" value', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "./fixtures/entry.js"),
      devtool: "hidden-source-map",
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it('should work with "devtool" option and the "nosources-source-map" value', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "./fixtures/entry.js"),
      devtool: "nosources-source-map",
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it('should work with "devtool" option and the "eval" value', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "./fixtures/entry.js"),
      devtool: "eval",
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it('should work with "devtool" option and the "cheap-source-map" value', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "./fixtures/entry.js"),
      devtool: "cheap-source-map",
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it('should work with the "SourceMapDevToolPlugin" plugin (like "source-map")', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "./fixtures/entry.js"),
      devtool: false,
      plugins: [
        new SourceMapDevToolPlugin({
          filename: "[file].map[query]",
          module: true,
          columns: true,
        }),
      ],
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it('should work with the "SourceMapDevToolPlugin" plugin (like "cheap-source-map")', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "./fixtures/entry.js"),
      devtool: false,
      plugins: [
        new SourceMapDevToolPlugin({
          filename: "[file].map[query]",
          module: false,
          columns: false,
        }),
      ],
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work with multi compiler mode with source maps", async () => {
    const multiCompiler = getCompiler([
      {
        mode: "production",
        devtool: "eval",
        bail: true,
        cache: { type: "memory" },
        entry: path.resolve(__dirname, "./fixtures/entry.js"),
        output: {
          path: path.resolve(__dirname, "./dist"),
          filename: "[name]-1.js",
          chunkFilename: "[id]-1.[name].js",
        },
        optimization: {
          minimize: false,
        },
        plugins: [new TerserPlugin()],
      },
      {
        mode: "production",
        devtool: "source-map",
        bail: true,
        cache: { type: "memory" },
        entry: path.resolve(__dirname, "./fixtures/entry.js"),
        output: {
          path: path.resolve(__dirname, "./dist"),
          filename: "[name]-2.js",
          chunkFilename: "[id]-2.[name].js",
        },
        optimization: {
          minimize: false,
        },
        plugins: [new TerserPlugin()],
      },
      {
        mode: "production",
        bail: true,
        cache: { type: "memory" },
        devtool: false,
        entry: path.resolve(__dirname, "./fixtures/entry.js"),
        output: {
          path: path.resolve(__dirname, "./dist"),
          filename: "[name]-3.js",
          chunkFilename: "[id]-3.[name].js",
        },
        optimization: {
          minimize: false,
        },
        plugins: [
          new SourceMapDevToolPlugin({
            filename: "[file].map[query]",
            module: false,
            columns: false,
          }),
          new TerserPlugin(),
        ],
      },
      {
        mode: "production",
        bail: true,
        cache: { type: "memory" },
        devtool: false,
        entry: path.resolve(__dirname, "./fixtures/entry.js"),
        output: {
          path: path.resolve(__dirname, "./dist"),
          filename: "[name]-4.js",
          chunkFilename: "[id]-4.[name].js",
        },
        optimization: {
          minimize: false,
        },
        plugins: [
          new SourceMapDevToolPlugin({
            filename: "[file].map[query]",
            module: true,
            columns: true,
          }),
          new TerserPlugin(),
        ],
      },
    ]);

    const multiStats = await compile(multiCompiler);

    multiStats.stats.forEach((stats, index) => {
      expect(
        readsAssets(multiCompiler.compilers[index], stats)
      ).toMatchSnapshot("assets");
      expect(getErrors(stats)).toMatchSnapshot("errors");
      expect(getWarnings(stats)).toMatchSnapshot("warnings");
    });
  });

  it('should work with "devtool" option and the "source-map" value (the "parallel" option is "false")', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "./fixtures/entry.js"),
      devtool: "source-map",
    });

    new TerserPlugin({ parallel: false }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it('should work with "devtool" option and the "source-map" value (the "parallel" option is "true")', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "./fixtures/entry.js"),
      devtool: "source-map",
    });

    new TerserPlugin({ parallel: true }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should run plugin against assets added later by plugins", async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, "./fixtures/entry.js"),
    });

    new TerserPlugin().apply(compiler);
    new EmitNewAsset({ name: "newFile.js" }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });
});
