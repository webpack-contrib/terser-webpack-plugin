import { javascript } from 'webpack';
// eslint-disable-next-line import/no-unresolved,import/extensions
import serialize from 'serialize-javascript';
import terserPackageJson from 'terser/package.json';

import Cache from './Cache';

const pluginData = { name: 'TerserPlugin' };

export default class Webpack5 {
  static getCache(compilation, options) {
    return new Cache(options, compilation);
  }

  static updateAssetsHash(compilation, options) {
    const hooks = javascript.JavascriptModulesPlugin.getCompilationHooks(
      compilation
    );
    const data = serialize({
      terser: terserPackageJson.version,
      terserOptions: options.terserOptions,
    });

    hooks.chunkHash.tap(pluginData, (chunk, hash) => {
      hash.update('TerserPlugin');
      hash.update(data);
    });
  }
}
