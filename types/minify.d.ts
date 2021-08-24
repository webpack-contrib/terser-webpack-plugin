export type InternalMinifyOptions = import("./index.js").InternalMinifyOptions;
export type MinifyResult = import("./index.js").MinifyResult;
/** @typedef {import("./index.js").InternalMinifyOptions} InternalMinifyOptions */
/** @typedef {import("./index.js").MinifyResult} MinifyResult */
/**
 * @param {InternalMinifyOptions} options
 * @returns {Promise<MinifyResult>}
 */
export function minify(options: InternalMinifyOptions): Promise<MinifyResult>;
/**
 * @param {string} options
 * @returns {Promise<MinifyResult>}
 */
export function transform(options: string): Promise<MinifyResult>;
