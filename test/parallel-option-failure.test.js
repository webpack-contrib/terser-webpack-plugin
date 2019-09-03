import os from 'os';

import workerFarm from 'worker-farm';

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
let workerFarmMock;

jest.mock('worker-farm', () => {
  const mock = jest.fn(
    () =>
      (workerFarmMock = jest.fn(() => {
        throw new Error('worker-farm failed');
      }))
  );

  mock.end = jest.fn();

  return mock;
});

describe('parallel option', () => {
  let compiler;

  beforeEach(() => {
    os.cpus.mockClear();
    workerFarm.mockClear();
    workerFarm.end.mockClear();

    compiler = createCompiler({
      entry: {
        one: `${__dirname}/fixtures/entry.js`,
      },
    });

    return Promise.all([removeCache()]);
  });

  afterEach(() => Promise.all([removeCache()]));

  it('should match snapshot for errors into the "worker-farm" package', async () => {
    new TerserPlugin({ parallel: true, cache: false }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(workerFarm.mock.calls.length).toBe(1);
    expect(workerFarmMock.mock.calls.length).toBe(
      Object.keys(stats.compilation.assets).length
    );
    expect(workerFarm.end.mock.calls.length).toBe(1);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
  });

  it('should match snapshot for errors into the "worker-farm" package whe the "cache" option is "true"', async () => {
    new TerserPlugin({ parallel: true, cache: true }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(workerFarm.mock.calls.length).toBe(1);
    expect(workerFarmMock.mock.calls.length).toBe(
      Object.keys(stats.compilation.assets).length
    );
    expect(workerFarm.end.mock.calls.length).toBe(1);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
  });
});
