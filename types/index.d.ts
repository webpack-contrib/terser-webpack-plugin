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
export type JestWorker = import("jest-worker").Worker;
export type RawSourceMap = import("source-map").RawSourceMap;
export type Rule = RegExp | string;
export type Rules = Rule[] | Rule;
export type MinifyWorker = Worker & {
  transform: (options: string) => MinifyResult;
  minify: (options: InternalMinifyOptions) => MinifyResult;
};
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
export type Input = {
  [file: string]: string;
};
export type CustomMinifyOptions = any;
export type MinifyFunction = (
  input: Input,
  sourceMap: RawSourceMap | undefined,
  minifyOptions: InternalPredefinedMinimizerOptions & CustomMinifyOptions,
  extractComments: ExtractCommentsOptions | undefined
) => Promise<MinifyResult>;
export type ExtractCommentsOptions =
  | ExtractCommentsCondition
  | ExtractCommentsObject;
export type MinimizerOptions =
  | TerserMinifyOptions
  | UglifyJSMinifyOptions
  | SwcMinifyOptions
  | EsbuildMinifyOptions
  | CustomMinifyOptions;
export type InternalPredefinedMinimizerOptions = {
  module?: boolean | undefined;
  ecma?: 5 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | undefined;
};
export type InternalMinifyOptions = {
  name: string;
  input: string;
  inputSourceMap: RawSourceMap | undefined;
  extractComments: ExtractCommentsOptions | undefined;
  minify: MinifyFunction;
  minifyOptions: MinimizerOptions & InternalPredefinedMinimizerOptions;
};
export type MinifyResult = {
  code: string;
  map?: import("source-map").RawSourceMap | undefined;
  errors?: (string | Error)[] | undefined;
  warnings?: (string | Error)[] | undefined;
  extractedComments?: string[] | undefined;
};
export type BasePluginOptions = {
  test?: Rules | undefined;
  include?: Rules | undefined;
  exclude?: Rules | undefined;
  extractComments?: ExtractCommentsOptions | undefined;
  parallel?: boolean | undefined;
};
export type DefaultTerserMinimizeFunctionAndOptions = {
  terserOptions?: import("terser").MinifyOptions | undefined;
  minify?: typeof terserMinify | undefined;
};
export type DefaultPluginOptions = BasePluginOptions &
  DefaultTerserMinimizeFunctionAndOptions;
export type TerserMinimizeFunctionAndOptions = {
  terserOptions?: import("terser").MinifyOptions | undefined;
  minify: typeof terserMinify;
};
export type PluginOptionsForTerser = BasePluginOptions &
  TerserMinimizeFunctionAndOptions;
export type UglifyJSFunctionAndOptions = {
  terserOptions?: import("uglify-js").MinifyOptions | undefined;
  minify: typeof uglifyJsMinify;
};
export type PluginOptionsForUglifyJS = BasePluginOptions &
  UglifyJSFunctionAndOptions;
export type SwcFunctionAndOptions = {
  terserOptions?: import("@swc/core").JsMinifyOptions | undefined;
  minify: typeof swcMinify;
};
export type PluginOptionsForSwc = BasePluginOptions & SwcFunctionAndOptions;
export type EsbuildFunctionAndOptions = {
  terserOptions?: import("esbuild").TransformOptions | undefined;
  minify: typeof esbuildMinify;
};
export type PluginOptionsForEsbuild = BasePluginOptions &
  EsbuildFunctionAndOptions;
export type CustomMinifyFunctionAndOptions = {
  terserOptions?: CustomMinifyOptions;
  minify: MinifyFunction;
};
export type PluginOptionsForCustomMinifyFunction = BasePluginOptions &
  CustomMinifyFunctionAndOptions;
export type PluginOptions =
  | DefaultPluginOptions
  | PluginOptionsForTerser
  | PluginOptionsForUglifyJS
  | PluginOptionsForSwc
  | PluginOptionsForEsbuild
  | PluginOptionsForCustomMinifyFunction;
export type NormalizedPluginOptions =
  | PluginOptionsForTerser
  | PluginOptionsForUglifyJS
  | PluginOptionsForSwc
  | PluginOptionsForEsbuild
  | PluginOptionsForCustomMinifyFunction;
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
/** @typedef {import("jest-worker").Worker} JestWorker */
/** @typedef {import("source-map").RawSourceMap} RawSourceMap */
/** @typedef {RegExp | string} Rule */
/** @typedef {Rule[] | Rule} Rules */
/** @typedef {JestWorker & { transform: (options: string) => MinifyResult, minify: (options: InternalMinifyOptions) => MinifyResult }} MinifyWorker */
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
 * @typedef {{ [file: string]: string }} Input
 */
/**
 * @typedef {Object.<any, any>} CustomMinifyOptions
 */
/**
 * @callback MinifyFunction
 * @param {Input} input
 * @param {RawSourceMap | undefined} sourceMap
 * @param {InternalPredefinedMinimizerOptions & CustomMinifyOptions} minifyOptions
 * @param {ExtractCommentsOptions | undefined} extractComments
 * @returns {Promise<MinifyResult>}
 */
/**
 * @typedef {ExtractCommentsCondition | ExtractCommentsObject} ExtractCommentsOptions
 */
/**
 * @typedef {TerserMinifyOptions | UglifyJSMinifyOptions | SwcMinifyOptions | EsbuildMinifyOptions | CustomMinifyOptions} MinimizerOptions
 */
/**
 * @typedef {Object} InternalPredefinedMinimizerOptions
 * @property {boolean} [module]
 * @property {5 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020} [ecma]
 */
/**
 * @typedef {Object} InternalMinifyOptions
 * @property {string} name
 * @property {string} input
 * @property {RawSourceMap | undefined} inputSourceMap
 * @property {ExtractCommentsOptions | undefined} extractComments
 * @property {MinifyFunction} minify
 * @property {MinimizerOptions & InternalPredefinedMinimizerOptions} minifyOptions
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
 * @typedef {Object} BasePluginOptions
 * @property {Rules} [test]
 * @property {Rules} [include]
 * @property {Rules} [exclude]
 * @property {ExtractCommentsOptions} [extractComments]
 * @property {boolean} [parallel]
 */
/**
 * @typedef {Object} DefaultTerserMinimizeFunctionAndOptions
 * @property {TerserMinifyOptions} [terserOptions]
 * @property {terserMinify} [minify]
 */
/**
 * @typedef {BasePluginOptions & DefaultTerserMinimizeFunctionAndOptions} DefaultPluginOptions
 */
/**
 * @typedef {Object} TerserMinimizeFunctionAndOptions
 * @property {TerserMinifyOptions} [terserOptions]
 * @property {terserMinify} minify
 */
/**
 * @typedef {BasePluginOptions & TerserMinimizeFunctionAndOptions} PluginOptionsForTerser
 */
/**
 * @typedef {Object} UglifyJSFunctionAndOptions
 * @property {UglifyJSMinifyOptions} [terserOptions]
 * @property {uglifyJsMinify} minify
 */
/**
 * @typedef {BasePluginOptions & UglifyJSFunctionAndOptions} PluginOptionsForUglifyJS
 */
/**
 * @typedef {Object} SwcFunctionAndOptions
 * @property {SwcMinifyOptions} [terserOptions]
 * @property {swcMinify} minify
 */
/**
 * @typedef {BasePluginOptions & SwcFunctionAndOptions} PluginOptionsForSwc
 */
/**
 * @typedef {Object} EsbuildFunctionAndOptions
 * @property {EsbuildMinifyOptions} [terserOptions]
 * @property {esbuildMinify} minify
 */
/**
 * @typedef {BasePluginOptions & EsbuildFunctionAndOptions} PluginOptionsForEsbuild
 */
/**
 * @typedef {Object} CustomMinifyFunctionAndOptions
 * @property {CustomMinifyOptions} [terserOptions]
 * @property {MinifyFunction} minify
 */
/**
 * @typedef {BasePluginOptions & CustomMinifyFunctionAndOptions} PluginOptionsForCustomMinifyFunction
 */
/**
 * @typedef {DefaultPluginOptions | PluginOptionsForTerser | PluginOptionsForUglifyJS | PluginOptionsForSwc | PluginOptionsForEsbuild | PluginOptionsForCustomMinifyFunction} PluginOptions
 */
/**
 * @typedef {PluginOptionsForTerser | PluginOptionsForUglifyJS | PluginOptionsForSwc | PluginOptionsForEsbuild | PluginOptionsForCustomMinifyFunction} NormalizedPluginOptions
 */
/**
 * @template {PluginOptions} T
 */
declare class TerserPlugin<T extends PluginOptions> {
  /**
   * @private
   * @param {any} input
   * @returns {boolean}
   */
  private static isSourceMap;
  /**
   * @private
   * @param {Error & { line: number, col: number}} error
   * @param {string} file
   * @param {Compilation["requestShortener"]} [requestShortener]
   * @param {SourceMapConsumer} [sourceMap]
   * @returns {Error}
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
   * @param {T} [options]
   */
  constructor(options?: T | undefined);
  /** @type {NormalizedPluginOptions} */
  options: NormalizedPluginOptions;
  /**
   * @param {Compiler} compiler
   * @param {Compilation} compilation
   * @param {Record<string, import("webpack").sources.Source>} assets
   * @param {{availableNumberOfCores: number}} optimizeOptions
   * @returns {Promise<void>}
   */
  optimize(
    compiler: Compiler,
    compilation: Compilation,
    assets: Record<string, import("webpack").sources.Source>,
    optimizeOptions: {
      availableNumberOfCores: number;
    }
  ): Promise<void>;
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
