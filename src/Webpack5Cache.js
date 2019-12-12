import crypto from 'crypto';

// eslint-disable-next-line import/extensions,import/no-unresolved
import getLazyHashedEtag from 'webpack/lib/cache/getLazyHashedEtag';
import serialize from 'serialize-javascript';

export default class Cache {
  constructor(compilation, options) {
    this.options = options;
    this.compilation = compilation;
  }

  isEnabled() {
    return !!this.compilation.cache;
  }

  createCacheIdent(task) {
    const cacheKeys = crypto
      .createHash('md4')
      .update(serialize(task.cacheKeys))
      .digest('hex');

    return `${this.compilation.compilerPath}/TerserWebpackPlugin/${cacheKeys}/${task.file}`;
  }

  get(task) {
    // eslint-disable-next-line no-param-reassign
    task.cacheIdent = task.cacheIdent || this.createCacheIdent(task);
    // eslint-disable-next-line no-param-reassign
    task.cacheETag = task.cacheETag || getLazyHashedEtag(task.asset);

    return new Promise((resolve, reject) => {
      this.compilation.cache.get(
        task.cacheIdent,
        task.cacheETag,
        (err, result) => {
          if (err) {
            reject(err);
          } else if (result) {
            resolve(result);
          } else {
            reject();
          }
        }
      );
    });
  }

  store(task, data) {
    return new Promise((resolve, reject) => {
      this.compilation.cache.store(
        task.cacheIdent,
        task.cacheETag,
        data,
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        }
      );
    });
  }
}
