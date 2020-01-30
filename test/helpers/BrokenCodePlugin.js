import { RawSource } from 'webpack-sources';

export default class BrokenCodePlugin {
  apply(compiler) {
    const plugin = { name: this.constructor.name };

    compiler.hooks.compilation.tap(plugin, (compilation) => {
      compilation.hooks.additionalChunkAssets.tap(plugin, () => {
        compilation.additionalChunkAssets.push('broken.js');

        // eslint-disable-next-line no-param-reassign
        compilation.assets['broken.js'] = new RawSource('`Broken===');
      });
    });
  }
}
