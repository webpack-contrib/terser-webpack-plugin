/** @typedef {import("./index.js").MinifyResult} MinifyResult */

/**
 * @template T
 * @param {import("./index.js").InternalMinifyOptions<T>} options
 * @returns {Promise<MinifyResult>}
 */
async function minify(options) {
  const {
    name,
    input,
    inputSourceMap,
    minify: minifyFn,
    minifyOptions,
    extractComments,
  } = options;

  return minifyFn(
    { [name]: input },
    inputSourceMap,
    minifyOptions,
    extractComments
  );
}

/**
 * @param {string} options
 * @returns {Promise<MinifyResult>}
 */
async function transform(options) {
  // 'use strict' => this === undefined (Clean Scope)
  // Safer for possible security issues, albeit not critical at all here
  // eslint-disable-next-line no-param-reassign
  const evaluatedOptions =
    /**
     * @template T
     * @type {import("./index.js").InternalMinifyOptions<T>}
     * */
    (
      // eslint-disable-next-line no-new-func
      new Function(
        "exports",
        "require",
        "module",
        "__filename",
        "__dirname",
        `'use strict'\nreturn ${options}`
      )(exports, require, module, __filename, __dirname)
    );

  return minify(evaluatedOptions);
}

module.exports.minify = minify;
module.exports.transform = transform;
