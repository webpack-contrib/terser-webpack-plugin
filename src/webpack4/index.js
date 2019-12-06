import crypto from 'crypto';

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

  static createTask(
    compilation,
    options,
    { file, input, inputSourceMap, commentsFilename }
  ) {
    const task = {
      file,
      input,
      inputSourceMap,
      commentsFilename,
      extractComments: options.extractComments,
      terserOptions: options.terserOptions,
      minify: options.minify,
    };

    if (options.cache) {
      const defaultCacheKeys = {
        terser: terserPackageJson.version,
        // eslint-disable-next-line global-require
        'terser-webpack-plugin': require('../../package.json').version,
        'terser-webpack-plugin-options': options,
        nodeVersion: process.version,
        filename: file,
        contentHash: crypto
          .createHash('md4')
          .update(input)
          .digest('hex'),
      };

      task.cacheKeys = options.cacheKeys(defaultCacheKeys, file);
    }

    return task;
  }
}
