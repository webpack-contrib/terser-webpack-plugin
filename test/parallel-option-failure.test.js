import os from 'os';

import Worker from 'jest-worker';

import TerserPlugin from '../src/index';

import {
  createCompiler,
  compile,
  cleanErrorStack,
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
    };
  });
});

const workerPath = require.resolve('../src/worker');

describe('parallel option', () => {
  let compiler;

  beforeEach(() => {
    jest.clearAllMocks();

    compiler = createCompiler({
      entry: {
        one: `${__dirname}/fixtures/entry.js`,
        two: `${__dirname}/fixtures/entry.js`,
      },
    });

    return Promise.all([removeCache()]);
  });

  afterEach(() => Promise.all([removeCache()]));

  it('should match snapshot for errors into the "jest-worker" package', async () => {
    new TerserPlugin({ parallel: true, cache: false }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(Worker).toHaveBeenCalledTimes(1);
    expect(Worker).toHaveBeenLastCalledWith(workerPath, {
      numWorkers: os.cpus().length - 1,
    });
    expect(workerTransform).toHaveBeenCalledTimes(
      Object.keys(stats.compilation.assets).length
    );
    expect(workerEnd).toHaveBeenCalledTimes(1);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
  });

  it('should match snapshot for errors into the "jest-worker" package whe the "cache" option is "true"', async () => {
    new TerserPlugin({ parallel: true, cache: true }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(Worker).toHaveBeenCalledTimes(1);
    expect(Worker).toHaveBeenLastCalledWith(workerPath, {
      numWorkers: os.cpus().length - 1,
    });
    expect(workerTransform).toHaveBeenCalledTimes(
      Object.keys(stats.compilation.assets).length
    );
    expect(workerEnd).toHaveBeenCalledTimes(1);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
  });
});
