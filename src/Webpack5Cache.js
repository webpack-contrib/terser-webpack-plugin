export default class Cache {
  // eslint-disable-next-line class-methods-use-this
  async get(cache, cacheData) {
    // eslint-disable-next-line no-param-reassign
    cacheData.eTag =
      cacheData.eTag || Array.isArray(cacheData.inputSource)
        ? cacheData.inputSource
            .map((item) => cache.getLazyHashedEtag(item))
            .reduce((previousValue, currentValue) =>
              cache.mergeEtags(previousValue, currentValue)
            )
        : cache.getLazyHashedEtag(cacheData.inputSource);

    return cache.getPromise(cacheData.name, cacheData.eTag);
  }

  // eslint-disable-next-line class-methods-use-this
  async store(cache, cacheData) {
    let data;

    if (cacheData.target === 'comments') {
      data = cacheData.output;
    } else {
      data = {
        source: cacheData.source,
        extractedCommentsSource: cacheData.extractedCommentsSource,
        commentsFilename: cacheData.commentsFilename,
      };
    }

    return cache.storePromise(cacheData.name, cacheData.eTag, data);
  }
}
