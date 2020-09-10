export default class Cache {
  // eslint-disable-next-line no-unused-vars
  constructor(compilation, ignored) {
    this.cache = compilation.getCache('TerserWebpackPlugin');
  }

  async get(cacheData) {
    // eslint-disable-next-line no-param-reassign
    cacheData.eTag =
      cacheData.eTag || this.cache.getLazyHashedEtag(cacheData.inputSource);

    return this.cache.getPromise(cacheData.name, cacheData.eTag);
  }

  async store(cacheData) {
    const { source, extractedComments, commentsFilename, banner } = cacheData;

    return this.cache.storePromise(cacheData.name, cacheData.eTag, {
      source,
      extractedComments,
      commentsFilename,
      banner,
    });
  }
}
