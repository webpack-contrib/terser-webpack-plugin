export default TerserPlugin;
export type Schema = import("schema-utils/declarations/validate").Schema;
export type Compiler = import("webpack").Compiler;
export type Compilation = import("webpack").Compilation;
export type WebpackError = import("webpack").WebpackError;
export type Asset = import("webpack").Asset;
export type TerserECMA = import("./utils.js").TerserECMA;
export type TerserOptions = import("./utils.js").TerserOptions;
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
  condition?: ExtractCommentsCondition | undefined;
  filename?: ExtractCommentsFilename | undefined;
  banner?: ExtractCommentsBanner | undefined;
};
export type ExtractCommentsOptions =
  | ExtractCommentsCondition
  | ExtractCommentsObject;
export type MinimizedResult = {
  code: string;
  map?: import("source-map").RawSourceMap | undefined;
  errors?: (string | Error)[] | undefined;
  warnings?: (string | Error)[] | undefined;
  extractedComments?: string[] | undefined;
};
export type Input = {
  [file: string]: string;
};
export type BasicMinimizerImplementation<T> = (
  input: Input,
  sourceMap: RawSourceMap | undefined,
  minifyOptions: T,
  extractComments: ExtractCommentsOptions | undefined
) => Promise<MinimizedResult>;
export type PredefinedOptions = {
  module?: boolean | undefined;
  ecma?: any;
};
export type MinimizeFunctionHelpers = {
  getMinimizerVersion?: (() => string | undefined) | undefined;
};
export type MinimizerImplementation<T> = BasicMinimizerImplementation<T> &
  MinimizeFunctionHelpers;
export type MinimizerOptions<T> = PredefinedOptions & T;
export type InternalOptions<T> = {
  name: string;
  input: string;
  inputSourceMap: RawSourceMap | undefined;
  extractComments: ExtractCommentsOptions | undefined;
  minimizer: {
    implementation: MinimizerImplementation<InferDefaultType<T>>;
    options: MinimizerOptions<InferDefaultType<T>>;
  };
};
export type MinimizerWorker<T> = Worker & {
  transform: (options: string) => MinimizedResult;
  minify: (options: InternalOptions<T>) => MinimizedResult;
};
export type Parallel = undefined | boolean | number;
export type BasePluginOptions = {
  test?: Rules | undefined;
  include?: Rules | undefined;
  exclude?: Rules | undefined;
  extractComments?: ExtractCommentsOptions | undefined;
  parallel?: Parallel;
};
export type CustomOptions = {
  [key: string]: any;
};
export type InferDefaultType<T> = T extends infer U ? U : CustomOptions;
export type DefinedDefaultMinimizerAndOptions<T> = T extends TerserOptions
  ? {
      minify?: MinimizerImplementation<InferDefaultType<T>> | undefined;
      terserOptions?: MinimizerOptions<InferDefaultType<T>> | undefined;
    }
  : {
      minify: MinimizerImplementation<InferDefaultType<T>>;
      terserOptions?: MinimizerOptions<InferDefaultType<T>> | undefined;
    };
export type InternalPluginOptions<T> = BasePluginOptions & {
  minimizer: {
    implementation: MinimizerImplementation<InferDefaultType<T>>;
    options: MinimizerOptions<InferDefaultType<T>>;
  };
};
/** @typedef {import("schema-utils/declarations/validate").Schema} Schema */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("webpack").Compilation} Compilation */
/** @typedef {import("webpack").WebpackError} WebpackError */
/** @typedef {import("webpack").Asset} Asset */
/** @typedef {import("./utils.js").TerserECMA} TerserECMA */
/** @typedef {import("./utils.js").TerserOptions} TerserOptions */
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
 * @property {ExtractCommentsCondition} [condition]
 * @property {ExtractCommentsFilename} [filename]
 * @property {ExtractCommentsBanner} [banner]
 */
/**
 * @typedef {ExtractCommentsCondition | ExtractCommentsObject} ExtractCommentsOptions
 */
/**
 * @typedef {Object} MinimizedResult
 * @property {string} code
 * @property {RawSourceMap} [map]
 * @property {Array<Error | string>} [errors]
 * @property {Array<Error | string>} [warnings]
 * @property {Array<string>} [extractedComments]
 */
/**
 * @typedef {{ [file: string]: string }} Input
 */
/**
 * @template T
 * @callback BasicMinimizerImplementation
 * @param {Input} input
 * @param {RawSourceMap | undefined} sourceMap
 * @param {T} minifyOptions
 * @param {ExtractCommentsOptions | undefined} extractComments
 * @returns {Promise<MinimizedResult>}
 */
/**
 * @typedef {Object} PredefinedOptions
 * @property {boolean} [module]
 * @property {any} [ecma]
 */
/**
 * @typedef {object} MinimizeFunctionHelpers
 * @property {() => string | undefined} [getMinimizerVersion]
 */
/**
 * @template T
 * @typedef {BasicMinimizerImplementation<T> & MinimizeFunctionHelpers} MinimizerImplementation
 */
/**
 * @template T
 * @typedef {PredefinedOptions & T} MinimizerOptions
 */
/**
 * @template T
 * @typedef {Object} InternalOptions
 * @property {string} name
 * @property {string} input
 * @property {RawSourceMap | undefined} inputSourceMap
 * @property {ExtractCommentsOptions | undefined} extractComments
 * @property {{ implementation: MinimizerImplementation<InferDefaultType<T>>, options: MinimizerOptions<InferDefaultType<T>> }} minimizer
 */
/**
 * @template T
 * @typedef {JestWorker & { transform: (options: string) => MinimizedResult, minify: (options: InternalOptions<T>) => MinimizedResult }} MinimizerWorker
 */
/**
 * @typedef {undefined | boolean | number} Parallel
 */
/**
 * @typedef {Object} BasePluginOptions
 * @property {Rules} [test]
 * @property {Rules} [include]
 * @property {Rules} [exclude]
 * @property {ExtractCommentsOptions} [extractComments]
 * @property {Parallel} [parallel]
 */
/**
 * @typedef {{ [key: string]: any }} CustomOptions
 */
/**
 * @template T
 * @typedef {T extends infer U ? U : CustomOptions} InferDefaultType
 */
/**
 * @template T
 * @typedef {T extends TerserOptions ? { minify?: MinimizerImplementation<InferDefaultType<T>> | undefined, terserOptions?: MinimizerOptions<InferDefaultType<T>> | undefined } : { minify: MinimizerImplementation<InferDefaultType<T>>, terserOptions?: MinimizerOptions<InferDefaultType<T>> | undefined }} DefinedDefaultMinimizerAndOptions
 */
/**
 * @template T
 * @typedef {BasePluginOptions & { minimizer: { implementation: MinimizerImplementation<InferDefaultType<T>>, options: MinimizerOptions<InferDefaultType<T>> } }} InternalPluginOptions
 */
/**
 * @template [T=TerserOptions]
 */
declare class TerserPlugin<T = import("terser").MinifyOptions> {
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
   * @returns {Error}
   */
  private static buildWarning;
  /**
   * @private
   * @param {any} error
   * @param {string} file
   * @param {SourceMapConsumer} [sourceMap]
   * @param {Compilation["requestShortener"]} [requestShortener]
   * @returns {Error}
   */
  private static buildError;
  /**
   * @private
   * @param {Parallel} parallel
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
   * @param {BasePluginOptions & DefinedDefaultMinimizerAndOptions<T>} [options]
   */
  constructor(
    options?:
      | (BasePluginOptions & DefinedDefaultMinimizerAndOptions<T>)
      | undefined
  );
  /**
   * @private
   * @type {InternalPluginOptions<T>}
   */
  private options;
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
