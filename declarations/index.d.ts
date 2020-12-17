export default TerserPlugin;
export type Schema =
  | (import("json-schema").JSONSchema4 &
      import("schema-utils/declarations/validate").Extend)
  | (import("json-schema").JSONSchema6 &
      import("schema-utils/declarations/validate").Extend)
  | (import("json-schema").JSONSchema7 &
      import("schema-utils/declarations/validate").Extend);
export type Compiler = import("webpack").Compiler;
export type Compilation = import("webpack").Compilation;
export type WebpackError = import("webpack").WebpackError;
export type Asset = import("webpack").Asset;
export type TerserECMA = 5 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020;
export type TerserMinifyOptions = import("terser").MinifyOptions;
export type JestWorker = Worker;
export type RawSourceMap = import("source-map").RawSourceMap;
export type InternalMinifyOptions = {
  name: string;
  input: string;
  inputSourceMap: import("source-map").RawSourceMap | undefined;
  extractComments: ExtractCommentsOptions;
  minify: CustomMinifyFunction | undefined;
  minifyOptions: any;
};
export type InternalMinifyResult = Promise<
  import("terser").MinifyOutput & {
    /** @typedef {JestWorker & { transform: (options: string) => InternalMinifyResult, minify: (options: InternalMinifyOptions) => InternalMinifyResult }} MinifyWorker */
    /** @typedef {Object.<any, any> | TerserMinifyOptions} MinifyOptions */
    /**
     * @callback ExtractCommentsFunction
     * @param {any} astNode
     * @param {{ value: string, type: 'comment1' | 'comment2' | 'comment3' | 'comment4', pos: number, line: number, col: number }} comment
     * @returns {boolean}
     */
    /**
     * @typedef {boolean | string | RegExp | ExtractCommentsFunction} ExtractCommentsCondition
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
     * @callback CustomMinifyFunction
     * @param {Object.<string, string>} file
     * @param {RawSourceMap | undefined} sourceMap
     * @param {MinifyOptions} minifyOptions
     */
    /**
     * @typedef {ExtractCommentsCondition | ExtractCommentsObject} ExtractCommentsOptions
     */
    /**
     * @typedef {Object} TerserPluginOptions
     * @property {Rules} [test]
     * @property {Rules} [include]
     * @property {Rules} [exclude]
     * @property {MinifyOptions} [terserOptions]
     * @property {ExtractCommentsOptions} [extractComments]
     * @property {boolean} [parallel]
     * @property {CustomMinifyFunction} [minify]
     */
    extractedComments?: import("./minify").ExtractedComments | undefined;
  }
>;
export type Rule = string | RegExp;
export type Rules = string | RegExp | (string | RegExp)[];
export type MinifyWorker = Worker & {
  transform: (options: string) => import("./minify").InternalMinifyResult;
  minify: (
    options: InternalMinifyOptions
  ) => import("./minify").InternalMinifyResult;
};
export type MinifyOptions = any;
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
  | string
  | boolean
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
export type CustomMinifyFunction = (
  file: {
    [x: string]: string;
  },
  sourceMap: RawSourceMap | undefined,
  minifyOptions: MinifyOptions
) => any;
export type ExtractCommentsOptions =
  | string
  | boolean
  | RegExp
  | ExtractCommentsFunction
  | ExtractCommentsObject;
export type TerserPluginOptions = {
  test?: string | RegExp | (string | RegExp)[] | undefined;
  include?: string | RegExp | (string | RegExp)[] | undefined;
  exclude?: string | RegExp | (string | RegExp)[] | undefined;
  terserOptions?: MinifyOptions;
  extractComments?:
    | string
    | boolean
    | RegExp
    | ExtractCommentsFunction
    | ExtractCommentsObject
    | undefined;
  parallel?: boolean | undefined;
  minify?: CustomMinifyFunction | undefined;
};
/** @typedef {import("schema-utils/declarations/validate").Schema} Schema */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("webpack").Compilation} Compilation */
/** @typedef {import("webpack").WebpackError} WebpackError */
/** @typedef {import("webpack").Asset} Asset */
/** @typedef {import("terser").ECMA} TerserECMA */
/** @typedef {import("terser").MinifyOptions} TerserMinifyOptions */
/** @typedef {import("jest-worker").default} JestWorker */
/** @typedef {import("source-map").RawSourceMap} RawSourceMap */
/** @typedef {import("./minify.js").InternalMinifyOptions} InternalMinifyOptions */
/** @typedef {import("./minify.js").InternalMinifyResult} InternalMinifyResult */
/** @typedef {RegExp | string} Rule */
/** @typedef {Rule[] | Rule} Rules */
/** @typedef {JestWorker & { transform: (options: string) => InternalMinifyResult, minify: (options: InternalMinifyOptions) => InternalMinifyResult }} MinifyWorker */
/** @typedef {Object.<any, any> | TerserMinifyOptions} MinifyOptions */
/**
 * @callback ExtractCommentsFunction
 * @param {any} astNode
 * @param {{ value: string, type: 'comment1' | 'comment2' | 'comment3' | 'comment4', pos: number, line: number, col: number }} comment
 * @returns {boolean}
 */
/**
 * @typedef {boolean | string | RegExp | ExtractCommentsFunction} ExtractCommentsCondition
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
 * @callback CustomMinifyFunction
 * @param {Object.<string, string>} file
 * @param {RawSourceMap | undefined} sourceMap
 * @param {MinifyOptions} minifyOptions
 */
/**
 * @typedef {ExtractCommentsCondition | ExtractCommentsObject} ExtractCommentsOptions
 */
/**
 * @typedef {Object} TerserPluginOptions
 * @property {Rules} [test]
 * @property {Rules} [include]
 * @property {Rules} [exclude]
 * @property {MinifyOptions} [terserOptions]
 * @property {ExtractCommentsOptions} [extractComments]
 * @property {boolean} [parallel]
 * @property {CustomMinifyFunction} [minify]
 */
declare class TerserPlugin {
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
   * @param {boolean} parallel
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
   * @param {TerserPluginOptions} options
   */
  constructor(options?: TerserPluginOptions);
  options: {
    test: string | RegExp | (string | RegExp)[];
    extractComments: ExtractCommentsOptions;
    parallel: boolean;
    include: string | RegExp | (string | RegExp)[] | undefined;
    exclude: string | RegExp | (string | RegExp)[] | undefined;
    minify: CustomMinifyFunction | undefined;
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
import Worker from "jest-worker";
