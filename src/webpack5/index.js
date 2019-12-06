import { javascript } from 'webpack';
// eslint-disable-next-line import/no-unresolved,import/extensions
import getLazyHashedEtag from 'webpack/lib/cache/getLazyHashedEtag';
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

  static createTask(
    compilation,
    options,
    { file, asset, input, inputSourceMap, commentsFilename }
  ) {
    const cacheIdent = `${compilation.compilerPath}/TerserWebpackPlugin/${file}`;
    const cacheETag = getLazyHashedEtag(asset.source);

    return {
      file,
      input,
      inputSourceMap,
      commentsFilename,
      extractComments: options.extractComments,
      terserOptions: options.terserOptions,
      minify: options.minify,
      cacheIdent,
      cacheETag,
    };
  }
}
