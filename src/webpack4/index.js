import serialize from 'serialize-javascript';
import terserPackageJson from 'terser/package.json';

import Cache from './Cache';

const pluginData = { name: 'TerserPlugin' };

export default class Webpack4 {
  static getCache(compilation, options) {
    return new Cache(options, compilation);
  }

  static updateAssetsHash(compilation, options) {
    const { mainTemplate, chunkTemplate } = compilation;
    const data = serialize({
      terser: terserPackageJson.version,
      terserOptions: options.terserOptions,
    });

    // Regenerate `contenthash` for minified assets
    for (const template of [mainTemplate, chunkTemplate]) {
      template.hooks.hashForChunk.tap(pluginData, (hash) => {
        hash.update('TerserPlugin');
        hash.update(data);
      });
    }
  }
}
