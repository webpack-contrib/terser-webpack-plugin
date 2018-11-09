import os from 'os';

import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';
import workerFarm from 'worker-farm';
import serialize from 'serialize-javascript';

import minify from './minify';

const worker = require.resolve('./worker');

export default class TaskRunner {
  constructor(options = {}) {
    const { cache, parallel, compactCache } = options;
    this.cacheDir =
      cache === true ? findCacheDir({ name: 'terser-webpack-plugin' }) : cache;
    // In some cases cpus() returns undefined
    // https://github.com/nodejs/node/issues/19022
    const cpus = os.cpus() || { length: 1 };
    this.maxConcurrentWorkers =
      parallel === true
        ? cpus.length - 1
        : Math.min(Number(parallel) || 0, cpus.length - 1);
    this.compactCache = compactCache;
  }

  run(tasks, callback) {
    /* istanbul ignore if */
    if (!tasks.length) {
      callback(null, []);
      return;
    }

    if (this.maxConcurrentWorkers > 1) {
      const workerOptions =
        process.platform === 'win32'
          ? {
              maxConcurrentWorkers: this.maxConcurrentWorkers,
              maxConcurrentCallsPerWorker: 1,
            }
          : { maxConcurrentWorkers: this.maxConcurrentWorkers };
      this.workers = workerFarm(workerOptions, worker);
      this.boundWorkers = (options, cb) => this.workers(serialize(options), cb);
    } else {
      this.boundWorkers = (options, cb) => {
        try {
          cb(null, minify(options));
        } catch (error) {
          cb(error);
        }
      };
    }

    const usedCacheKeys = [];

    let toRun = tasks.length;
    const results = [];
    const step = (index, data) => {
      toRun -= 1;
      results[index] = data;

      if (!toRun) {
        if (this.cacheDir && this.compactCache) {
          cacache.ls(this.cacheDir).then((data) => {
            const unusedKeys = Object.keys(data).filter(
              (key) => !usedCacheKeys.includes(key)
            );

            Promise.all(
              unusedKeys.map((key) => cacache.rm.entry(this.cacheDir, key))
            )
              .then(cacache.verify(this.cacheDir))
              .then(() => callback(null, results));
          });
        } else {
          callback(null, results);
        }
      }
    };

    tasks.forEach((task, index) => {
      const cacheKeys = serialize(task.cacheKeys);
      usedCacheKeys.push(cacheKeys);
      const enqueue = () => {
        this.boundWorkers(task, (error, data) => {
          const result = error ? { error } : data;
          const done = () => step(index, result);

          if (this.cacheDir && !result.error) {
            cacache
              .put(this.cacheDir, cacheKeys, JSON.stringify(data))
              .then(done, done);
          } else {
            done();
          }
        });
      };

      if (this.cacheDir) {
        cacache
          .get(this.cacheDir, cacheKeys)
          .then(({ data }) => step(index, JSON.parse(data)), enqueue);
      } else {
        enqueue();
      }
    });
  }

  exit() {
    if (this.workers) {
      workerFarm.end(this.workers);
    }
  }
}
