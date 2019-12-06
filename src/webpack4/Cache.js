import os from 'os';

import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';
import serialize from 'serialize-javascript';

export default class Cache {
  constructor(options) {
    this.options = options;
    this.cacheDir =
      options.cache === true ? Cache.getCacheDirectory() : options.cache;
  }

  static getCacheDirectory() {
    return findCacheDir({ name: 'terser-webpack-plugin' }) || os.tmpdir();
  }

  isEnabled() {
    return !!this.cacheDir;
  }

  get(task) {
    return cacache
      .get(this.cacheDir, serialize(task.cacheKeys))
      .then(({ data }) => JSON.parse(data));
  }

  store(task, data) {
    return cacache.put(
      this.cacheDir,
      serialize(task.cacheKeys),
      JSON.stringify(data)
    );
  }
}
