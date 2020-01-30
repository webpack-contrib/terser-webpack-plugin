// eslint-disable-next-line import/extensions,import/no-unresolved
import getLazyHashedEtag from 'webpack/lib/cache/getLazyHashedEtag';
import serialize from 'serialize-javascript';

import { util } from 'webpack';

export default class Cache {
  constructor(compiler, compilation, options) {
    this.compiler = compiler;
    this.compilation = compilation;
    this.options = options;
  }

  isEnabled() {
    return !!this.compilation.cache;
  }

  createCacheIdent(task) {
    const {
      outputOptions: { hashSalt, hashDigest, hashDigestLength, hashFunction },
    } = this.compilation;

    const hash = util.createHash(hashFunction);

    if (hashSalt) {
      hash.update(hashSalt);
    }

    hash.update(serialize(task.cacheKeys));

    const digest = hash.digest(hashDigest);
    const cacheKeys = digest.substr(0, hashDigestLength);

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
