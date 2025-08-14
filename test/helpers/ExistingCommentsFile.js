import webpack from "webpack";

export default class ExistingCommentsFile {
  apply(compiler) {
    const plugin = { name: this.constructor.name };

    compiler.hooks.thisCompilation.tap(plugin, (compilation) => {
      compilation.hooks.additionalAssets.tap(plugin, () => {
        compilation.assets["licenses.txt"] = new webpack.sources.RawSource(
          "// Existing Comment",
        );
      });
    });
  }
}
