import webpack from "webpack";

export default class BrokenCodePlugin {
  apply(compiler) {
    const plugin = { name: this.constructor.name };

    compiler.hooks.thisCompilation.tap(plugin, (compilation) => {
      compilation.hooks.additionalAssets.tap(plugin, () => {
        compilation.assets["broken.js"] = new webpack.sources.RawSource(
          "`Broken===",
        );
      });
    });
  }
}
