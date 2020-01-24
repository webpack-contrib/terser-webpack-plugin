import os from 'os';

import PQueue from 'p-queue';
import Worker from 'jest-worker';
import serialize from 'serialize-javascript';

import minify from './minify';

const workerPath = require.resolve('./worker');

export default class TaskRunner {
  constructor(options = {}) {
    this.cache = options.cache;
    this.numberWorkers = TaskRunner.getNumberWorkers(options.parallel);
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

      // Show syntax error from jest-worker
      // https://github.com/facebook/jest/issues/8872#issuecomment-524822081
      const workerStderr = this.worker.getStderr();

      if (workerStderr) {
        workerStderr.pipe(process.stderr);
      }
    }

    const queue = new PQueue({ concurrency: this.numberWorkers });

    const scheduledTasks = tasks.map((task) => {
      const enqueue = async () => {
        let taskResult;

        try {
          taskResult = await this.runTask(task);
        } catch (error) {
          taskResult = { error };
        }

        const { callback } = task;

        if (this.cache.isEnabled() && !taskResult.error) {
          taskResult = await this.cache.store(task, taskResult).then(
            () => taskResult,
            () => taskResult
          );
        }

        callback(taskResult);

        return taskResult;
      };

      return queue.add(
        this.cache.isEnabled()
          ? async () => this.cache.get(task).then((data) => data, enqueue)
          : enqueue
      );
    });

    return Promise.all(scheduledTasks);
  }

  async exit() {
    if (!this.worker) {
      return Promise.resolve();
    }

    return this.worker.end();
  }
}
