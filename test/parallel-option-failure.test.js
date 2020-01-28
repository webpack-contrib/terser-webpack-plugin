import os from 'os';

import Worker from 'jest-worker';

import TerserPlugin from '../src/index';

import {
  compile,
  getCompiler,
  getErrors,
  getWarnings,
  removeCache,
} from './helpers';

jest.mock('os', () => {
  const actualOs = require.requireActual('os');

  actualOs.cpus = jest.fn(() => {
    return { length: 4 };
  });

  return actualOs;
});

// Based on https://github.com/facebook/jest/blob/edde20f75665c2b1e3c8937f758902b5cf28a7b4/packages/jest-runner/src/__tests__/test_runner.test.js
let workerTransform;
let workerEnd;

jest.mock('jest-worker', () => {
  return jest.fn().mockImplementation(() => {
    return {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      transform: (workerTransform = jest.fn(() => {
        throw new Error('jest-worker failed');
      })),
      end: (workerEnd = jest.fn()),
      getStderr: jest.fn(() => {
        console.warn('jest-worker warning from getStderr');
      }),
    };
  });
});

const workerPath = require.resolve('../src/worker');

describe('parallel option', () => {
  let compiler;

  beforeEach(() => {
    jest.clearAllMocks();

    compiler = getCompiler({
      entry: {
        one: `${__dirname}/fixtures/entry.js`,
        two: `${__dirname}/fixtures/entry.js`,
      },
    });

    return Promise.all([removeCache()]);
  });

  afterEach(() => Promise.all([removeCache()]));

  it('should match snapshot for errors into the "jest-worker" package', async () => {
    new TerserPlugin(
      getCompiler.isWebpack4()
        ? { parallel: true, cache: false }
        : { parallel: true }
    ).apply(compiler);

    const warning = jest.spyOn(console, 'warn');

    const stats = await compile(compiler);

    expect(warning).toHaveBeenLastCalledWith(
      'jest-worker warning from getStderr'
    );

    expect(Worker).toHaveBeenCalledTimes(1);
    expect(Worker).toHaveBeenLastCalledWith(workerPath, {
      numWorkers: Math.min(2, os.cpus().length - 1),
    });
    expect(workerTransform).toHaveBeenCalledTimes(
      Object.keys(stats.compilation.assets).length
    );
    expect(workerEnd).toHaveBeenCalledTimes(1);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  if (getCompiler.isWebpack4()) {
    it('should match snapshot for errors into the "jest-worker" package whe the "cache" option is "true"', async () => {
      new TerserPlugin({ parallel: true, cache: true }).apply(compiler);

      const warning = jest.spyOn(console, 'warn');

      const stats = await compile(compiler);

      expect(warning).toHaveBeenLastCalledWith(
        'jest-worker warning from getStderr'
      );

      expect(Worker).toHaveBeenCalledTimes(1);
      expect(Worker).toHaveBeenLastCalledWith(workerPath, {
        numWorkers: Math.min(2, os.cpus().length - 1),
      });
      expect(workerTransform).toHaveBeenCalledTimes(
        Object.keys(stats.compilation.assets).length
      );
      expect(workerEnd).toHaveBeenCalledTimes(1);

      expect(getErrors(stats)).toMatchSnapshot('errors');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');
    });
  }
});
