import os from 'os';

import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';
import serialize from 'serialize-javascript';

export default class Webpack4Cache {
  constructor(compilation, options) {
    this.cache =
      options.cache === true
        ? Webpack4Cache.getCacheDirectory()
        : options.cache;
  }

  static getCacheDirectory() {
    return findCacheDir({ name: 'terser-webpack-plugin' }) || os.tmpdir();
  }

  async get(task) {
    if (!this.cache) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    // eslint-disable-next-line no-param-reassign
    task.cacheIdent = task.cacheIdent || serialize(task.cacheKeys);

    let cachedResult;

    try {
      cachedResult = await cacache.get(this.cache, task.cacheIdent);
    } catch (ignoreError) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    return JSON.parse(cachedResult.data);
  }

  async store(task, data) {
    if (!this.cache) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    return cacache.put(this.cache, task.cacheIdent, JSON.stringify(data));
  }
}
