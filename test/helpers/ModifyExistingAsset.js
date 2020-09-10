import webpack from 'webpack';

// webpack 5 exposes the sources property to ensure the right version of webpack-sources is used
const { ConcatSource } =
  // eslint-disable-next-line global-require
  webpack.sources || require('webpack-sources');

export default class ExistingCommentsFile {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    const plugin = { name: this.constructor.name };

    compiler.hooks.thisCompilation.tap(plugin, (compilation) => {
      compilation.hooks.additionalAssets.tap(plugin, () => {
        // eslint-disable-next-line no-param-reassign
        compilation.assets[this.options.name] = new ConcatSource(
          `function changed() {} ${
            this.options.comment ? '/*! CHANGED */' : ''
          }`,
          compilation.assets[this.options.name]
        );
      });
    });
  }
}
