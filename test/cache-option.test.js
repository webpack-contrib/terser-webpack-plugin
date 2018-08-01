import path from 'path';

import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';

import TerserPlugin from '../src/index';

import { createCompiler, compile, cleanErrorStack } from './helpers';

const cacheDir = findCacheDir({ name: 'terser-webpack-plugin' });
const otherCacheDir = findCacheDir({ name: 'other-cache-directory' });

describe('when applied with `cache` option', () => {
  let compiler;

  beforeEach(() => {
    compiler = createCompiler({
      entry: {
        one: `${__dirname}/fixtures/entry.js`,
        two: `${__dirname}/fixtures/entry.js`,
        three: `${__dirname}/fixtures/entry.js`,
        four: `${__dirname}/fixtures/entry.js`,
      },
    });

    return Promise.all([
      cacache.rm.all(cacheDir),
      cacache.rm.all(otherCacheDir),
    ]);
  });

  afterEach(() =>
    Promise.all([cacache.rm.all(cacheDir), cacache.rm.all(otherCacheDir)]));

  it('matches snapshot for `false` value', () => {
    new TerserPlugin({ cache: false }).apply(compiler);

    cacache.get = jest.fn(cacache.get);
    cacache.put = jest.fn(cacache.put);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (
          Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
        ) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }

      // Cache disabled so we don't run `get` or `put`
      expect(cacache.get.mock.calls.length).toBe(0);
      expect(cacache.put.mock.calls.length).toBe(0);

      return Promise.resolve()
        .then(() => cacache.ls(cacheDir))
        .then((cacheEntriesList) => {
          const cacheKeys = Object.keys(cacheEntriesList);

          expect(cacheKeys.length).toBe(0);
        });
    });
  });

  it('matches snapshot for `true` value', () => {
    new TerserPlugin({ cache: true }).apply(compiler);

    cacache.get = jest.fn(cacache.get);
    cacache.put = jest.fn(cacache.put);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (
          Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
        ) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }

      const countAssets = Object.keys(stats.compilation.assets).length;

      // Try to found cached files, but we don't have their in cache
      expect(cacache.get.mock.calls.length).toBe(countAssets);
      // Put files in cache
      expect(cacache.put.mock.calls.length).toBe(countAssets);

      return (
        Promise.resolve()
          .then(() => cacache.ls(cacheDir))
          .then((cacheEntriesList) => {
            const cacheKeys = Object.keys(cacheEntriesList);

            // Make sure that we cached files
            expect(cacheKeys.length).toBe(countAssets);

            cacheKeys.forEach((cacheEntry) => {
              // eslint-disable-next-line no-new-func
              const cacheEntryOptions = new Function(
                `'use strict'\nreturn ${cacheEntry}`
              )();
              const basename = path.basename(cacheEntryOptions.path);

              expect([basename, cacheEntryOptions.hash]).toMatchSnapshot(
                basename
              );
            });

            cacache.get.mockClear();
            cacache.put.mockClear();
          })
          // Run second compilation to ensure cached files will be taken from cache
          .then(() => compile(compiler))
          .then((newStats) => {
            const newErrors = newStats.compilation.errors.map(cleanErrorStack);
            const newWarnings = newStats.compilation.warnings.map(
              cleanErrorStack
            );

            expect(newErrors).toMatchSnapshot('errors');
            expect(newWarnings).toMatchSnapshot('warnings');

            for (const file in newStats.compilation.assets) {
              if (
                Object.prototype.hasOwnProperty.call(
                  newStats.compilation.assets,
                  file
                )
              ) {
                expect(
                  newStats.compilation.assets[file].source()
                ).toMatchSnapshot(file);
              }
            }

            const newCountAssets = Object.keys(newStats.compilation.assets)
              .length;

            // Now we have cached files so we get their and don't put
            expect(cacache.get.mock.calls.length).toBe(newCountAssets);
            expect(cacache.put.mock.calls.length).toBe(0);
          })
      );
    });
  });

  it('matches snapshot for `other-cache-directory` value (string)', () => {
    new TerserPlugin({ cache: otherCacheDir }).apply(compiler);

    cacache.get = jest.fn(cacache.get);
    cacache.put = jest.fn(cacache.put);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (
          Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
        ) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }

      const countAssets = Object.keys(stats.compilation.assets).length;

      // Try to found cached files, but we don't have their in cache
      expect(cacache.get.mock.calls.length).toBe(countAssets);
      // Put files in cache
      expect(cacache.put.mock.calls.length).toBe(countAssets);

      return (
        Promise.resolve()
          .then(() => cacache.ls(otherCacheDir))
          .then((cacheEntriesList) => {
            const cacheKeys = Object.keys(cacheEntriesList);

            // Make sure that we cached files
            expect(cacheKeys.length).toBe(countAssets);

            cacheKeys.forEach((cacheEntry) => {
              // eslint-disable-next-line no-new-func
              const cacheEntryOptions = new Function(
                `'use strict'\nreturn ${cacheEntry}`
              )();
              const basename = path.basename(cacheEntryOptions.path);

              expect([basename, cacheEntryOptions.hash]).toMatchSnapshot(
                basename
              );
            });

            cacache.get.mockClear();
            cacache.put.mockClear();
          })
          // Run second compilation to ensure cached files will be taken from cache
          .then(() => compile(compiler))
          .then((newStats) => {
            const newErrors = newStats.compilation.errors.map(cleanErrorStack);
            const newWarnings = newStats.compilation.warnings.map(
              cleanErrorStack
            );

            expect(newErrors).toMatchSnapshot('errors');
            expect(newWarnings).toMatchSnapshot('warnings');

            for (const file in newStats.compilation.assets) {
              if (
                Object.prototype.hasOwnProperty.call(
                  newStats.compilation.assets,
                  file
                )
              ) {
                expect(
                  newStats.compilation.assets[file].source()
                ).toMatchSnapshot(file);
              }
            }

            const newCountAssets = Object.keys(newStats.compilation.assets)
              .length;

            // Now we have cached files so we get their and don't put
            expect(cacache.get.mock.calls.length).toBe(newCountAssets);
            expect(cacache.put.mock.calls.length).toBe(0);
          })
      );
    });
  });

  it('matches snapshot for `true` value and `cacheKey` is custom `function`', () => {
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

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (
          Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
        ) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }

      const countAssets = Object.keys(stats.compilation.assets).length;

      // Try to found cached files, but we don't have their in cache
      expect(cacache.get.mock.calls.length).toBe(countAssets);
      // Put files in cache
      expect(cacache.put.mock.calls.length).toBe(countAssets);

      return (
        Promise.resolve()
          .then(() => cacache.ls(cacheDir))
          .then((cacheEntriesList) => {
            const cacheKeys = Object.keys(cacheEntriesList);

            // Make sure that we cached files
            expect(cacheKeys.length).toBe(countAssets);

            cacheKeys.forEach((cacheEntry) => {
              // eslint-disable-next-line no-new-func
              const cacheEntryOptions = new Function(
                `'use strict'\nreturn ${cacheEntry}`
              )();
              const basename = path.basename(cacheEntryOptions.path);

              expect(cacheEntryOptions.myCacheKey).toBe(1);
              expect(cacheEntryOptions.myCacheKeyBasedOnFile).toMatch(
                /file-(.+)?\.js/
              );
              expect([basename, cacheEntryOptions.hash]).toMatchSnapshot(
                basename
              );
            });

            cacache.get.mockClear();
            cacache.put.mockClear();
          })
          // Run second compilation to ensure cached files will be taken from cache
          .then(() => compile(compiler))
          .then((newStats) => {
            const newErrors = newStats.compilation.errors.map(cleanErrorStack);
            const newWarnings = newStats.compilation.warnings.map(
              cleanErrorStack
            );

            expect(newErrors).toMatchSnapshot('errors');
            expect(newWarnings).toMatchSnapshot('warnings');

            for (const file in newStats.compilation.assets) {
              if (
                Object.prototype.hasOwnProperty.call(
                  newStats.compilation.assets,
                  file
                )
              ) {
                expect(
                  newStats.compilation.assets[file].source()
                ).toMatchSnapshot(file);
              }
            }

            const newCountAssets = Object.keys(newStats.compilation.assets)
              .length;

            // Now we have cached files so we get their and don't put
            expect(cacache.get.mock.calls.length).toBe(newCountAssets);
            expect(cacache.put.mock.calls.length).toBe(0);
          })
      );
    });
  });

  it('matches snapshot for errors into `cacheKeys` option', () => {
    new TerserPlugin({
      cache: true,
      cacheKeys: () => {
        throw new Error('message');
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

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
