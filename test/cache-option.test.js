import path from "path";

import del from "del";

import TerserPlugin from "../src/index";

import {
  compile,
  getCompiler,
  getErrors,
  getWarnings,
  readsAssets,
} from "./helpers";

jest.setTimeout(30000);

describe('"cache" option', () => {
  const fileSystemCacheDirectory = path.resolve(
    __dirname,
    "./outputs/type-filesystem"
  );
  const fileSystemCacheDirectory1 = path.resolve(
    __dirname,
    "./outputs/type-filesystem-1"
  );
  const fileSystemCacheDirectory2 = path.resolve(
    __dirname,
    "./outputs/type-filesystem-2"
  );
  const fileSystemCacheDirectory3 = path.resolve(
    __dirname,
    "./outputs/type-filesystem-3"
  );

  beforeAll(() => {
    return Promise.all([
      del(fileSystemCacheDirectory),
      del(fileSystemCacheDirectory1),
      del(fileSystemCacheDirectory2),
      del(fileSystemCacheDirectory3),
    ]);
  });

  it('should work with "false" value for the "cache" option', async () => {
    const compiler = getCompiler({
      entry: {
        one: path.resolve(__dirname, "./fixtures/cache.js"),
        two: path.resolve(__dirname, "./fixtures/cache-1.js"),
        three: path.resolve(__dirname, "./fixtures/cache-2.js"),
        four: path.resolve(__dirname, "./fixtures/cache-3.js"),
        five: path.resolve(__dirname, "./fixtures/cache-4.js"),
      },
      cache: false,
    });

    new TerserPlugin().apply(compiler);

    let getCounter = 0;

    compiler.cache.hooks.get.tap(
      { name: "TestCache", stage: -100 },
      (identifier) => {
        if (identifier.indexOf("TerserWebpackPlugin") !== -1) {
          getCounter += 1;
        }
      }
    );

    let storeCounter = 0;

    compiler.cache.hooks.store.tap(
      { name: "TestCache", stage: -100 },
      (identifier) => {
        if (identifier.indexOf("TerserWebpackPlugin") !== -1) {
          storeCounter += 1;
        }
      }
    );

    const stats = await compile(compiler);

    // Without cache webpack always try to get
    expect(getCounter).toBe(5);
    // Without cache webpack always try to store
    expect(storeCounter).toBe(5);
    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");

    getCounter = 0;
    storeCounter = 0;

    const newStats = await compile(compiler);

    // Without cache webpack always try to get
    expect(getCounter).toBe(5);
    // Without cache webpack always try to store
    expect(storeCounter).toBe(5);
    expect(readsAssets(compiler, newStats)).toMatchSnapshot("assets");
    expect(getErrors(newStats)).toMatchSnapshot("errors");
    expect(getWarnings(newStats)).toMatchSnapshot("warnings");

    await new Promise((resolve) => {
      compiler.close(() => {
        resolve();
      });
    });
  });

  it('should work with "memory" value for the "cache.type" option', async () => {
    const compiler = getCompiler({
      entry: {
        one: path.resolve(__dirname, "./fixtures/cache.js"),
        two: path.resolve(__dirname, "./fixtures/cache-1.js"),
        three: path.resolve(__dirname, "./fixtures/cache-2.js"),
        four: path.resolve(__dirname, "./fixtures/cache-3.js"),
        five: path.resolve(__dirname, "./fixtures/cache-4.js"),
      },
      cache: {
        type: "memory",
      },
    });

    new TerserPlugin().apply(compiler);

    let getCounter = 0;

    compiler.cache.hooks.get.tap(
      { name: "TestCache", stage: -100 },
      (identifier) => {
        if (identifier.indexOf("TerserWebpackPlugin") !== -1) {
          getCounter += 1;
        }
      }
    );

    let storeCounter = 0;

    compiler.cache.hooks.store.tap(
      { name: "TestCache", stage: -100 },
      (identifier) => {
        if (identifier.indexOf("TerserWebpackPlugin") !== -1) {
          storeCounter += 1;
        }
      }
    );

    const stats = await compile(compiler);

    // Get cache for assets
    expect(getCounter).toBe(5);
    // Store cached assets
    expect(storeCounter).toBe(5);
    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");

    getCounter = 0;
    storeCounter = 0;

    const newStats = await compile(compiler);

    // Get cache for assets
    expect(getCounter).toBe(5);
    // No need to store, we got cached assets
    expect(storeCounter).toBe(0);
    expect(readsAssets(compiler, newStats)).toMatchSnapshot("assets");
    expect(getErrors(newStats)).toMatchSnapshot("errors");
    expect(getWarnings(newStats)).toMatchSnapshot("warnings");

    await new Promise((resolve) => {
      compiler.close(() => {
        resolve();
      });
    });
  });

  it('should work with "filesystem" value for the "cache.type" option', async () => {
    const compiler = getCompiler({
      entry: {
        one: path.resolve(__dirname, "./fixtures/cache.js"),
        two: path.resolve(__dirname, "./fixtures/cache-1.js"),
        three: path.resolve(__dirname, "./fixtures/cache-2.js"),
        four: path.resolve(__dirname, "./fixtures/cache-3.js"),
        five: path.resolve(__dirname, "./fixtures/cache-4.js"),
      },
      cache: {
        type: "filesystem",
        cacheDirectory: fileSystemCacheDirectory,
      },
    });

    new TerserPlugin().apply(compiler);

    let getCounter = 0;

    compiler.cache.hooks.get.tap(
      { name: "TestCache", stage: -100 },
      (identifier) => {
        if (identifier.indexOf("TerserWebpackPlugin") !== -1) {
          getCounter += 1;
        }
      }
    );

    let storeCounter = 0;

    compiler.cache.hooks.store.tap(
      { name: "TestCache", stage: -100 },
      (identifier) => {
        if (identifier.indexOf("TerserWebpackPlugin") !== -1) {
          storeCounter += 1;
        }
      }
    );

    const stats = await compile(compiler);

    // Get cache for assets
    expect(getCounter).toBe(5);
    // Store cached assets
    expect(storeCounter).toBe(5);
    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");

    getCounter = 0;
    storeCounter = 0;

    const newStats = await compile(compiler);

    // Get cache for assets
    expect(getCounter).toBe(5);
    // No need to store, we got cached assets
    expect(storeCounter).toBe(0);
    expect(readsAssets(compiler, newStats)).toMatchSnapshot("assets");
    expect(getErrors(newStats)).toMatchSnapshot("errors");
    expect(getWarnings(newStats)).toMatchSnapshot("warnings");

    await new Promise((resolve) => {
      compiler.close(() => {
        resolve();
      });
    });
  });

  it('should work with "filesystem" value for the "cache.type" option and source maps', async () => {
    const compiler = getCompiler({
      devtool: "source-map",
      entry: {
        one: path.resolve(__dirname, "./fixtures/cache.js"),
        two: path.resolve(__dirname, "./fixtures/cache-1.js"),
        three: path.resolve(__dirname, "./fixtures/cache-2.js"),
        four: path.resolve(__dirname, "./fixtures/cache-3.js"),
        five: path.resolve(__dirname, "./fixtures/cache-4.js"),
      },
      cache: {
        type: "filesystem",
        cacheDirectory: fileSystemCacheDirectory1,
      },
    });

    new TerserPlugin().apply(compiler);

    let getCounter = 0;

    compiler.cache.hooks.get.tap(
      { name: "TestCache", stage: -100 },
      (identifier) => {
        if (identifier.indexOf("TerserWebpackPlugin") !== -1) {
          getCounter += 1;
        }
      }
    );

    let storeCounter = 0;

    compiler.cache.hooks.store.tap(
      { name: "TestCache", stage: -100 },
      (identifier) => {
        if (identifier.indexOf("TerserWebpackPlugin") !== -1) {
          storeCounter += 1;
        }
      }
    );

    const stats = await compile(compiler);

    // Get cache for assets
    expect(getCounter).toBe(5);
    // Store cached assets
    expect(storeCounter).toBe(5);
    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");

    getCounter = 0;
    storeCounter = 0;

    const newStats = await compile(compiler);

    // Get cache for assets
    expect(getCounter).toBe(5);
    // No need to store, we got cached assets
    expect(storeCounter).toBe(0);
    expect(readsAssets(compiler, newStats)).toMatchSnapshot("assets");
    expect(getErrors(newStats)).toMatchSnapshot("errors");
    expect(getWarnings(newStats)).toMatchSnapshot("warnings");

    await new Promise((resolve) => {
      compiler.close(() => {
        resolve();
      });
    });
  });

  it('should work with "filesystem" value for the "cache.type" option and extract comments in different files', async () => {
    const compiler = getCompiler({
      entry: {
        one: path.resolve(__dirname, "./fixtures/comments.js"),
        two: path.resolve(__dirname, "./fixtures/comments-2.js"),
        three: path.resolve(__dirname, "./fixtures/comments-3.js"),
        four: path.resolve(__dirname, "./fixtures/comments-4.js"),
      },
      cache: {
        type: "filesystem",
        cacheDirectory: fileSystemCacheDirectory2,
      },
    });

    new TerserPlugin().apply(compiler);

    let getCounter = 0;

    compiler.cache.hooks.get.tap(
      { name: "TestCache", stage: -100 },
      (identifier) => {
        if (identifier.indexOf("TerserWebpackPlugin") !== -1) {
          getCounter += 1;
        }
      }
    );

    let storeCounter = 0;

    compiler.cache.hooks.store.tap(
      { name: "TestCache", stage: -100 },
      (identifier) => {
        if (identifier.indexOf("TerserWebpackPlugin") !== -1) {
          storeCounter += 1;
        }
      }
    );

    const stats = await compile(compiler);

    // Get cache for assets
    expect(getCounter).toBe(5);
    // Store cached assets
    expect(storeCounter).toBe(5);
    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");

    getCounter = 0;
    storeCounter = 0;

    const newStats = await compile(compiler);

    // Get cache for assets
    expect(getCounter).toBe(5);
    // No need to store, we got cached assets
    expect(storeCounter).toBe(0);
    expect(readsAssets(compiler, newStats)).toMatchSnapshot("assets");
    expect(getErrors(newStats)).toMatchSnapshot("errors");
    expect(getWarnings(newStats)).toMatchSnapshot("warnings");

    await new Promise((resolve) => {
      compiler.close(() => {
        resolve();
      });
    });
  });

  it('should work with "filesystem" value for the "cache.type" option and extract comments in the one file', async () => {
    const compiler = getCompiler({
      entry: {
        one: path.resolve(__dirname, "./fixtures/comments.js"),
        two: path.resolve(__dirname, "./fixtures/comments-2.js"),
        three: path.resolve(__dirname, "./fixtures/comments-3.js"),
        four: path.resolve(__dirname, "./fixtures/comments-4.js"),
      },
      cache: {
        type: "filesystem",
        cacheDirectory: fileSystemCacheDirectory3,
      },
    });

    new TerserPlugin({
      extractComments: {
        filename: "licenses.txt",
      },
    }).apply(compiler);

    let getCounter = 0;

    compiler.cache.hooks.get.tap(
      { name: "TestCache", stage: -100 },
      (identifier) => {
        if (identifier.indexOf("TerserWebpackPlugin") !== -1) {
          getCounter += 1;
        }
      }
    );

    let storeCounter = 0;

    compiler.cache.hooks.store.tap(
      { name: "TestCache", stage: -100 },
      (identifier) => {
        if (identifier.indexOf("TerserWebpackPlugin") !== -1) {
          storeCounter += 1;
        }
      }
    );

    const stats = await compile(compiler);

    // Get cache for assets
    expect(getCounter).toBe(9);
    // Store cached assets
    expect(storeCounter).toBe(9);
    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");

    getCounter = 0;
    storeCounter = 0;

    const newStats = await compile(compiler);

    // Get cache for assets
    expect(getCounter).toBe(9);
    // No need to store, we got cached assets
    expect(storeCounter).toBe(0);
    expect(readsAssets(compiler, newStats)).toMatchSnapshot("assets");
    expect(getErrors(newStats)).toMatchSnapshot("errors");
    expect(getWarnings(newStats)).toMatchSnapshot("warnings");

    await new Promise((resolve) => {
      compiler.close(() => {
        resolve();
      });
    });
  });
});
