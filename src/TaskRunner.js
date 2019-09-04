import os from 'os';
import util from 'util';

import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';
import workerFarm from 'worker-farm';
import serialize from 'serialize-javascript';
import isWsl from 'is-wsl';

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

    // WSL sometimes freezes, error seems to be on the WSL side
    // https://github.com/webpack-contrib/terser-webpack-plugin/issues/21
    return isWsl
      ? 1
      : parallel === true
      ? cpus.length - 1
      : Math.min(Number(parallel) || 0, cpus.length - 1);
  }

  async runTask(task) {
    if (this.workers) {
      return util.promisify(this.workers)(serialize(task));
    }

    return minify(task);
  }

  async run(tasks) {
    if (tasks.length === 0) {
      return Promise.resolve([]);
    }

    if (this.numberWorkers > 1 && tasks.length > 1) {
      this.workers = workerFarm(
        process.platform === 'win32'
          ? {
              maxConcurrentWorkers: this.numberWorkers,
              maxConcurrentCallsPerWorker: 1,
            }
          : { maxConcurrentWorkers: this.numberWorkers },
        workerPath
      );
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

  exit() {
    if (this.workers) {
      workerFarm.end(this.workers);
    }
  }
}
