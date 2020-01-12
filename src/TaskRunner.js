import os from 'os';

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

  async run(tasks, onCompletedTask) {
    if (this.numberWorkers > 1) {
      this.worker = new Worker(workerPath, { numWorkers: this.numberWorkers });

      // show syntax error from jest-worker
      // https://github.com/facebook/jest/issues/8872#issuecomment-524822081
      if (this.worker.getStderr()) this.worker.getStderr().pipe(process.stderr);
    }

    let inputIndex = -1;
    let outputIndex = 0;
    const handlers = {};

    const offerResult = (idx, task, completedTask) => {
      return new Promise((resolve) => {
        handlers[idx] = () => {
          onCompletedTask(task, completedTask);
          delete handlers[idx];
          resolve();
        };
        while (outputIndex in handlers) {
          handlers[outputIndex]();
          outputIndex += 1;
        }
      });
    };

    const runTasks = async () => {
      for (const task of tasks) {
        const enqueue = async () => {
          let result;

          try {
            result = await this.runTask(task);
          } catch (error) {
            result = { error };
          }

          if (this.cache.isEnabled() && !result.error) {
            return this.cache.store(task, result).then(
              () => result,
              () => result
            );
          }

          return result;
        };

        const promise = this.cache.isEnabled()
          ? this.cache.get(task).then((data) => data, enqueue)
          : enqueue();

        inputIndex += 1;

        // eslint-disable-next-line no-await-in-loop
        await offerResult(inputIndex, task, await promise);
      }
    };

    const workerPromises = [];
    for (let i = 0; i < Math.max(1, this.numberWorkers); i++) {
      workerPromises.push(runTasks());
    }
    await Promise.all(workerPromises);
  }

  async exit() {
    if (!this.worker) {
      return Promise.resolve();
    }

    return this.worker.end();
  }
}
