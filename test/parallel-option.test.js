import os from 'os';

import workerFarm from 'worker-farm';

import TerserPlugin from '../src/index';

import { createCompiler, compile, cleanErrorStack } from './helpers';

// Based on https://github.com/facebook/jest/blob/edde20f75665c2b1e3c8937f758902b5cf28a7b4/packages/jest-runner/src/__tests__/test_runner.test.js
let workerFarmMock;

jest.mock('worker-farm', () => {
  const mock = jest.fn(
    (options, worker) =>
      (workerFarmMock = jest.fn((data, callback) =>
        // eslint-disable-next-line global-require, import/no-dynamic-require
        require(worker)(data, callback)
      ))
  );
  mock.end = jest.fn();
  return mock;
});

describe('when applied with `parallel` option', () => {
  let compiler;

  beforeEach(() => {
    workerFarm.mockClear();
    workerFarm.end.mockClear();

    compiler = createCompiler({
      entry: {
        one: `${__dirname}/fixtures/entry.js`,
        two: `${__dirname}/fixtures/entry.js`,
        three: `${__dirname}/fixtures/entry.js`,
        four: `${__dirname}/fixtures/entry.js`,
      },
    });
  });

  it('matches snapshot for `false` value', () => {
    new TerserPlugin({ parallel: false }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(workerFarm.mock.calls.length).toBe(0);
      expect(workerFarm.end.mock.calls.length).toBe(0);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (
          Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
        ) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
    });
  });

  it('matches snapshot for `true` value', () => {
    new TerserPlugin({ parallel: true }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      const cpus = os.cpus() || { length: 1 };
      const maxConcurrentWorkers = cpus.length - 1;

      if (maxConcurrentWorkers > 1) {
        expect(workerFarm.mock.calls.length).toBe(1);
        expect(workerFarm.mock.calls[0][0].maxConcurrentWorkers).toBe(
          os.cpus().length - 1
        );
        expect(workerFarmMock.mock.calls.length).toBe(
          Object.keys(stats.compilation.assets).length
        );
        expect(workerFarm.end.mock.calls.length).toBe(1);
      }

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (
          Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
        ) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
    });
  });

  it('matches snapshot for `2` value (number)', () => {
    new TerserPlugin({ parallel: 2 }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      const cpus = os.cpus() || { length: 1 };
      const maxConcurrentWorkers = cpus.length - 1;

      if (maxConcurrentWorkers > 1) {
        expect(workerFarm.mock.calls.length).toBe(1);
        expect(workerFarm.mock.calls[0][0].maxConcurrentWorkers).toBe(2);
        expect(workerFarmMock.mock.calls.length).toBe(
          Object.keys(stats.compilation.assets).length
        );
        expect(workerFarm.end.mock.calls.length).toBe(1);
      }

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (
          Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
        ) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
    });
  });
});
