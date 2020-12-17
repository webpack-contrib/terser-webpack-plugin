export type RawSourceMap = import("source-map").RawSourceMap;
export type ExtractCommentsOptions =
  | string
  | boolean
  | RegExp
  | import("./index.js").ExtractCommentsFunction
  | import("./index.js").ExtractCommentsObject;
export type CustomMinifyFunction = (
  file: {
    [x: string]: string;
  },
  sourceMap: import("source-map").RawSourceMap | undefined,
  minifyOptions: any
) => any;
export type MinifyOptions = any;
export type TerserMinifyOptions = import("terser").MinifyOptions;
export type MinifyOutput = import("terser").MinifyOutput;
export type FormatOptions = import("terser").FormatOptions;
export type MangleOptions = import("terser").MangleOptions;
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
  | import("./index.js").ExtractCommentsFunction;
export type InternalMinifyOptions = {
  name: string;
  input: string;
  inputSourceMap: RawSourceMap | undefined;
  extractComments: ExtractCommentsOptions;
  minify: CustomMinifyFunction | undefined;
  minifyOptions: MinifyOptions;
};
export type ExtractedComments = string[];
export type InternalMinifyResult = Promise<
  import("terser").MinifyOutput & {
    extractedComments?: ExtractedComments | undefined;
  }
>;
export type NormalizedTerserMinifyOptions =
  | (import("terser").MinifyOptions & {
      sourceMap: undefined;
    } & {
      output: FormatOptions & {
        beautify: boolean;
      };
    })
  | (import("terser").MinifyOptions & {
      sourceMap: undefined;
    } & {
      format: FormatOptions & {
        beautify: boolean;
      };
    });
/**
 * @param {InternalMinifyOptions} options
 * @returns {InternalMinifyResult}
 */
export function minify(options: InternalMinifyOptions): InternalMinifyResult;
/**
 * @param {string} options
 * @returns {InternalMinifyResult}
 */
export function transform(options: string): InternalMinifyResult;
