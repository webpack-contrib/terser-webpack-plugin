import os from 'os';

import pLimit from 'p-limit';
import Worker from 'jest-worker';
import serialize from 'serialize-javascript';

import minify from './minify';

const workerPath = require.resolve('./worker');

export default class TaskRunner {
  constructor(options = {}) {
    this.taskGenerator = options.taskGenerator;
    this.files = options.files;
    this.cache = options.cache;
    this.availableNumberOfCores = TaskRunner.getAvailableNumberOfCores(
      options.parallel
    );
  }

  static getAvailableNumberOfCores(parallel) {
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

  async run() {
    const { availableNumberOfCores, cache, files, taskGenerator } = this;

    let concurrency = Infinity;

    if (availableNumberOfCores > 0) {
      // Do not create unnecessary workers when the number of files is less than the available cores, it saves memory
      const numWorkers = Math.min(files.length, availableNumberOfCores);

      concurrency = numWorkers;

      this.worker = new Worker(workerPath, { numWorkers });

      // https://github.com/facebook/jest/issues/8872#issuecomment-524822081
      const workerStdout = this.worker.getStdout();

      if (workerStdout) {
        workerStdout.on('data', (chunk) => {
          return process.stdout.write(chunk);
        });
      }

      const workerStderr = this.worker.getStderr();

      if (workerStderr) {
        workerStderr.on('data', (chunk) => {
          return process.stderr.write(chunk);
        });
      }
    }

    const limit = pLimit(concurrency);
    const scheduledTasks = [];

    for (const file of files) {
      const enqueue = async (task) => {
        let taskResult;

        try {
          taskResult = await this.runTask(task);
        } catch (error) {
          taskResult = { error };
        }

        if (cache.isEnabled() && !taskResult.error) {
          taskResult = await cache.store(task, taskResult).then(
            () => taskResult,
            () => taskResult
          );
        }

        task.callback(taskResult);

        return taskResult;
      };

      scheduledTasks.push(
        limit(() => {
          const task = taskGenerator(file).next().value;

          if (!task) {
            // Something went wrong, for example the `cacheKeys` option throw an error
            return Promise.resolve();
          }

          if (cache.isEnabled()) {
            return cache.get(task).then(
              (taskResult) => task.callback(taskResult),
              () => enqueue(task)
            );
          }

          return enqueue(task);
        })
      );
    }

    return Promise.all(scheduledTasks);
  }

  async exit() {
    if (!this.worker) {
      return Promise.resolve();
    }

    return this.worker.end();
  }
}
