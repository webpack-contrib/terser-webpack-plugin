import crypto from 'crypto';

// eslint-disable-next-line import/extensions,import/no-unresolved
import getLazyHashedEtag from 'webpack/lib/cache/getLazyHashedEtag';
import serialize from 'serialize-javascript';

export default class Cache {
  constructor(options, compilation) {
    this.options = options;
    this.compilation = compilation;
    this.cacheInfoMap = new WeakMap();
  }

  ensureCacheInfo(task) {
    let item = this.cacheInfoMap.get(task);

    if (!item) {
      const cacheKeys = crypto
        .createHash('md5')
        .update(serialize(task.cacheKeys))
        .digest('hex');

      item = {
        ident: `${this.compilation.compilerPath}/TerserWebpackPlugin/${cacheKeys}/${task.file}`,
        eTag: getLazyHashedEtag(task.asset),
      };

      this.cacheInfoMap.set(task, item);
    }

    return item;
  }

  isEnabled() {
    return !!this.compilation.cache;
  }

  get(task) {
    const cacheInfo = this.ensureCacheInfo(task);

    return new Promise((resolve, reject) => {
      this.compilation.cache.get(
        cacheInfo.ident,
        cacheInfo.eTag,
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
    const cacheInfo = this.ensureCacheInfo(task, this.compilation);

    return new Promise((resolve, reject) => {
      this.compilation.cache.store(
        cacheInfo.ident,
        cacheInfo.eTag,
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
