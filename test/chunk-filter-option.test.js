import path from "path";

import TerserPlugin from "../src/index";

import {
  compile,
  getCompiler,
  getErrors,
  getWarnings,
  readsAssets,
} from "./helpers";

describe("chunk filter option", () => {
  let compiler;

  beforeEach(() => {
    compiler = getCompiler({
      entry: {
        include: path.resolve(__dirname, "./fixtures/entry.js"),
        dontInclude: path.resolve(__dirname, "./fixtures/file.js"),
      },
      output: {
        path: path.resolve(__dirname, "./dist"),
        filename: `[name].js`,
        chunkFilename: `[id].[name].js`,
      },
    });
  });

  it("should match snapshot with empty value", async () => {
    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should match snapshot for a chunk filter that only includes one chunk", async () => {
    const chunkFilter = jest.fn((chunk) => chunk.name === "include");
    new TerserPlugin({
      chunkFilter: (chunk, name) => chunkFilter(chunk, name),
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(chunkFilter).toHaveBeenCalledWith(
      expect.objectContaining({ name: "include" }),
      "include.js"
    );
    expect(chunkFilter).toHaveBeenCalledWith(
      expect.objectContaining({ name: "dontInclude" }),
      "dontInclude.js"
    );
    expect(readsAssets(compiler, stats)).toMatchSnapshot("assets");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });
});
