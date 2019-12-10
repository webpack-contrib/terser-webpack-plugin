import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';

import Webpack4Cache from '../src/Webpack4Cache';
import TerserPlugin from '../src/index';

import {
  compile,
  getCompiler,
  getErrors,
  getWarnings,
  readsAssets,
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
const otherOtherOtherCacheDir = findCacheDir({
  name: 'other-other-other-cache-directory',
});

jest.setTimeout(30000);

if (getCompiler.isWebpack4()) {
  describe('cache option', () => {
    let compiler;

    beforeEach(() => {
      compiler = getCompiler({
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
        removeCache(otherOtherOtherCacheDir),
      ]);
    });

    afterEach(() => {
      return Promise.all([
        removeCache(),
        removeCache(uniqueCacheDirectory),
        removeCache(uniqueOtherDirectory),
        removeCache(otherCacheDir),
        removeCache(otherOtherCacheDir),
        removeCache(otherOtherOtherCacheDir),
      ]);
    });

    it('should match snapshot when a value is not specify', async () => {
      const cacacheGetSpy = jest.spyOn(cacache, 'get');
      const cacachePutSpy = jest.spyOn(cacache, 'put');

      const getCacheDirectorySpy = jest
        .spyOn(Webpack4Cache, 'getCacheDirectory')
        .mockImplementation(() => uniqueCacheDirectory);

      new TerserPlugin({ cache: true }).apply(compiler);

      const stats = await compile(compiler);

      expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
      expect(getErrors(stats)).toMatchSnapshot('errors');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');

      const countAssets = Object.keys(stats.compilation.assets).length;

      // Try to found cached files, but we don't have their in cache
      expect(cacacheGetSpy).toHaveBeenCalledTimes(countAssets);
      // Put files in cache
      expect(cacachePutSpy).toHaveBeenCalledTimes(countAssets);

      cacache.get.mockClear();
      cacache.put.mockClear();

      const newStats = await compile(compiler);

      expect(readsAssets(compiler, newStats)).toMatchSnapshot('assets');
      expect(getErrors(stats)).toMatchSnapshot('errors');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');

      const newCountAssets = Object.keys(newStats.compilation.assets).length;

      // Now we have cached files so we get them and don't put new
      expect(cacacheGetSpy).toHaveBeenCalledTimes(newCountAssets);
      expect(cacachePutSpy).toHaveBeenCalledTimes(0);

      cacacheGetSpy.mockRestore();
      cacachePutSpy.mockRestore();
      getCacheDirectorySpy.mockRestore();
    });

    it('should match snapshot for the "false" value', async () => {
      const cacacheGetSpy = jest.spyOn(cacache, 'get');
      const cacachePutSpy = jest.spyOn(cacache, 'put');

      new TerserPlugin({ cache: false }).apply(compiler);

      const stats = await compile(compiler);

      expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
      expect(getErrors(stats)).toMatchSnapshot('errors');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');

      // Cache disabled so we don't run `get` or `put`
      expect(cacacheGetSpy).toHaveBeenCalledTimes(0);
      expect(cacachePutSpy).toHaveBeenCalledTimes(0);

      cacacheGetSpy.mockRestore();
      cacachePutSpy.mockRestore();
    });

    it('should match snapshot for the "true" value', async () => {
      const cacacheGetSpy = jest.spyOn(cacache, 'get');
      const cacachePutSpy = jest.spyOn(cacache, 'put');

      const getCacheDirectorySpy = jest
        .spyOn(Webpack4Cache, 'getCacheDirectory')
        .mockImplementation(() => {
          return uniqueOtherDirectory;
        });

      new TerserPlugin({ cache: true }).apply(compiler);

      const stats = await compile(compiler);

      expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
      expect(getErrors(stats)).toMatchSnapshot('errors');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');

      const countAssets = Object.keys(stats.compilation.assets).length;

      // Try to found cached files, but we don't have their in cache
      expect(cacacheGetSpy).toHaveBeenCalledTimes(countAssets);
      // Put files in cache
      expect(cacachePutSpy).toHaveBeenCalledTimes(countAssets);

      cacache.get.mockClear();
      cacache.put.mockClear();

      const newStats = await compile(compiler);

      expect(readsAssets(compiler, newStats)).toMatchSnapshot('assets');
      expect(getErrors(stats)).toMatchSnapshot('errors');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');

      const newCountAssets = Object.keys(newStats.compilation.assets).length;

      // Now we have cached files so we get them and don't put new
      expect(cacacheGetSpy).toHaveBeenCalledTimes(newCountAssets);
      expect(cacachePutSpy).toHaveBeenCalledTimes(0);

      cacacheGetSpy.mockRestore();
      cacachePutSpy.mockRestore();
      getCacheDirectorySpy.mockRestore();
    });

    it('should match snapshot for the "other-cache-directory" value', async () => {
      const cacacheGetSpy = jest.spyOn(cacache, 'get');
      const cacachePutSpy = jest.spyOn(cacache, 'put');

      new TerserPlugin({ cache: otherCacheDir }).apply(compiler);

      const stats = await compile(compiler);

      expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
      expect(getErrors(stats)).toMatchSnapshot('errors');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');

      const countAssets = Object.keys(stats.compilation.assets).length;

      // Try to found cached files, but we don't have their in cache
      expect(cacacheGetSpy).toHaveBeenCalledTimes(countAssets);
      // Put files in cache
      expect(cacachePutSpy).toHaveBeenCalledTimes(countAssets);

      cacache.get.mockClear();
      cacache.put.mockClear();

      const newStats = await compile(compiler);

      expect(readsAssets(compiler, newStats)).toMatchSnapshot('assets');
      expect(getErrors(stats)).toMatchSnapshot('errors');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');

      const newCountAssets = Object.keys(newStats.compilation.assets).length;

      // Now we have cached files so we get them and don't put new
      expect(cacacheGetSpy).toHaveBeenCalledTimes(newCountAssets);
      expect(cacachePutSpy).toHaveBeenCalledTimes(0);

      cacacheGetSpy.mockRestore();
      cacachePutSpy.mockRestore();
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

      expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
      expect(getErrors(stats)).toMatchSnapshot('errors');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');

      const countAssets = Object.keys(stats.compilation.assets).length;

      // Try to found cached files, but we don't have their in cache
      expect(cacacheGetSpy).toHaveBeenCalledTimes(countAssets);
      // Put files in cache
      expect(cacachePutSpy).toHaveBeenCalledTimes(countAssets);

      cacache.get.mockClear();
      cacache.put.mockClear();

      const newStats = await compile(compiler);

      expect(readsAssets(compiler, newStats)).toMatchSnapshot('assets');
      expect(getErrors(stats)).toMatchSnapshot('errors');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');

      const newCountAssets = Object.keys(newStats.compilation.assets).length;

      // Now we have cached files so we get them and don't put new
      expect(cacacheGetSpy).toHaveBeenCalledTimes(newCountAssets);
      expect(cacachePutSpy).toHaveBeenCalledTimes(0);

      cacacheGetSpy.mockRestore();
      cacachePutSpy.mockRestore();
    });

    it('should match snapshot for errors into the "cacheKeys" option', async () => {
      new TerserPlugin({
        cache: true,
        cacheKeys: () => {
          throw new Error('message');
        },
      }).apply(compiler);

      const stats = await compile(compiler);

      expect(getErrors(stats)).toMatchSnapshot('errors');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');
    });

    it('should match snapshot and invalid cache when entry point was renamed', async () => {
      const cacacheGetSpy = jest.spyOn(cacache, 'get');
      const cacachePutSpy = jest.spyOn(cacache, 'put');

      const getCacheDirectorySpy = jest
        .spyOn(Webpack4Cache, 'getCacheDirectory')
        .mockImplementation(() => {
          return otherOtherOtherCacheDir;
        });

      new TerserPlugin({ cache: true }).apply(compiler);

      const stats = await compile(compiler);

      expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
      expect(getErrors(stats)).toMatchSnapshot('errors');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');

      const countAssets = Object.keys(stats.compilation.assets).length;

      // Try to found cached files, but we don't have their in cache
      expect(cacacheGetSpy).toHaveBeenCalledTimes(countAssets);
      // Put files in cache
      expect(cacachePutSpy).toHaveBeenCalledTimes(countAssets);

      cacache.get.mockClear();
      cacache.put.mockClear();

      compiler = getCompiler({
        entry: {
          onne: `${__dirname}/fixtures/cache.js`,
          two: `${__dirname}/fixtures/cache-1.js`,
          three: `${__dirname}/fixtures/cache-2.js`,
          four: `${__dirname}/fixtures/cache-3.js`,
          five: `${__dirname}/fixtures/cache-4.js`,
        },
      });

      new TerserPlugin({ cache: true }).apply(compiler);

      const newStats = await compile(compiler);

      expect(readsAssets(compiler, newStats)).toMatchSnapshot('assets');
      expect(getErrors(stats)).toMatchSnapshot('errors');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');

      const newCountAssets = Object.keys(newStats.compilation.assets).length;

      // Now we have cached files so we get them and don't put new
      expect(cacacheGetSpy).toHaveBeenCalledTimes(newCountAssets);
      expect(cacachePutSpy).toHaveBeenCalledTimes(1);

      cacacheGetSpy.mockRestore();
      cacachePutSpy.mockRestore();
      getCacheDirectorySpy.mockRestore();
    });
  });
} else {
  test.skip('skip it', () => {});
}
