import os from 'os';

import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';
import workerFarm from 'worker-farm';
import serialize from 'serialize-javascript';

import minify from './minify';

let workerFile = require.resolve('./worker');

try {
  // run test
  workerFile = require.resolve('../dist/worker');
} catch (e) {} // eslint-disable-line no-empty

export default class TaskRunner {
  constructor(options = {}) {
    const { cache, parallel } = options;
    this.cacheDir =
      cache === true ? findCacheDir({ name: 'terser-webpack-plugin' }) : cache;
    this.maxConcurrentWorkers =
      parallel === true
        ? os.cpus().length - 1
        : Math.min(Number(parallel) || 0, os.cpus().length - 1);
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
      this.workers = workerFarm(workerOptions, workerFile);
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

    let toRun = tasks.length;
    const results = [];
    const step = (index, data) => {
      toRun -= 1;
      results[index] = data;

      if (!toRun) {
        callback(null, results);
      }
    };

    tasks.forEach((task, index) => {
      const enqueue = () => {
        this.boundWorkers(task, (error, data) => {
          const result = error ? { error } : data;
          const done = () => step(index, result);

          if (this.cacheDir && !result.error) {
            cacache
              .put(
                this.cacheDir,
                serialize(task.cacheKeys),
                JSON.stringify(data)
              )
              .then(done, done);
          } else {
            done();
          }
        });
      };

      if (this.cacheDir) {
        cacache
          .get(this.cacheDir, serialize(task.cacheKeys))
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
