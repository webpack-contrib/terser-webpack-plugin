import path from 'path';
import os from 'os';

import { SourceMapConsumer } from 'source-map';
import { SourceMapDevToolPlugin } from 'webpack';

import { validate } from 'schema-utils';
import serialize from 'serialize-javascript';
import terserPackageJson from 'terser/package.json';
import pLimit from 'p-limit';
import Worker from 'jest-worker';

import schema from './options.json';
import CacheEngine from './Webpack5Cache';
import { minify as minifyFn } from './minify';

class TerserPlugin {
  constructor(options = {}) {
    validate(schema, options, {
      name: 'Terser Plugin',
      baseDataPath: 'options',
    });

    const {
      minify,
      terserOptions = {},
      test = /\.[cm]?js(\?.*)?$/i,
      extractComments = true,
      sourceMap,
      cache = true,
      cacheKeys = (defaultCacheKeys) => defaultCacheKeys,
      parallel = true,
      include,
      exclude,
    } = options;

    this.options = {
      test,
      extractComments,
      sourceMap,
      cache,
      cacheKeys,
      parallel,
      include,
      exclude,
      minify,
      terserOptions,
    };
  }

  static isSourceMap(input) {
    // All required options for `new SourceMapConsumer(...options)`
    // https://github.com/mozilla/source-map#new-sourcemapconsumerrawsourcemap
    return Boolean(
      input &&
        input.version &&
        input.sources &&
        Array.isArray(input.sources) &&
        typeof input.mappings === 'string'
    );
  }

  static buildError(error, file, sourceMap, requestShortener) {
    if (error.line) {
      const original =
        sourceMap &&
        sourceMap.originalPositionFor({
          line: error.line,
          column: error.col,
        });

      if (original && original.source && requestShortener) {
        return new Error(
          `${file} from Terser\n${error.message} [${requestShortener.shorten(
            original.source
          )}:${original.line},${original.column}][${file}:${error.line},${
            error.col
          }]${
            error.stack
              ? `\n${error.stack.split('\n').slice(1).join('\n')}`
              : ''
          }`
        );
      }

      return new Error(
        `${file} from Terser\n${error.message} [${file}:${error.line},${
          error.col
        }]${
          error.stack ? `\n${error.stack.split('\n').slice(1).join('\n')}` : ''
        }`
      );
    }

    if (error.stack) {
      return new Error(`${file} from Terser\n${error.stack}`);
    }

    return new Error(`${file} from Terser\n${error.message}`);
  }

  static getAvailableNumberOfCores(parallel) {
    // In some cases cpus() returns undefined
    // https://github.com/nodejs/node/issues/19022
    const cpus = os.cpus() || { length: 1 };

    return parallel === true
      ? cpus.length - 1
      : Math.min(Number(parallel) || 0, cpus.length - 1);
  }

  async optimize(compiler, compilation, assets) {
    const assetNames = Object.keys(assets).filter((assetName) =>
      compiler.webpack.ModuleFilenameHelpers.matchObject.bind(
        // eslint-disable-next-line no-undefined
        undefined,
        this.options
      )(assetName)
    );

    if (assetNames.length === 0) {
      return;
    }

    const availableNumberOfCores = TerserPlugin.getAvailableNumberOfCores(
      this.options.parallel
    );

    let concurrency = Infinity;
    let worker;

    if (availableNumberOfCores > 0) {
      // Do not create unnecessary workers when the number of files is less than the available cores, it saves memory
      const numWorkers = Math.min(assetNames.length, availableNumberOfCores);

      concurrency = numWorkers;

      worker = new Worker(require.resolve('./minify'), { numWorkers });

      // https://github.com/facebook/jest/issues/8872#issuecomment-524822081
      const workerStdout = worker.getStdout();

      if (workerStdout) {
        workerStdout.on('data', (chunk) => {
          return process.stdout.write(chunk);
        });
      }

      const workerStderr = worker.getStderr();

      if (workerStderr) {
        workerStderr.on('data', (chunk) => {
          return process.stderr.write(chunk);
        });
      }
    }

    const limit = pLimit(concurrency);
    const {
      SourceMapSource,
      ConcatSource,
      RawSource,
    } = compiler.webpack.sources;
    const cache = compilation.getCache('TerserWebpackPlugin');
    const cacheEngine = new CacheEngine();
    const allExtractedComments = new Map();
    const scheduledTasks = [];

    for (const name of assetNames) {
      scheduledTasks.push(
        limit(async () => {
          const { info, source: inputSource } = compilation.getAsset(name);

          // Skip double minimize assets from child compilation
          if (info.minimized) {
            return;
          }

          let input;
          let inputSourceMap;

          // TODO refactor after drop webpack@4, webpack@5 always has `sourceAndMap` on sources
          if (this.options.sourceMap && inputSource.sourceAndMap) {
            const { source, map } = inputSource.sourceAndMap();

            input = source;

            if (map) {
              if (TerserPlugin.isSourceMap(map)) {
                inputSourceMap = map;
              } else {
                inputSourceMap = map;

                compilation.warnings.push(
                  new Error(`${name} contains invalid source map`)
                );
              }
            }
          } else {
            input = inputSource.source();
            inputSourceMap = null;
          }

          if (Buffer.isBuffer(input)) {
            input = input.toString();
          }

          const cacheData = { name, inputSource };

          let output = await cacheEngine.get(cache, cacheData);

          if (!output) {
            const minimizerOptions = {
              name,
              input,
              inputSourceMap,
              minify: this.options.minify,
              minimizerOptions: this.options.terserOptions,
              extractComments: this.options.extractComments,
            };

            if (/\.mjs(\?.*)?$/i.test(name)) {
              this.options.terserOptions.module = true;
            }

            try {
              output = await (worker
                ? worker.transform(serialize(minimizerOptions))
                : minifyFn(minimizerOptions));
            } catch (error) {
              compilation.errors.push(
                TerserPlugin.buildError(
                  error,
                  name,
                  inputSourceMap && TerserPlugin.isSourceMap(inputSourceMap)
                    ? new SourceMapConsumer(inputSourceMap)
                    : null,
                  compilation.requestShortener
                )
              );

              return;
            }

            let shebang;

            if (
              this.options.extractComments.banner !== false &&
              output.extractedComments &&
              output.extractedComments.length > 0 &&
              output.code.startsWith('#!')
            ) {
              const firstNewlinePosition = output.code.indexOf('\n');

              shebang = output.code.substring(0, firstNewlinePosition);
              output.code = output.code.substring(firstNewlinePosition + 1);
            }

            if (output.map) {
              output.source = new SourceMapSource(
                output.code,
                name,
                output.map,
                input,
                inputSourceMap,
                true
              );
            } else {
              output.source = new RawSource(output.code);
            }

            let commentsFilename;

            if (
              output.extractedComments &&
              output.extractedComments.length > 0
            ) {
              commentsFilename =
                this.options.extractComments.filename ||
                '[file].LICENSE.txt[query]';

              let query = '';
              let filename = name;

              const querySplit = filename.indexOf('?');

              if (querySplit >= 0) {
                query = filename.substr(querySplit);
                filename = filename.substr(0, querySplit);
              }

              const lastSlashIndex = filename.lastIndexOf('/');
              const basename =
                lastSlashIndex === -1
                  ? filename
                  : filename.substr(lastSlashIndex + 1);
              const data = { filename, basename, query };

              commentsFilename = compilation.getPath(commentsFilename, data);

              output.commentsFilename = commentsFilename;

              let banner;

              // Add a banner to the original file
              if (this.options.extractComments.banner !== false) {
                banner =
                  this.options.extractComments.banner ||
                  `For license information please see ${path
                    .relative(path.dirname(name), commentsFilename)
                    .replace(/\\/g, '/')}`;

                if (typeof banner === 'function') {
                  banner = banner(commentsFilename);
                }

                if (banner) {
                  output.source = new ConcatSource(
                    shebang ? `${shebang}\n` : '',
                    `/*! ${banner} */\n`,
                    output.source
                  );
                  output.banner = banner;
                  output.shebang = shebang;
                }
              }

              const extractedCommentsString = output.extractedComments
                .sort()
                .join('\n\n');

              output.extractedCommentsSource = new RawSource(
                `${extractedCommentsString}\n`
              );
            }

            await cacheEngine.store(cache, { ...output, ...cacheData });
          }

          // TODO `...` required only for webpack@4
          const newInfo = { ...info, minimized: true };
          const { source, extractedCommentsSource } = output;

          // Write extracted comments to commentsFilename
          if (extractedCommentsSource) {
            const { commentsFilename } = output;

            // TODO `...` required only for webpack@4
            newInfo.related = { license: commentsFilename, ...info.related };

            allExtractedComments.set(name, {
              extractedCommentsSource,
              commentsFilename,
            });
          }

          compilation.updateAsset(name, source, newInfo);
        })
      );
    }

    await Promise.all(scheduledTasks);

    if (worker) {
      await worker.end();
    }

    await Array.from(allExtractedComments)
      .sort()
      .reduce(async (previousPromise, [from, value]) => {
        const previous = await previousPromise;
        const { commentsFilename, extractedCommentsSource } = value;

        if (previous && previous.commentsFilename === commentsFilename) {
          const { from: previousFrom, source: prevSource } = previous;
          const mergedName = `${previousFrom}|${from}`;

          const cacheData = {
            target: 'comments',
          };

          const mergedInputSource = [prevSource, extractedCommentsSource];

          cacheData.name = `${commentsFilename}|${mergedName}`;
          cacheData.inputSource = mergedInputSource;

          let output = await cacheEngine.get(cache, cacheData);

          if (!output) {
            output = new ConcatSource(
              Array.from(
                new Set([
                  ...prevSource.source().split('\n\n'),
                  ...extractedCommentsSource.source().split('\n\n'),
                ])
              ).join('\n\n')
            );

            await cacheEngine.store(cache, { ...cacheData, output });
          }

          compilation.updateAsset(commentsFilename, output);

          return { commentsFilename, from: mergedName, source: output };
        }

        const existingAsset = compilation.getAsset(commentsFilename);

        if (existingAsset) {
          return {
            commentsFilename,
            from: commentsFilename,
            source: existingAsset.source,
          };
        }

        compilation.emitAsset(commentsFilename, extractedCommentsSource);

        return { commentsFilename, from, source: extractedCommentsSource };
      }, Promise.resolve());
  }

  static getEcmaVersion(environment) {
    // ES 6th
    if (
      environment.arrowFunction ||
      environment.const ||
      environment.destructuring ||
      environment.forOf ||
      environment.module
    ) {
      return 2015;
    }

    // ES 11th
    if (environment.bigIntLiteral || environment.dynamicImport) {
      return 2020;
    }

    return 5;
  }

  apply(compiler) {
    const { devtool, output, plugins } = compiler.options;

    this.options.sourceMap =
      typeof this.options.sourceMap === 'undefined'
        ? (devtool &&
            !devtool.includes('eval') &&
            !devtool.includes('cheap') &&
            (devtool.includes('source-map') ||
              // Todo remove when `webpack@4` support will be dropped
              devtool.includes('sourcemap'))) ||
          (plugins &&
            plugins.some(
              (plugin) =>
                plugin instanceof SourceMapDevToolPlugin &&
                plugin.options &&
                plugin.options.columns
            ))
        : Boolean(this.options.sourceMap);

    if (
      typeof this.options.terserOptions.module === 'undefined' &&
      typeof output.module !== 'undefined'
    ) {
      this.options.terserOptions.module = output.module;
    }

    if (typeof this.options.terserOptions.ecma === 'undefined') {
      this.options.terserOptions.ecma = TerserPlugin.getEcmaVersion(
        output.environment || {}
      );
    }

    const pluginName = this.constructor.name;

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      if (this.options.sourceMap) {
        compilation.hooks.buildModule.tap(pluginName, (moduleArg) => {
          // to get detailed location info about errors
          // eslint-disable-next-line no-param-reassign
          moduleArg.useSourceMap = true;
        });
      }

      const hooks = compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
        compilation
      );
      const data = serialize({
        terser: terserPackageJson.version,
        terserOptions: this.options.terserOptions,
      });

      hooks.chunkHash.tap(pluginName, (chunk, hash) => {
        hash.update('TerserPlugin');
        hash.update(data);
      });

      compilation.hooks.processAssets.tapPromise(
        {
          name: pluginName,
          stage:
            compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
        },
        (assets) => this.optimize(compiler, compilation, assets)
      );

      compilation.hooks.statsPrinter.tap(pluginName, (stats) => {
        stats.hooks.print
          .for('asset.info.minimized')
          .tap('terser-webpack-plugin', (minimized, { green, formatFlag }) =>
            // eslint-disable-next-line no-undefined
            minimized ? green(formatFlag('minimized')) : undefined
          );
      });
    });
  }
}

export default TerserPlugin;
