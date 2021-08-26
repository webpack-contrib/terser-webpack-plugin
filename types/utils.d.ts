export type RawSourceMap = import("source-map").RawSourceMap;
export type TerserMinifyOptions = import("terser").MinifyOptions;
export type TerserFormatOptions = import("terser").FormatOptions;
export type UglifyJSMinifyOptions = import("uglify-js").MinifyOptions;
export type UglifyJSOutputOptions = import("uglify-js").OutputOptions;
export type SwcMinifyOptions = import("@swc/core").JsMinifyOptions;
export type EsbuildMinifyOptions = import("esbuild").TransformOptions;
export type ExtractCommentsOptions =
  import("./index.js").ExtractCommentsOptions;
export type ExtractCommentsFunction =
  import("./index.js").ExtractCommentsFunction;
export type ExtractCommentsCondition =
  import("./index.js").ExtractCommentsCondition;
export type Input = import("./index.js").Input;
export type MinifyResult = import("./index.js").MinifyResult;
export type InternalPredefinedMinimizerOptions =
  import("./index.js").InternalPredefinedMinimizerOptions;
export type NormalizedTerserMinifyOptions = TerserMinifyOptions & {
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
export type NormalizedUglifyJSMinifyOptions = UglifyJSMinifyOptions & {
  sourceMap: undefined;
} & {
  output: UglifyJSOutputOptions & {
    beautify: boolean;
  };
};
export type NormalizedSwcMinifyOptions = SwcMinifyOptions & {
  sourceMap: undefined;
};
export type ExtractedComments = Array<string>;
/** @typedef {import("source-map").RawSourceMap} RawSourceMap */
/** @typedef {import("terser").MinifyOptions} TerserMinifyOptions */
/** @typedef {import("terser").FormatOptions} TerserFormatOptions */
/** @typedef {import("uglify-js").MinifyOptions} UglifyJSMinifyOptions */
/** @typedef {import("uglify-js").OutputOptions} UglifyJSOutputOptions */
/** @typedef {import("@swc/core").JsMinifyOptions} SwcMinifyOptions */
/** @typedef {import("esbuild").TransformOptions} EsbuildMinifyOptions */
/** @typedef {import("./index.js").ExtractCommentsOptions} ExtractCommentsOptions */
/** @typedef {import("./index.js").ExtractCommentsFunction} ExtractCommentsFunction */
/** @typedef {import("./index.js").ExtractCommentsCondition} ExtractCommentsCondition */
/** @typedef {import("./index.js").Input} Input */
/** @typedef {import("./index.js").MinifyResult} MinifyResult */
/** @typedef {import("./index.js").InternalPredefinedMinimizerOptions} InternalPredefinedMinimizerOptions */
/**
 * @typedef {TerserMinifyOptions & { sourceMap: undefined } & ({ output: TerserFormatOptions & { beautify: boolean } } | { format: TerserFormatOptions & { beautify: boolean } })} NormalizedTerserMinifyOptions
 */
/**
 * @typedef {UglifyJSMinifyOptions & { sourceMap: undefined } & { output: UglifyJSOutputOptions & { beautify: boolean } }} NormalizedUglifyJSMinifyOptions
 */
/**
 * @typedef {SwcMinifyOptions & { sourceMap: undefined }} NormalizedSwcMinifyOptions
 */
/**
 * @typedef {Array<string>} ExtractedComments
 */
/**
 * @param {Input} input
 * @param {RawSourceMap | undefined} sourceMap
 * @param {InternalPredefinedMinimizerOptions & TerserMinifyOptions} minimizerOptions
 * @param {ExtractCommentsOptions | undefined} extractComments
 * @return {Promise<MinifyResult>}
 */
export function terserMinify(
  input: Input,
  sourceMap: RawSourceMap | undefined,
  minimizerOptions: InternalPredefinedMinimizerOptions & TerserMinifyOptions,
  extractComments: ExtractCommentsOptions | undefined
): Promise<MinifyResult>;
/**
 * @param {Input} input
 * @param {RawSourceMap | undefined} sourceMap
 * @param {InternalPredefinedMinimizerOptions & UglifyJSMinifyOptions} minimizerOptions
 * @param {ExtractCommentsOptions | undefined} extractComments
 * @return {Promise<MinifyResult>}
 */
export function uglifyJsMinify(
  input: Input,
  sourceMap: RawSourceMap | undefined,
  minimizerOptions: InternalPredefinedMinimizerOptions & UglifyJSMinifyOptions,
  extractComments: ExtractCommentsOptions | undefined
): Promise<MinifyResult>;
/**
 * @param {Input} input
 * @param {RawSourceMap | undefined} sourceMap
 * @param {InternalPredefinedMinimizerOptions & SwcMinifyOptions} minimizerOptions
 * @return {Promise<MinifyResult>}
 */
export function swcMinify(
  input: Input,
  sourceMap: RawSourceMap | undefined,
  minimizerOptions: InternalPredefinedMinimizerOptions & SwcMinifyOptions
): Promise<MinifyResult>;
/**
 * @param {Input} input
 * @param {RawSourceMap | undefined} sourceMap
 * @param {InternalPredefinedMinimizerOptions & EsbuildMinifyOptions} minimizerOptions
 * @return {Promise<MinifyResult>}
 */
export function esbuildMinify(
  input: Input,
  sourceMap: RawSourceMap | undefined,
  minimizerOptions: InternalPredefinedMinimizerOptions & EsbuildMinifyOptions
): Promise<MinifyResult>;
