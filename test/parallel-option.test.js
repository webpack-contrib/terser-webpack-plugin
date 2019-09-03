import os from 'os';

import workerFarm from 'worker-farm';

import TerserPlugin from '../src/index';

import { createCompiler, compile, cleanErrorStack, getAssets } from './helpers';

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
    (options, worker) =>
      (workerFarmMock = jest.fn((data, callback) =>
        // eslint-disable-next-line global-require, import/no-dynamic-require
        require(worker)(data, callback)
      ))
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
        two: `${__dirname}/fixtures/entry.js`,
        three: `${__dirname}/fixtures/entry.js`,
        four: `${__dirname}/fixtures/entry.js`,
      },
    });
  });

  it('should match snapshot when a value is not specify', async () => {
    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(workerFarm.mock.calls.length).toBe(1);
    expect(workerFarm.mock.calls[0][0].maxConcurrentWorkers).toBe(
      os.cpus().length - 1
    );
    expect(workerFarmMock.mock.calls.length).toBe(
      Object.keys(stats.compilation.assets).length
    );
    expect(workerFarm.end.mock.calls.length).toBe(1);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for the "false" value', async () => {
    new TerserPlugin({ parallel: false }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(workerFarm.mock.calls.length).toBe(0);
    expect(workerFarm.end.mock.calls.length).toBe(0);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for the "true" value', async () => {
    new TerserPlugin({ parallel: true }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(workerFarm.mock.calls.length).toBe(1);
    expect(workerFarm.mock.calls[0][0].maxConcurrentWorkers).toBe(
      os.cpus().length - 1
    );
    expect(workerFarmMock.mock.calls.length).toBe(
      Object.keys(stats.compilation.assets).length
    );
    expect(workerFarm.end.mock.calls.length).toBe(1);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for the "2" value', async () => {
    new TerserPlugin({ parallel: 2 }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(workerFarm.mock.calls.length).toBe(1);
    expect(workerFarm.mock.calls[0][0].maxConcurrentWorkers).toBe(2);
    expect(workerFarmMock.mock.calls.length).toBe(
      Object.keys(stats.compilation.assets).length
    );
    expect(workerFarm.end.mock.calls.length).toBe(1);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });
});
