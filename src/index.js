import crypto from 'crypto';
import path from 'path';

import { SourceMapConsumer } from 'source-map';
import { SourceMapSource, RawSource, ConcatSource } from 'webpack-sources';
import RequestShortener from 'webpack/lib/RequestShortener';
import { ModuleFilenameHelpers } from 'webpack';
import validateOptions from 'schema-utils';
import serialize from 'serialize-javascript';
import terserPackageJson from 'terser/package.json';

import schema from './options.json';
import TaskRunner from './TaskRunner';

const warningRegex = /\[.+:([0-9]+),([0-9]+)\]/;

class TerserPlugin {
  constructor(options = {}) {
    validateOptions(schema, options, {
      name: 'Terser Plugin',
      baseDataPath: 'options',
    });

    const {
      minify,
      terserOptions = {},
      test = /\.m?js(\?.*)?$/i,
      chunkFilter = () => true,
      warningsFilter = () => true,
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
      chunkFilter,
      warningsFilter,
      extractComments,
      sourceMap,
      cache,
      cacheKeys,
      parallel,
      include,
      exclude,
      minify,
      terserOptions: {
        output: {
          comments: extractComments
            ? false
            : /^\**!|@preserve|@license|@cc_on/i,
        },
        ...terserOptions,
      },
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

  static buildSourceMap(inputSourceMap) {
    if (!inputSourceMap || !TerserPlugin.isSourceMap(inputSourceMap)) {
      return null;
    }

    return new SourceMapConsumer(inputSourceMap);
  }

  static buildError(error, file, sourceMap, requestShortener) {
    // Handling error which should have line, col, filename and message
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
          }]`
        );
      }

      return new Error(
        `${file} from Terser\n${error.message} [${file}:${error.line},${error.col}]`
      );
    } else if (error.stack) {
      return new Error(`${file} from Terser\n${error.stack}`);
    }

    return new Error(`${file} from Terser\n${error.message}`);
  }

  static buildWarning(
    warning,
    file,
    sourceMap,
    requestShortener,
    warningsFilter
  ) {
    let warningMessage = warning;
    let locationMessage = '';
    let source = null;

    if (sourceMap) {
      const match = warningRegex.exec(warning);

      if (match) {
        const line = +match[1];
        const column = +match[2];
        const original = sourceMap.originalPositionFor({
          line,
          column,
        });

        if (
          original &&
          original.source &&
          original.source !== file &&
          requestShortener
        ) {
          ({ source } = original);
          warningMessage = `${warningMessage.replace(warningRegex, '')}`;

          locationMessage = `[${requestShortener.shorten(original.source)}:${
            original.line
          },${original.column}]`;
        }
      }
    }

    if (warningsFilter && !warningsFilter(warning, source)) {
      return null;
    }

    return `Terser Plugin: ${warningMessage}${locationMessage}`;
  }

  static removeQueryString(filename) {
    let targetFilename = filename;

    const queryStringIdx = targetFilename.indexOf('?');

    if (queryStringIdx >= 0) {
      targetFilename = targetFilename.substr(0, queryStringIdx);
    }

    return targetFilename;
  }

  static hasAsset(commentFilename, assets) {
    const assetFilenames = Object.keys(assets).map((assetFilename) =>
      TerserPlugin.removeQueryString(assetFilename)
    );

    return assetFilenames.includes(
      TerserPlugin.removeQueryString(commentFilename)
    );
  }

  apply(compiler) {
    this.options.sourceMap =
      typeof this.options.sourceMap === 'undefined'
        ? compiler.options.devtool &&
          /^((inline|hidden|nosources)-)?source-?map/.test(
            compiler.options.devtool
          )
        : Boolean(this.options.sourceMap);

    const buildModuleFn = (moduleArg) => {
      // to get detailed location info about errors
      // eslint-disable-next-line no-param-reassign
      moduleArg.useSourceMap = true;
    };

    const optimizeFn = async (compilation, chunks) => {
      const processedAssets = new WeakSet();
      const tasks = [];

      const { chunkFilter } = this.options;

      Array.from(chunks)
        .filter((chunk) => chunkFilter && chunkFilter(chunk))
        .reduce((acc, chunk) => acc.concat(Array.from(chunk.files || [])), [])
        .concat(Array.from(compilation.additionalChunkAssets || []))
        .filter(ModuleFilenameHelpers.matchObject.bind(null, this.options))
        .forEach((file) => {
          let inputSourceMap;

          const asset = compilation.assets[file];

          if (processedAssets.has(asset)) {
            return;
          }

          try {
            let input;

            if (this.options.sourceMap && asset.sourceAndMap) {
              const { source, map } = asset.sourceAndMap();

              input = source;

              if (TerserPlugin.isSourceMap(map)) {
                inputSourceMap = map;
              } else {
                inputSourceMap = map;

                compilation.warnings.push(
                  new Error(`${file} contains invalid source map`)
                );
              }
            } else {
              input = asset.source();
              inputSourceMap = null;
            }

            // Handling comment extraction
            let commentsFilename = false;

            if (this.options.extractComments) {
              commentsFilename =
                this.options.extractComments.filename ||
                '[file].LICENSE[query]';

              // Todo remove this in next major release
              if (typeof commentsFilename === 'function') {
                commentsFilename = commentsFilename.bind(null, file);
              }

              let query = '';
              let filename = file;

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
            }

            if (
              commentsFilename &&
              TerserPlugin.hasAsset(commentsFilename, compilation.assets)
            ) {
              // Todo make error and stop uglifing in next major release
              compilation.warnings.push(
                new Error(
                  `The comment file "${TerserPlugin.removeQueryString(
                    commentsFilename
                  )}" conflicts with an existing asset, this may lead to code corruption, please use a different name`
                )
              );
            }

            const task = {
              file,
              input,
              inputSourceMap,
              commentsFilename,
              extractComments: this.options.extractComments,
              terserOptions: this.options.terserOptions,
              minify: this.options.minify,
            };

            if (this.options.cache) {
              const defaultCacheKeys = {
                terser: terserPackageJson.version,
                node_version: process.version,
                // eslint-disable-next-line global-require
                'terser-webpack-plugin': require('../package.json').version,
                'terser-webpack-plugin-options': this.options,
                hash: crypto
                  .createHash('md4')
                  .update(input)
                  .digest('hex'),
              };

              task.cacheKeys = this.options.cacheKeys(defaultCacheKeys, file);
            }

            tasks.push(task);
          } catch (error) {
            compilation.errors.push(
              TerserPlugin.buildError(
                error,
                file,
                TerserPlugin.buildSourceMap(inputSourceMap),
                new RequestShortener(compiler.context)
              )
            );
          }
        });

      if (tasks.length === 0) {
        return Promise.resolve();
      }

      const taskRunner = new TaskRunner({
        cache: this.options.cache,
        parallel: this.options.parallel,
      });

      const completedTasks = await taskRunner.run(tasks);

      await taskRunner.exit();

      completedTasks.forEach((completedTask, index) => {
        const { file, input, inputSourceMap, commentsFilename } = tasks[index];
        const { error, map, code, warnings } = completedTask;
        let { extractedComments } = completedTask;

        let sourceMap = null;

        if (error || (warnings && warnings.length > 0)) {
          sourceMap = TerserPlugin.buildSourceMap(inputSourceMap);
        }

        // Handling results
        // Error case: add errors, and go to next file
        if (error) {
          compilation.errors.push(
            TerserPlugin.buildError(
              error,
              file,
              sourceMap,
              new RequestShortener(compiler.context)
            )
          );

          return;
        }

        let outputSource;

        if (map) {
          outputSource = new SourceMapSource(
            code,
            file,
            JSON.parse(map),
            input,
            inputSourceMap,
            true
          );
        } else {
          outputSource = new RawSource(code);
        }

        // Write extracted comments to commentsFilename
        if (
          commentsFilename &&
          extractedComments &&
          extractedComments.length > 0
        ) {
          if (commentsFilename in compilation.assets) {
            const commentsFileSource = compilation.assets[
              commentsFilename
            ].source();

            extractedComments = extractedComments.filter(
              (comment) => !commentsFileSource.includes(comment)
            );
          }

          if (extractedComments.length > 0) {
            // Add a banner to the original file
            if (this.options.extractComments.banner !== false) {
              let banner =
                this.options.extractComments.banner ||
                `For license information please see ${path.posix.basename(
                  commentsFilename
                )}`;

              if (typeof banner === 'function') {
                banner = banner(commentsFilename);
              }

              if (banner) {
                outputSource = new ConcatSource(
                  `/*! ${banner} */\n`,
                  outputSource
                );
              }
            }

            const commentsSource = new RawSource(
              `${extractedComments.join('\n\n')}\n`
            );

            if (commentsFilename in compilation.assets) {
              // commentsFile already exists, append new comments...
              if (
                compilation.assets[commentsFilename] instanceof ConcatSource
              ) {
                compilation.assets[commentsFilename].add('\n');
                compilation.assets[commentsFilename].add(commentsSource);
              } else {
                // eslint-disable-next-line no-param-reassign
                compilation.assets[commentsFilename] = new ConcatSource(
                  compilation.assets[commentsFilename],
                  '\n',
                  commentsSource
                );
              }
            } else {
              // eslint-disable-next-line no-param-reassign
              compilation.assets[commentsFilename] = commentsSource;
            }
          }
        }

        // Updating assets
        // eslint-disable-next-line no-param-reassign
        processedAssets.add((compilation.assets[file] = outputSource));

        // Handling warnings
        if (warnings && warnings.length > 0) {
          warnings.forEach((warning) => {
            const builtWarning = TerserPlugin.buildWarning(
              warning,
              file,
              sourceMap,
              new RequestShortener(compiler.context),
              this.options.warningsFilter
            );

            if (builtWarning) {
              compilation.warnings.push(builtWarning);
            }
          });
        }
      });

      return Promise.resolve();
    };

    const plugin = { name: this.constructor.name };

    compiler.hooks.compilation.tap(plugin, (compilation) => {
      if (this.options.sourceMap) {
        compilation.hooks.buildModule.tap(plugin, buildModuleFn);
      }

      const { mainTemplate, chunkTemplate } = compilation;

      // Regenerate `contenthash` for minified assets
      for (const template of [mainTemplate, chunkTemplate]) {
        template.hooks.hashForChunk.tap(plugin, (hash) => {
          const data = serialize({
            terser: terserPackageJson.version,
            terserOptions: this.options.terserOptions,
          });

          hash.update('TerserPlugin');
          hash.update(data);
        });
      }

      compilation.hooks.optimizeChunkAssets.tapPromise(
        plugin,
        optimizeFn.bind(this, compilation)
      );
    });
  }
}

export default TerserPlugin;
