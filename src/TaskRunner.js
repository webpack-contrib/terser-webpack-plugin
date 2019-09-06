import os from 'os';

import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';
import Worker from 'jest-worker';
import serialize from 'serialize-javascript';

import minify from './minify';

const workerPath = require.resolve('./worker');

export default class TaskRunner {
  constructor(options = {}) {
    this.options = options;
    this.cacheDir = TaskRunner.getCacheDirectory(this.options.cache);
    this.numberWorkers = TaskRunner.getNumberWorkers(this.options.parallel);
  }

  static getCacheDirectory(cache) {
    return cache === true
      ? findCacheDir({ name: 'terser-webpack-plugin' }) || os.tmpdir()
      : cache;
  }

  static getNumberWorkers(parallel) {
    // In some cases cpus() returns undefined
    // https://github.com/nodejs/node/issues/19022
    const cpus = os.cpus() || { length: 1 };

    return parallel === true
      ? cpus.length - 1
      : Math.min(Number(parallel) || 0, cpus.length - 1);
  }

  async runTask(task) {
    if (this.worker) {
      return this.worker.transform(serialize(task));
    }

    return minify(task);
  }

  async run(tasks) {
    if (this.numberWorkers > 1) {
      this.worker = new Worker(workerPath, { numWorkers: this.numberWorkers });
    }

    return Promise.all(
      tasks.map((task) => {
        const enqueue = async () => {
          let result;

          try {
            result = await this.runTask(task);
          } catch (error) {
            result = { error };
          }

          if (this.cacheDir && !result.error) {
            return cacache
              .put(
                this.cacheDir,
                serialize(task.cacheKeys),
                JSON.stringify(result)
              )
              .then(() => result, () => result);
          }

          return result;
        };

        if (this.cacheDir) {
          return cacache
            .get(this.cacheDir, serialize(task.cacheKeys))
            .then(({ data }) => JSON.parse(data), enqueue);
        }

        return enqueue();
      })
    );
  }

  async exit() {
    if (!this.worker) {
      return Promise.resolve();
    }

    return this.worker.end();
  }
}
