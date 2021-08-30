import * as path from "path";
import * as os from "os";

import { SourceMapConsumer } from "source-map";
import { validate } from "schema-utils";
import serialize from "serialize-javascript";
import * as terserPackageJson from "terser/package.json";
import pLimit from "p-limit";
import { Worker } from "jest-worker";

import {
  terserMinify,
  uglifyJsMinify,
  swcMinify,
  esbuildMinify,
} from "./utils";

import * as schema from "./options.json";
import { minify as minifyFn } from "./minify";

/** @typedef {import("schema-utils/declarations/validate").Schema} Schema */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("webpack").Compilation} Compilation */
/** @typedef {import("webpack").WebpackError} WebpackError */
/** @typedef {import("webpack").Asset} Asset */
/** @typedef {import("terser").ECMA} TerserECMA */
/** @typedef {import("terser").MinifyOptions} TerserMinifyOptions */
/** @typedef {import("uglify-js").MinifyOptions} UglifyJSMinifyOptions */
/** @typedef {import("@swc/core").JsMinifyOptions} SwcMinifyOptions */
/** @typedef {import("esbuild").TransformOptions} EsbuildMinifyOptions */
/** @typedef {Object.<any, any>} CustomMinifyOptions */
/** @typedef {import("jest-worker").Worker} JestWorker */
/** @typedef {import("source-map").RawSourceMap} RawSourceMap */

/** @typedef {RegExp | string} Rule */

/** @typedef {Rule[] | Rule} Rules */

/**
 * @callback ExtractCommentsFunction
 * @param {any} astNode
 * @param {{ value: string, type: 'comment1' | 'comment2' | 'comment3' | 'comment4', pos: number, line: number, col: number }} comment
 * @returns {boolean}
 */

/**
 * @typedef {boolean | 'all' | 'some' | RegExp | ExtractCommentsFunction} ExtractCommentsCondition
 */

/**
 * @typedef {string | ((fileData: any) => string)} ExtractCommentsFilename
 */

/**
 * @typedef {boolean | string | ((commentsFile: string) => string)} ExtractCommentsBanner
 */

/**
 * @typedef {Object} ExtractCommentsObject
 * @property {ExtractCommentsCondition} condition
 * @property {ExtractCommentsFilename} filename
 * @property {ExtractCommentsBanner} banner
 */

/**
 * @typedef {ExtractCommentsCondition | ExtractCommentsObject} ExtractCommentsOptions
 */

/**
 * @typedef {{ [file: string]: string }} Input
 */

/**
 * @typedef {Object} MinifyResult
 * @property {string} code
 * @property {RawSourceMap} [map]
 * @property {Array<Error | string>} [errors]
 * @property {Array<Error | string>} [warnings]
 * @property {Array<string>} [extractedComments]
 */

/**
 * @typedef {Object} InternalPredefinedMinimizerOptions
 * @property {boolean} [module]
 * @property {5 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020} [ecma]
 */

/**
 * @template T
 * @typedef {Object} InternalMinifyOptions
 * @property {string} name
 * @property {string} input
 * @property {RawSourceMap | undefined} inputSourceMap
 * @property {ExtractCommentsOptions | undefined} extractComments
 * @property {MinifyFunction<T>} minify
 * @property {InternalPredefinedMinimizerOptions & T} minifyOptions
 */

/**
 * @template T
 * @typedef {JestWorker & { transform: (options: string) => MinifyResult, minify: (options: InternalMinifyOptions<T>) => MinifyResult }} MinifyWorker
 */

/**
 * @template T
 * @callback MinifyFunction
 * @param {Input} input
 * @param {RawSourceMap | undefined} sourceMap
 * @param {InternalPredefinedMinimizerOptions & T} minifyOptions
 * @param {ExtractCommentsOptions | undefined} extractComments
 * @returns {Promise<MinifyResult>}
 */

/**
 * @typedef {MinifyFunction<TerserMinifyOptions>} TerserMinifyFunction
 */

/**
 * @typedef {MinifyFunction<UglifyJSMinifyOptions>} UglifyJSMinifyFunction
 */

/**
 * @typedef {MinifyFunction<SwcMinifyOptions>} SwcMinifyFunction
 */

/**
 * @typedef {MinifyFunction<EsbuildMinifyOptions>} EsbuildMinifyFunction
 */

/**
 * @typedef {MinifyFunction<CustomMinifyOptions>} CustomMinifyFunction
 */

/**
 * @typedef {Object} BasePluginOptions
 * @property {Rules} [test]
 * @property {Rules} [include]
 * @property {Rules} [exclude]
 * @property {ExtractCommentsOptions} [extractComments]
 * @property {boolean} [parallel]
 */

/**
 * @template T
 * @typedef {T extends (arg1: any, arg2: any, arg3: infer U, ...args: any[]) => any ? U: never} ThirdArgument
 */

/**
 * @typedef {Object} DefaultPluginOptions
 * @property {TerserMinifyOptions} [terserOptions]
 * @property {undefined} [minify]
 */

/**
 * @template T
 * @typedef {T extends infer Z ? ThirdArgument<Z> extends never ? any : { minify?: Z; terserOptions?: ThirdArgument<Z> } : DefaultPluginOptions} PickMinifyOptions
 */

// TODO please add manually `T extends ... = TerserMinifyFunction`, because typescript is not supported default value for templates yet
/**
 * @template {TerserMinifyFunction | UglifyJSMinifyFunction | SwcMinifyFunction | EsbuildMinifyFunction | CustomMinifyFunction} T =TerserMinifyFunction
 */
class TerserPlugin {
  /**
   * @param {BasePluginOptions & PickMinifyOptions<T>} [options]
   */
  constructor(options) {
    validate(/** @type {Schema} */ (schema), options || {}, {
      name: "Terser Plugin",
      baseDataPath: "options",
    });

    const {
      minify = terserMinify,
      terserOptions = {},
      test = /\.[cm]?js(\?.*)?$/i,
      extractComments = true,
      parallel = true,
      include,
      exclude,
    } = options || {};

    this.options = {
      test,
      extractComments,
      parallel,
      include,
      exclude,
      minify,
      terserOptions,
    };
  }

  /**
   * @private
   * @param {any} input
   * @returns {boolean}
   */
  static isSourceMap(input) {
    // All required options for `new SourceMapConsumer(...options)`
    // https://github.com/mozilla/source-map#new-sourcemapconsumerrawsourcemap
    return Boolean(
      input &&
        input.version &&
        input.sources &&
        Array.isArray(input.sources) &&
        typeof input.mappings === "string"
    );
  }

  /**
   * @private
   * @param {Error | string} warning
   * @param {string} file
   * @returns {WebpackError}
   */
  static buildWarning(warning, file) {
    /**
     * @type {Error & { hideStack: true, file: string }}
     */
    // @ts-ignore
    const builtWarning = new Error(warning.toString());

    builtWarning.name = "Warning";
    builtWarning.hideStack = true;
    builtWarning.file = file;

    // @ts-ignore
    return builtWarning;
  }

  /**
   * @private
   * @param {any} error
   * @param {string} file
   * @param {Compilation["requestShortener"]} [requestShortener]
   * @param {SourceMapConsumer} [sourceMap]
   * @returns {WebpackError}
   */
  static buildError(error, file, requestShortener, sourceMap) {
    /**
     * @type {Error & { file: string }}
     */
    // @ts-ignore
    let builtError;

    if (typeof error === "string") {
      // @ts-ignore
      builtError = new Error(`${file} from Terser plugin\n${error}`);
      builtError.file = file;

      // @ts-ignore
      return builtError;
    }

    if (error.line) {
      const original =
        sourceMap &&
        sourceMap.originalPositionFor({
          line: error.line,
          column: error.col,
        });

      if (original && original.source && requestShortener) {
        // @ts-ignore
        builtError = new Error(
          `${file} from Terser plugin\n${
            error.message
          } [${requestShortener.shorten(original.source)}:${original.line},${
            original.column
          }][${file}:${error.line},${error.col}]${
            error.stack
              ? `\n${error.stack.split("\n").slice(1).join("\n")}`
              : ""
          }`
        );
        builtError.file = file;

        // @ts-ignore
        return builtError;
      }

      // @ts-ignore
      builtError = new Error(
        `${file} from Terser plugin\n${error.message} [${file}:${error.line},${
          error.col
        }]${
          error.stack ? `\n${error.stack.split("\n").slice(1).join("\n")}` : ""
        }`
      );
      builtError.file = file;

      // @ts-ignore
      return builtError;
    }

    if (error.stack) {
      // @ts-ignore
      builtError = new Error(
        `${file} from Terser plugin\n${
          typeof error.message !== "undefined" ? error.message : ""
        }\n${error.stack}`
      );
      builtError.file = file;

      // @ts-ignore
      return builtError;
    }

    // @ts-ignore
    builtError = new Error(`${file} from Terser plugin\n${error.message}`);
    builtError.file = file;

    // @ts-ignore
    return builtError;
  }

  /**
   * @private
   * @param {boolean | undefined} parallel
   * @returns {number}
   */
  static getAvailableNumberOfCores(parallel) {
    // In some cases cpus() returns undefined
    // https://github.com/nodejs/node/issues/19022
    const cpus = os.cpus() || { length: 1 };

    return parallel === true
      ? cpus.length - 1
      : Math.min(Number(parallel) || 0, cpus.length - 1);
  }

  /**
   * @private
   * @param {Compiler} compiler
   * @param {Compilation} compilation
   * @param {Record<string, import("webpack").sources.Source>} assets
   * @param {{availableNumberOfCores: number}} optimizeOptions
   * @returns {Promise<void>}
   */
  async optimize(compiler, compilation, assets, optimizeOptions) {
    const cache = compilation.getCache("TerserWebpackPlugin");
    let numberOfAssetsForMinify = 0;
    const assetsForMinify = await Promise.all(
      Object.keys(assets)
        .filter((name) => {
          const { info } = /** @type {Asset} */ (compilation.getAsset(name));

          if (
            // Skip double minimize assets from child compilation
            info.minimized ||
            // Skip minimizing for extracted comments assets
            info.extractedComments
          ) {
            return false;
          }

          if (
            !compiler.webpack.ModuleFilenameHelpers.matchObject.bind(
              // eslint-disable-next-line no-undefined
              undefined,
              this.options
            )(name)
          ) {
            return false;
          }

          return true;
        })
        .map(async (name) => {
          const { info, source } = /** @type {Asset} */ (
            compilation.getAsset(name)
          );

          const eTag = cache.getLazyHashedEtag(source);
          const cacheItem = cache.getItemCache(name, eTag);
          const output = await cacheItem.getPromise();

          if (!output) {
            numberOfAssetsForMinify += 1;
          }

          return { name, info, inputSource: source, output, cacheItem };
        })
    );

    /** @type {undefined | (() => MinifyWorker<T>)} */
    let getWorker;
    /** @type {undefined | MinifyWorker<T>} */
    let initializedWorker;
    /** @type {undefined | number} */
    let numberOfWorkers;

    if (optimizeOptions.availableNumberOfCores > 0) {
      // Do not create unnecessary workers when the number of files is less than the available cores, it saves memory
      numberOfWorkers = Math.min(
        numberOfAssetsForMinify,
        optimizeOptions.availableNumberOfCores
      );
      // eslint-disable-next-line consistent-return
      getWorker = () => {
        if (initializedWorker) {
          return initializedWorker;
        }

        initializedWorker =
          /** @type {MinifyWorker<T>} */
          (
            new Worker(require.resolve("./minify"), {
              numWorkers: numberOfWorkers,
              enableWorkerThreads: true,
            })
          );

        // https://github.com/facebook/jest/issues/8872#issuecomment-524822081
        const workerStdout = initializedWorker.getStdout();

        if (workerStdout) {
          workerStdout.on("data", (chunk) => process.stdout.write(chunk));
        }

        const workerStderr = initializedWorker.getStderr();

        if (workerStderr) {
          workerStderr.on("data", (chunk) => process.stderr.write(chunk));
        }

        return initializedWorker;
      };
    }

    const limit = pLimit(
      getWorker && numberOfAssetsForMinify > 0
        ? /** @type {number} */ (numberOfWorkers)
        : Infinity
    );
    const { SourceMapSource, ConcatSource, RawSource } =
      compiler.webpack.sources;

    /** @typedef {{ extractedCommentsSource : import("webpack").sources.RawSource, commentsFilename: string }} ExtractedCommentsInfo */
    /** @type {Map<string, ExtractedCommentsInfo>} */
    const allExtractedComments = new Map();
    const scheduledTasks = [];

    for (const asset of assetsForMinify) {
      scheduledTasks.push(
        limit(async () => {
          const { name, inputSource, info, cacheItem } = asset;
          let { output } = asset;

          if (!output) {
            let input;
            /** @type {RawSourceMap | undefined} */
            let inputSourceMap;

            const { source: sourceFromInputSource, map } =
              inputSource.sourceAndMap();

            input = sourceFromInputSource;

            if (map) {
              if (TerserPlugin.isSourceMap(map)) {
                inputSourceMap = /** @type {RawSourceMap} */ (map);
              } else {
                inputSourceMap = /** @type {RawSourceMap} */ (map);

                compilation.warnings.push(
                  /** @type {WebpackError} */
                  (new Error(`${name} contains invalid source map`))
                );
              }
            }

            if (Buffer.isBuffer(input)) {
              input = input.toString();
            }

            /** @type {InternalMinifyOptions<T>} */
            const options = {
              name,
              input,
              inputSourceMap,
              minify: this.options.minify,
              minifyOptions: { ...this.options.terserOptions },
              extractComments: this.options.extractComments,
            };

            if (typeof options.minifyOptions.module === "undefined") {
              if (typeof info.javascriptModule !== "undefined") {
                options.minifyOptions.module = info.javascriptModule;
              } else if (/\.mjs(\?.*)?$/i.test(name)) {
                options.minifyOptions.module = true;
              } else if (/\.cjs(\?.*)?$/i.test(name)) {
                options.minifyOptions.module = false;
              }
            }

            if (typeof options.minifyOptions.ecma === "undefined") {
              options.minifyOptions.ecma = TerserPlugin.getEcmaVersion(
                compiler.options.output.environment || {}
              );
            }

            try {
              output = await (getWorker
                ? getWorker().transform(serialize(options))
                : minifyFn(options));
            } catch (error) {
              const hasSourceMap =
                inputSourceMap && TerserPlugin.isSourceMap(inputSourceMap);

              compilation.errors.push(
                /** @type {WebpackError} */
                (
                  TerserPlugin.buildError(
                    error,
                    name,
                    // eslint-disable-next-line no-undefined
                    hasSourceMap ? compilation.requestShortener : undefined,
                    hasSourceMap
                      ? new SourceMapConsumer(
                          /** @type {RawSourceMap} */ (inputSourceMap)
                        )
                      : // eslint-disable-next-line no-undefined
                        undefined
                  )
                )
              );

              return;
            }

            if (typeof output.code === "undefined") {
              compilation.errors.push(
                /** @type {WebpackError} */
                (
                  new Error(
                    `${name} from Terser plugin\nMinimizer doesn't return result`
                  )
                )
              );

              return;
            }

            if (output.warnings && output.warnings.length > 0) {
              output.warnings = output.warnings.map(
                /**
                 * @param {Error | string} item
                 */
                (item) => TerserPlugin.buildWarning(item, name)
              );
            }

            if (output.errors && output.errors.length > 0) {
              const hasSourceMap =
                inputSourceMap && TerserPlugin.isSourceMap(inputSourceMap);

              output.errors = output.errors.map(
                /**
                 * @param {Error | string} item
                 */
                (item) =>
                  TerserPlugin.buildError(
                    item,
                    name,
                    // eslint-disable-next-line no-undefined
                    hasSourceMap ? compilation.requestShortener : undefined,
                    hasSourceMap
                      ? new SourceMapConsumer(
                          /** @type {RawSourceMap} */ (inputSourceMap)
                        )
                      : // eslint-disable-next-line no-undefined
                        undefined
                  )
              );
            }

            let shebang;

            if (
              /** @type {ExtractCommentsObject} */
              (this.options.extractComments).banner !== false &&
              output.extractedComments &&
              output.extractedComments.length > 0 &&
              output.code.startsWith("#!")
            ) {
              const firstNewlinePosition = output.code.indexOf("\n");

              shebang = output.code.substring(0, firstNewlinePosition);
              output.code = output.code.substring(firstNewlinePosition + 1);
            }

            if (output.map) {
              output.source = new SourceMapSource(
                output.code,
                name,
                output.map,
                input,
                /** @type {RawSourceMap} */ (inputSourceMap),
                true
              );
            } else {
              output.source = new RawSource(output.code);
            }

            if (
              output.extractedComments &&
              output.extractedComments.length > 0
            ) {
              const commentsFilename =
                /** @type {ExtractCommentsObject} */
                (this.options.extractComments).filename ||
                "[file].LICENSE.txt[query]";

              let query = "";
              let filename = name;

              const querySplit = filename.indexOf("?");

              if (querySplit >= 0) {
                query = filename.substr(querySplit);
                filename = filename.substr(0, querySplit);
              }

              const lastSlashIndex = filename.lastIndexOf("/");
              const basename =
                lastSlashIndex === -1
                  ? filename
                  : filename.substr(lastSlashIndex + 1);
              const data = { filename, basename, query };

              output.commentsFilename = compilation.getPath(
                commentsFilename,
                data
              );

              let banner;

              // Add a banner to the original file
              if (
                /** @type {ExtractCommentsObject} */
                (this.options.extractComments).banner !== false
              ) {
                banner =
                  /** @type {ExtractCommentsObject} */
                  (this.options.extractComments).banner ||
                  `For license information please see ${path
                    .relative(path.dirname(name), output.commentsFilename)
                    .replace(/\\/g, "/")}`;

                if (typeof banner === "function") {
                  banner = banner(output.commentsFilename);
                }

                if (banner) {
                  output.source = new ConcatSource(
                    shebang ? `${shebang}\n` : "",
                    `/*! ${banner} */\n`,
                    output.source
                  );
                }
              }

              const extractedCommentsString = output.extractedComments
                .sort()
                .join("\n\n");

              output.extractedCommentsSource = new RawSource(
                `${extractedCommentsString}\n`
              );
            }

            await cacheItem.storePromise({
              source: output.source,
              errors: output.errors,
              warnings: output.warnings,
              commentsFilename: output.commentsFilename,
              extractedCommentsSource: output.extractedCommentsSource,
            });
          }

          if (output.warnings && output.warnings.length > 0) {
            output.warnings.forEach(
              /**
               * @param {Error} warning
               */
              (warning) => {
                compilation.warnings.push(
                  /** @type {WebpackError} */ (warning)
                );
              }
            );
          }

          if (output.errors && output.errors.length > 0) {
            output.errors.forEach(
              /**
               * @param {Error & { filename?: string }} error
               */
              (error) => {
                compilation.errors.push(/** @type {WebpackError} */ (error));
              }
            );
          }

          /** @type {Record<string, any>} */
          const newInfo = { minimized: true };
          const { source, extractedCommentsSource } = output;

          // Write extracted comments to commentsFilename
          if (extractedCommentsSource) {
            const { commentsFilename } = output;

            newInfo.related = { license: commentsFilename };

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

    if (initializedWorker) {
      await initializedWorker.end();
    }

    /** @typedef {{ source: import("webpack").sources.Source, commentsFilename: string, from: string }} ExtractedCommentsInfoWIthFrom */
    await Array.from(allExtractedComments)
      .sort()
      .reduce(
        /**
         * @param {Promise<unknown>} previousPromise
         * @param {[string, ExtractedCommentsInfo]} extractedComments
         * @returns {Promise<ExtractedCommentsInfoWIthFrom>}
         */
        async (previousPromise, [from, value]) => {
          const previous =
            /** @type {ExtractedCommentsInfoWIthFrom | undefined} **/ (
              await previousPromise
            );
          const { commentsFilename, extractedCommentsSource } = value;

          if (previous && previous.commentsFilename === commentsFilename) {
            const { from: previousFrom, source: prevSource } = previous;
            const mergedName = `${previousFrom}|${from}`;
            const name = `${commentsFilename}|${mergedName}`;
            const eTag = [prevSource, extractedCommentsSource]
              .map((item) => cache.getLazyHashedEtag(item))
              .reduce((previousValue, currentValue) =>
                cache.mergeEtags(previousValue, currentValue)
              );

            let source = await cache.getPromise(name, eTag);

            if (!source) {
              source = new ConcatSource(
                Array.from(
                  new Set([
                    .../** @type {string}*/ (prevSource.source()).split("\n\n"),
                    .../** @type {string}*/ (
                      extractedCommentsSource.source()
                    ).split("\n\n"),
                  ])
                ).join("\n\n")
              );

              await cache.storePromise(name, eTag, source);
            }

            compilation.updateAsset(commentsFilename, source);

            return { source, commentsFilename, from: mergedName };
          }

          const existingAsset = compilation.getAsset(commentsFilename);

          if (existingAsset) {
            return {
              source: existingAsset.source,
              commentsFilename,
              from: commentsFilename,
            };
          }

          compilation.emitAsset(commentsFilename, extractedCommentsSource, {
            extractedComments: true,
          });

          return { source: extractedCommentsSource, commentsFilename, from };
        },
        /** @type {Promise<unknown>} */ (Promise.resolve())
      );
  }

  /**
   * @private
   * @param {any} environment
   * @returns {TerserECMA}
   */
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

  /**
   * @param {Compiler} compiler
   * @returns {void}
   */
  apply(compiler) {
    const pluginName = this.constructor.name;
    const availableNumberOfCores = TerserPlugin.getAvailableNumberOfCores(
      this.options.parallel
    );

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      const hooks =
        compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
          compilation
        );
      const data = serialize({
        terser: terserPackageJson.version,
        terserOptions: this.options.terserOptions,
      });

      hooks.chunkHash.tap(pluginName, (chunk, hash) => {
        hash.update("TerserPlugin");
        hash.update(data);
      });

      compilation.hooks.processAssets.tapPromise(
        {
          name: pluginName,
          stage:
            compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
          additionalAssets: true,
        },
        (assets) =>
          this.optimize(compiler, compilation, assets, {
            availableNumberOfCores,
          })
      );

      compilation.hooks.statsPrinter.tap(pluginName, (stats) => {
        stats.hooks.print
          .for("asset.info.minimized")
          .tap("terser-webpack-plugin", (minimized, { green, formatFlag }) =>
            minimized
              ? /** @type {Function} */ (green)(
                  /** @type {Function} */ (formatFlag)("minimized")
                )
              : ""
          );
      });
    });
  }
}

TerserPlugin.terserMinify = terserMinify;
TerserPlugin.uglifyJsMinify = uglifyJsMinify;
TerserPlugin.swcMinify = swcMinify;
TerserPlugin.esbuildMinify = esbuildMinify;

export default TerserPlugin;
