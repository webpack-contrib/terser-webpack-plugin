import os from 'os';

import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';
import serialize from 'serialize-javascript';

export default class Webpack4Cache {
  constructor(compiler, compilation, options) {
    this.options = options;
    this.cacheDir =
      options.cache === true
        ? findCacheDir({ name: 'terser-webpack-plugin' }) || os.tmpdir()
        : options.cache;
  }

  isEnabled() {
    return !!this.cacheDir;
  }

  get(task) {
    // eslint-disable-next-line no-param-reassign
    task.cacheIdent = task.cacheIdent || serialize(task.cacheKeys);

    return cacache
      .get(this.cacheDir, task.cacheIdent)
      .then(({ data }) => JSON.parse(data));
  }

  store(task, data) {
    return cacache.put(this.cacheDir, task.cacheIdent, JSON.stringify(data));
  }
}
