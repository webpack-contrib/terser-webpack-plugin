export default TerserPlugin;
export type Schema = import("schema-utils/declarations/validate").Schema;
export type Compiler = import("webpack").Compiler;
export type Compilation = import("webpack").Compilation;
export type WebpackError = import("webpack").WebpackError;
export type Asset = import("webpack").Asset;
export type TerserECMA = import("terser").ECMA;
export type TerserMinifyOptions = import("terser").MinifyOptions;
export type UglifyJSMinifyOptions = import("uglify-js").MinifyOptions;
export type SwcMinifyOptions = import("@swc/core").JsMinifyOptions;
export type EsbuildMinifyOptions = import("esbuild").TransformOptions;
export type CustomMinifyOptions = any;
export type JestWorker = import("jest-worker").Worker;
export type RawSourceMap = import("source-map").RawSourceMap;
export type Rule = RegExp | string;
export type Rules = Rule[] | Rule;
export type ExtractCommentsFunction = (
  astNode: any,
  comment: {
    value: string;
    type: "comment1" | "comment2" | "comment3" | "comment4";
    pos: number;
    line: number;
    col: number;
  }
) => boolean;
export type ExtractCommentsCondition =
  | boolean
  | "all"
  | "some"
  | RegExp
  | ExtractCommentsFunction;
export type ExtractCommentsFilename = string | ((fileData: any) => string);
export type ExtractCommentsBanner =
  | string
  | boolean
  | ((commentsFile: string) => string);
export type ExtractCommentsObject = {
  condition: ExtractCommentsCondition;
  filename: ExtractCommentsFilename;
  banner: ExtractCommentsBanner;
};
export type ExtractCommentsOptions =
  | ExtractCommentsCondition
  | ExtractCommentsObject;
export type Input = {
  [file: string]: string;
};
export type MinifyResult = {
  code: string;
  map?: import("source-map").RawSourceMap | undefined;
  errors?: (string | Error)[] | undefined;
  warnings?: (string | Error)[] | undefined;
  extractedComments?: string[] | undefined;
};
export type InternalPredefinedMinimizerOptions = {
  module?: boolean | undefined;
  ecma?: 5 | 2020 | 2015 | 2016 | 2017 | 2018 | 2019 | undefined;
};
export type InternalMinifyOptions<T> = {
  name: string;
  input: string;
  inputSourceMap: RawSourceMap | undefined;
  extractComments: ExtractCommentsOptions | undefined;
  minify: MinifyFunction<T>;
  minifyOptions: InternalPredefinedMinimizerOptions & T;
};
export type MinifyWorker<T> = Worker & {
  transform: (options: string) => MinifyResult;
  minify: (options: InternalMinifyOptions<T>) => MinifyResult;
};
export type MinifyFunction<T> = (
  input: Input,
  sourceMap: RawSourceMap | undefined,
  minifyOptions: InternalPredefinedMinimizerOptions & T,
  extractComments: ExtractCommentsOptions | undefined
) => Promise<MinifyResult>;
export type TerserMinifyFunction = MinifyFunction<TerserMinifyOptions>;
export type UglifyJSMinifyFunction = MinifyFunction<UglifyJSMinifyOptions>;
export type SwcMinifyFunction = MinifyFunction<SwcMinifyOptions>;
export type EsbuildMinifyFunction = MinifyFunction<EsbuildMinifyOptions>;
export type CustomMinifyFunction = MinifyFunction<CustomMinifyOptions>;
export type BasePluginOptions = {
  test?: Rules | undefined;
  include?: Rules | undefined;
  exclude?: Rules | undefined;
  extractComments?: ExtractCommentsOptions | undefined;
  parallel?: boolean | undefined;
};
export type ThirdArgument<T> = T extends (
  arg1: any,
  arg2: any,
  arg3: infer U,
  ...args: any[]
) => any
  ? U
  : never;
export type DefaultPluginOptions = {
  terserOptions?: import("terser").MinifyOptions | undefined;
  minify?: undefined;
};
export type PickMinifyOptions<T> = T extends infer Z
  ? ThirdArgument<Z> extends never
    ? any
    : {
        minify?: Z | undefined;
        terserOptions?: ThirdArgument<Z> | undefined;
      }
  : DefaultPluginOptions;
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
/**
 * @template {TerserMinifyFunction | UglifyJSMinifyFunction | SwcMinifyFunction | EsbuildMinifyFunction | CustomMinifyFunction} T =TerserMinifyFunction
 */
declare class TerserPlugin<
  T extends
    | TerserMinifyFunction
    | UglifyJSMinifyFunction
    | SwcMinifyFunction
    | EsbuildMinifyFunction
    | CustomMinifyFunction = TerserMinifyFunction
> {
  /**
   * @private
   * @param {any} input
   * @returns {boolean}
   */
  private static isSourceMap;
  /**
   * @private
   * @param {Error | string} warning
   * @param {string} file
   * @returns {WebpackError}
   */
  private static buildWarning;
  /**
   * @private
   * @param {any} error
   * @param {string} file
   * @param {Compilation["requestShortener"]} [requestShortener]
   * @param {SourceMapConsumer} [sourceMap]
   * @returns {WebpackError}
   */
  private static buildError;
  /**
   * @private
   * @param {boolean | undefined} parallel
   * @returns {number}
   */
  private static getAvailableNumberOfCores;
  /**
   * @private
   * @param {any} environment
   * @returns {TerserECMA}
   */
  private static getEcmaVersion;
  /**
   * @param {BasePluginOptions & PickMinifyOptions<T>} [options]
   */
  constructor(options?: (BasePluginOptions & PickMinifyOptions<T>) | undefined);
  options: {
    test: any;
    extractComments: any;
    parallel: any;
    include: any;
    exclude: any;
    minify: any;
    terserOptions: any;
  };
  /**
   * @private
   * @param {Compiler} compiler
   * @param {Compilation} compilation
   * @param {Record<string, import("webpack").sources.Source>} assets
   * @param {{availableNumberOfCores: number}} optimizeOptions
   * @returns {Promise<void>}
   */
  private optimize;
  /**
   * @param {Compiler} compiler
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace TerserPlugin {
  export { terserMinify };
  export { uglifyJsMinify };
  export { swcMinify };
  export { esbuildMinify };
}
import { Worker } from "jest-worker";
import { terserMinify } from "./utils";
import { uglifyJsMinify } from "./utils";
import { swcMinify } from "./utils";
import { esbuildMinify } from "./utils";
