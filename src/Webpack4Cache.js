import os from 'os';

import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';
import serialize from 'serialize-javascript';

export default class Webpack4Cache {
  constructor(compilation, options) {
    this.cacheDir =
      options.cache === true
        ? Webpack4Cache.getCacheDirectory()
        : options.cache;
  }

  static getCacheDirectory() {
    return findCacheDir({ name: 'terser-webpack-plugin' }) || os.tmpdir();
  }

  isEnabled() {
    return Boolean(this.cacheDir);
  }

  async get(task) {
    // eslint-disable-next-line no-param-reassign
    task.cacheIdent = task.cacheIdent || serialize(task.cacheKeys);

    const { data } = await cacache.get(this.cacheDir, task.cacheIdent);

    return JSON.parse(data);
  }

  async store(task, data) {
    return cacache.put(this.cacheDir, task.cacheIdent, JSON.stringify(data));
  }
}
