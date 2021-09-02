export type RawSourceMap = import("source-map").RawSourceMap;
export type TerserFormatOptions = import("terser").FormatOptions;
export type TerserOptions = import("terser").MinifyOptions;
export type TerserECMA = import("terser").ECMA;
export type UglifyJSOutputOptions = import("uglify-js").OutputOptions;
export type UglifyJSOptions = import("uglify-js").MinifyOptions;
export type SwcOptions = import("@swc/core").JsMinifyOptions;
export type EsbuildOptions = import("esbuild").TransformOptions;
export type ExtractCommentsOptions =
  import("./index.js").ExtractCommentsOptions;
export type ExtractCommentsFunction =
  import("./index.js").ExtractCommentsFunction;
export type ExtractCommentsCondition =
  import("./index.js").ExtractCommentsCondition;
export type Input = import("./index.js").Input;
export type MinimizedResult = import("./index.js").MinimizedResult;
export type PredefinedOptions = import("./index.js").PredefinedOptions;
export type NormalizedTerserOptions = TerserOptions & {
  sourceMap: undefined;
} & (
    | {
        output: TerserFormatOptions & {
          beautify: boolean;
        };
      }
    | {
        format: TerserFormatOptions & {
          beautify: boolean;
        };
      }
  );
export type NormalizedUglifyJSOptions = UglifyJSOptions & {
  sourceMap: undefined;
} & {
  output: UglifyJSOutputOptions & {
    beautify: boolean;
  };
};
export type NormalizedSwcOptions = SwcOptions & {
  sourceMap: undefined;
};
export type ExtractedComments = Array<string>;
/** @typedef {import("source-map").RawSourceMap} RawSourceMap */
/** @typedef {import("terser").FormatOptions} TerserFormatOptions */
/** @typedef {import("terser").MinifyOptions} TerserOptions */
/** @typedef {import("terser").ECMA} TerserECMA */
/** @typedef {import("uglify-js").OutputOptions} UglifyJSOutputOptions */
/** @typedef {import("uglify-js").MinifyOptions} UglifyJSOptions */
/** @typedef {import("@swc/core").JsMinifyOptions} SwcOptions */
/** @typedef {import("esbuild").TransformOptions} EsbuildOptions */
/** @typedef {import("./index.js").ExtractCommentsOptions} ExtractCommentsOptions */
/** @typedef {import("./index.js").ExtractCommentsFunction} ExtractCommentsFunction */
/** @typedef {import("./index.js").ExtractCommentsCondition} ExtractCommentsCondition */
/** @typedef {import("./index.js").Input} Input */
/** @typedef {import("./index.js").MinimizedResult} MinimizedResult */
/** @typedef {import("./index.js").PredefinedOptions} PredefinedOptions */
/**
 * @typedef {TerserOptions & { sourceMap: undefined } & ({ output: TerserFormatOptions & { beautify: boolean } } | { format: TerserFormatOptions & { beautify: boolean } })} NormalizedTerserOptions
 */
/**
 * @typedef {UglifyJSOptions & { sourceMap: undefined } & { output: UglifyJSOutputOptions & { beautify: boolean } }} NormalizedUglifyJSOptions
 */
/**
 * @typedef {SwcOptions & { sourceMap: undefined }} NormalizedSwcOptions
 */
/**
 * @typedef {Array<string>} ExtractedComments
 */
/**
 * @param {Input} input
 * @param {RawSourceMap | undefined} sourceMap
 * @param {PredefinedOptions & TerserOptions} minimizerOptions
 * @param {ExtractCommentsOptions | undefined} extractComments
 * @return {Promise<MinimizedResult>}
 */
export function terserMinify(
  input: Input,
  sourceMap: RawSourceMap | undefined,
  minimizerOptions: PredefinedOptions & TerserOptions,
  extractComments: ExtractCommentsOptions | undefined
): Promise<MinimizedResult>;
export namespace terserMinify {
  /**
   * @returns {string | undefined}
   */
  function getMinimizerVersion(): string | undefined;
}
/**
 * @param {Input} input
 * @param {RawSourceMap | undefined} sourceMap
 * @param {PredefinedOptions & UglifyJSOptions} minimizerOptions
 * @param {ExtractCommentsOptions | undefined} extractComments
 * @return {Promise<MinimizedResult>}
 */
export function uglifyJsMinify(
  input: Input,
  sourceMap: RawSourceMap | undefined,
  minimizerOptions: PredefinedOptions & UglifyJSOptions,
  extractComments: ExtractCommentsOptions | undefined
): Promise<MinimizedResult>;
export namespace uglifyJsMinify {
  /**
   * @returns {string | undefined}
   */
  function getMinimizerVersion(): string | undefined;
}
/**
 * @param {Input} input
 * @param {RawSourceMap | undefined} sourceMap
 * @param {PredefinedOptions & SwcOptions} minimizerOptions
 * @return {Promise<MinimizedResult>}
 */
export function swcMinify(
  input: Input,
  sourceMap: RawSourceMap | undefined,
  minimizerOptions: PredefinedOptions & SwcOptions
): Promise<MinimizedResult>;
export namespace swcMinify {
  /**
   * @returns {string | undefined}
   */
  function getMinimizerVersion(): string | undefined;
}
/**
 * @param {Input} input
 * @param {RawSourceMap | undefined} sourceMap
 * @param {PredefinedOptions & EsbuildOptions} minimizerOptions
 * @return {Promise<MinimizedResult>}
 */
export function esbuildMinify(
  input: Input,
  sourceMap: RawSourceMap | undefined,
  minimizerOptions: PredefinedOptions & EsbuildOptions
): Promise<MinimizedResult>;
export namespace esbuildMinify {
  /**
   * @returns {string | undefined}
   */
  function getMinimizerVersion(): string | undefined;
}
