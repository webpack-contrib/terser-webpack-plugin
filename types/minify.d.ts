export type MinifyResult = import("./index.js").MinifyResult;
/** @typedef {import("./index.js").MinifyResult} MinifyResult */
/**
 * @template T
 * @param {import("./index.js").InternalMinifyOptions<T>} options
 * @returns {Promise<MinifyResult>}
 */
export function minify<T>(
  options: import("./index.js").InternalMinifyOptions<T>
): Promise<MinifyResult>;
/**
 * @param {string} options
 * @returns {Promise<MinifyResult>}
 */
export function transform(options: string): Promise<MinifyResult>;
