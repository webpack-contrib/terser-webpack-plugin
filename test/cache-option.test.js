import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';

import TerserPlugin from '../src/index';

import { createCompiler, compile, cleanErrorStack, getAssets } from './helpers';

const cacheDir = findCacheDir({ name: 'terser-webpack-plugin' });
const otherCacheDir = findCacheDir({ name: 'other-cache-directory' });

describe('cache option', () => {
  let compiler;

  beforeEach(() => {
    compiler = createCompiler({
      entry: {
        one: `${__dirname}/fixtures/cache.js`,
        two: `${__dirname}/fixtures/cache-1.js`,
        three: `${__dirname}/fixtures/cache-2.js`,
        four: `${__dirname}/fixtures/cache-3.js`,
        five: `${__dirname}/fixtures/cache-4.js`,
      },
    });

    return Promise.all([
      cacache.rm.all(cacheDir),
      cacache.rm.all(otherCacheDir),
    ]);
  });

  afterEach(() =>
    Promise.all([cacache.rm.all(cacheDir), cacache.rm.all(otherCacheDir)])
  );

  it('should match snapshot for the "false" value', async () => {
    new TerserPlugin({ cache: false }).apply(compiler);

    cacache.get = jest.fn(cacache.get);
    cacache.put = jest.fn(cacache.put);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');

    // Cache disabled so we don't run `get` or `put`
    expect(cacache.get.mock.calls.length).toBe(0);
    expect(cacache.put.mock.calls.length).toBe(0);

    const cacheEntriesList = await cacache.ls(cacheDir);
    const cacheKeys = Object.keys(cacheEntriesList);

    expect(cacheKeys.length).toBe(0);
  });

  it('should match snapshot for the "true" value', async () => {
    new TerserPlugin({ cache: true }).apply(compiler);

    cacache.get = jest.fn(cacache.get);
    cacache.put = jest.fn(cacache.put);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');

    const countAssets = Object.keys(stats.compilation.assets).length;

    // Try to found cached files, but we don't have their in cache
    expect(cacache.get.mock.calls.length).toBe(countAssets);
    // Put files in cache
    expect(cacache.put.mock.calls.length).toBe(countAssets);

    const cacheEntriesList = await cacache.ls(cacheDir);

    const cacheKeys = Object.keys(cacheEntriesList);

    // Make sure that we cached files
    expect(cacheKeys.length).toBe(countAssets);

    cacache.get.mockClear();
    cacache.put.mockClear();

    const newStats = await compile(compiler);

    const newErrors = newStats.compilation.errors.map(cleanErrorStack);
    const newWarnings = newStats.compilation.warnings.map(cleanErrorStack);

    expect(newErrors).toMatchSnapshot('errors');
    expect(newWarnings).toMatchSnapshot('warnings');

    expect(getAssets(newStats, compiler)).toMatchSnapshot('assets');

    const newCountAssets = Object.keys(newStats.compilation.assets).length;

    // Now we have cached files so we get them and don't put new
    expect(cacache.get.mock.calls.length).toBe(newCountAssets);
    expect(cacache.put.mock.calls.length).toBe(0);
  });

  it('should match snapshot for the "other-cache-directory" value', async () => {
    new TerserPlugin({ cache: otherCacheDir }).apply(compiler);

    cacache.get = jest.fn(cacache.get);
    cacache.put = jest.fn(cacache.put);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');

    const countAssets = Object.keys(stats.compilation.assets).length;

    // Try to found cached files, but we don't have their in cache
    expect(cacache.get.mock.calls.length).toBe(countAssets);
    // Put files in cache
    expect(cacache.put.mock.calls.length).toBe(countAssets);

    const cacheEntriesList = await cacache.ls(otherCacheDir);
    const cacheKeys = Object.keys(cacheEntriesList);

    // Make sure that we cached files
    expect(cacheKeys.length).toBe(countAssets);

    cacache.get.mockClear();
    cacache.put.mockClear();

    const newStats = await compile(compiler);

    const newErrors = newStats.compilation.errors.map(cleanErrorStack);
    const newWarnings = newStats.compilation.warnings.map(cleanErrorStack);

    expect(newErrors).toMatchSnapshot('errors');
    expect(newWarnings).toMatchSnapshot('warnings');

    expect(getAssets(newStats, compiler)).toMatchSnapshot('assets');

    const newCountAssets = Object.keys(newStats.compilation.assets).length;

    // Now we have cached files so we get their and don't put
    expect(cacache.get.mock.calls.length).toBe(newCountAssets);
    expect(cacache.put.mock.calls.length).toBe(0);
  });

  it('should match snapshot for the "true" value when "cacheKey" is custom "function"', async () => {
    new TerserPlugin({
      cache: true,
      cacheKeys: (defaultCacheKeys, file) => {
        // eslint-disable-next-line no-param-reassign
        defaultCacheKeys.myCacheKey = 1;
        // eslint-disable-next-line no-param-reassign
        defaultCacheKeys.myCacheKeyBasedOnFile = `file-${file}`;

        return defaultCacheKeys;
      },
    }).apply(compiler);

    cacache.get = jest.fn(cacache.get);
    cacache.put = jest.fn(cacache.put);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');

    const countAssets = Object.keys(stats.compilation.assets).length;

    // Try to found cached files, but we don't have their in cache
    expect(cacache.get.mock.calls.length).toBe(countAssets);
    // Put files in cache
    expect(cacache.put.mock.calls.length).toBe(countAssets);

    const cacheEntriesList = await cacache.ls(cacheDir);
    const cacheKeys = Object.keys(cacheEntriesList);

    // Make sure that we cached files
    expect(cacheKeys.length).toBe(countAssets);

    cacheKeys.forEach((cacheEntry) => {
      // eslint-disable-next-line no-new-func
      const cacheEntryOptions = new Function(
        `'use strict'\nreturn ${cacheEntry}`
      )();

      expect(cacheEntryOptions.myCacheKey).toBe(1);
      expect(cacheEntryOptions.myCacheKeyBasedOnFile).toMatch(/file-(.+)?\.js/);
    });

    cacache.get.mockClear();
    cacache.put.mockClear();

    const newStats = await compile(compiler);

    const newErrors = newStats.compilation.errors.map(cleanErrorStack);
    const newWarnings = newStats.compilation.warnings.map(cleanErrorStack);

    expect(newErrors).toMatchSnapshot('errors');
    expect(newWarnings).toMatchSnapshot('warnings');
    expect(getAssets(newStats, compiler)).toMatchSnapshot('assets');

    const newCountAssets = Object.keys(newStats.compilation.assets).length;

    // Now we have cached files so we get their and don't put
    expect(cacache.get.mock.calls.length).toBe(newCountAssets);
    expect(cacache.put.mock.calls.length).toBe(0);
  });

  it('should match snapshot for errors into the "cacheKeys" option', async () => {
    new TerserPlugin({
      cache: true,
      cacheKeys: () => {
        throw new Error('message');
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
  });
});
