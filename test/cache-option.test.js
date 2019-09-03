import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';

import TaskRunner from '../src/TaskRunner';
import TerserPlugin from '../src/index';

import {
  createCompiler,
  compile,
  cleanErrorStack,
  getAssets,
  removeCache,
} from './helpers';

const uniqueCacheDirectory = findCacheDir({ name: 'unique-cache-directory' });
const uniqueOtherDirectory = findCacheDir({
  name: 'unique-other-cache-directory',
});
const otherCacheDir = findCacheDir({ name: 'other-cache-directory' });
const otherOtherCacheDir = findCacheDir({
  name: 'other-other-cache-directory',
});

jest.setTimeout(30000);

describe('cache option', () => {
  let compiler;

  beforeEach(() => {
    jest.clearAllMocks();

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
      removeCache(),
      removeCache(uniqueCacheDirectory),
      removeCache(uniqueOtherDirectory),
      removeCache(otherCacheDir),
      removeCache(otherOtherCacheDir),
    ]);
  });

  afterEach(() => {
    return Promise.all([
      removeCache(),
      removeCache(uniqueCacheDirectory),
      removeCache(uniqueOtherDirectory),
      removeCache(otherCacheDir),
      removeCache(otherOtherCacheDir),
    ]);
  });

  it('should match snapshot when a value is not specify', async () => {
    const cacacheGetSpy = jest.spyOn(cacache, 'get');
    const cacachePutSpy = jest.spyOn(cacache, 'put');

    jest.spyOn(TaskRunner, 'getCacheDirectory').mockImplementation(() => {
      return uniqueCacheDirectory;
    });

    new TerserPlugin({ cache: true }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');

    const countAssets = Object.keys(stats.compilation.assets).length;

    // Try to found cached files, but we don't have their in cache
    expect(cacacheGetSpy).toHaveBeenCalledTimes(countAssets);
    // Put files in cache
    expect(cacachePutSpy).toHaveBeenCalledTimes(countAssets);

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
    expect(cacacheGetSpy).toHaveBeenCalledTimes(newCountAssets);
    expect(cacachePutSpy).toHaveBeenCalledTimes(0);
  });

  it('should match snapshot for the "false" value', async () => {
    const cacacheGetSpy = jest.spyOn(cacache, 'get');
    const cacachePutSpy = jest.spyOn(cacache, 'put');

    new TerserPlugin({ cache: false }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');

    // Cache disabled so we don't run `get` or `put`
    expect(cacacheGetSpy).toHaveBeenCalledTimes(0);
    expect(cacachePutSpy).toHaveBeenCalledTimes(0);
  });

  it('should match snapshot for the "true" value', async () => {
    const cacacheGetSpy = jest.spyOn(cacache, 'get');
    const cacachePutSpy = jest.spyOn(cacache, 'put');

    jest.spyOn(TaskRunner, 'getCacheDirectory').mockImplementation(() => {
      return uniqueOtherDirectory;
    });

    new TerserPlugin({ cache: true }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');

    const countAssets = Object.keys(stats.compilation.assets).length;

    // Try to found cached files, but we don't have their in cache
    expect(cacacheGetSpy).toHaveBeenCalledTimes(countAssets);
    // Put files in cache
    expect(cacachePutSpy).toHaveBeenCalledTimes(countAssets);

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
    expect(cacacheGetSpy).toHaveBeenCalledTimes(newCountAssets);
    expect(cacachePutSpy).toHaveBeenCalledTimes(0);
  });

  it('should match snapshot for the "other-cache-directory" value', async () => {
    const cacacheGetSpy = jest.spyOn(cacache, 'get');
    const cacachePutSpy = jest.spyOn(cacache, 'put');

    new TerserPlugin({ cache: otherCacheDir }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');

    const countAssets = Object.keys(stats.compilation.assets).length;

    // Try to found cached files, but we don't have their in cache
    expect(cacacheGetSpy).toHaveBeenCalledTimes(countAssets);
    // Put files in cache
    expect(cacachePutSpy).toHaveBeenCalledTimes(countAssets);

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
    expect(cacacheGetSpy).toHaveBeenCalledTimes(newCountAssets);
    expect(cacachePutSpy).toHaveBeenCalledTimes(0);
  });

  it('should match snapshot when "cacheKey" is custom "function"', async () => {
    const cacacheGetSpy = jest.spyOn(cacache, 'get');
    const cacachePutSpy = jest.spyOn(cacache, 'put');

    new TerserPlugin({
      cache: otherOtherCacheDir,
      cacheKeys: (defaultCacheKeys, file) => {
        // eslint-disable-next-line no-param-reassign
        defaultCacheKeys.myCacheKey = 1;
        // eslint-disable-next-line no-param-reassign
        defaultCacheKeys.myCacheKeyBasedOnFile = `file-${file}`;

        return defaultCacheKeys;
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');

    const countAssets = Object.keys(stats.compilation.assets).length;

    // Try to found cached files, but we don't have their in cache
    expect(cacacheGetSpy).toHaveBeenCalledTimes(countAssets);
    // Put files in cache
    expect(cacachePutSpy).toHaveBeenCalledTimes(countAssets);

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
    expect(cacacheGetSpy).toHaveBeenCalledTimes(newCountAssets);
    expect(cacachePutSpy).toHaveBeenCalledTimes(0);
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
