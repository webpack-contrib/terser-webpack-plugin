import webpack from "webpack";

export default class ExistingCommentsFile {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    const plugin = { name: this.constructor.name };

    compiler.hooks.thisCompilation.tap(plugin, (compilation) => {
      compilation.hooks.additionalAssets.tap(plugin, () => {
        // eslint-disable-next-line no-param-reassign
        compilation.assets[this.options.name] =
          new webpack.sources.ConcatSource(
            `function changed() {} ${
              this.options.comment ? "/*! CHANGED */" : ""
            }`,
            compilation.assets[this.options.name]
          );
      });
    });
  }
}
