export default class Cache {
  // eslint-disable-next-line no-unused-vars
  constructor(compilation, ignored) {
    this.cache = compilation.getCache('TerserWebpackPlugin');
  }

  async get(task) {
    // eslint-disable-next-line no-param-reassign
    task.cacheIdent = task.cacheIdent || `${task.name}`;
    // eslint-disable-next-line no-param-reassign
    task.cacheETag =
      task.cacheETag || this.cache.getLazyHashedEtag(task.assetSource);

    return this.cache.getPromise(task.cacheIdent, task.cacheETag);
  }

  async store(task, data) {
    return this.cache.storePromise(task.cacheIdent, task.cacheETag, data);
  }
}
