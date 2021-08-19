/** @typedef {import("./index.js").InternalMinifyOptions} InternalMinifyOptions */
/** @typedef {import("./index.js").MinifyResult} MinifyResult */

/**
 * @param {InternalMinifyOptions} options
 * @returns {Promise<MinifyResult>}
 */
async function minify(options) {
  const minifyFns =
    typeof options.minimizer === "function"
      ? [options.minimizer]
      : options.minimizer;

  /**
   * @type {MinifyResult}
   */
  const result = { code: options.input, map: options.inputSourceMap };

  for (let i = 0; i <= minifyFns.length - 1; i++) {
    const minifyFn = minifyFns[i];
    const minifyOptions = Array.isArray(options.minimizerOptions)
      ? options.minimizerOptions[i]
      : options.minimizerOptions;
    // eslint-disable-next-line no-await-in-loop
    const minifyResult = await minifyFn(
      { [options.name]: result.code },
      result.map,
      minifyOptions,
      options.extractComments
    );

    result.code = minifyResult.code;

    if (minifyResult.map) {
      result.map = minifyResult.map;
    }

    if (minifyResult.warnings && minifyResult.warnings.length > 0) {
      result.warnings = (result.warnings || []).concat(minifyResult.warnings);
    }

    if (minifyResult.errors && minifyResult.errors.length > 0) {
      result.errors = (result.errors || []).concat(minifyResult.errors);
    }

    if (
      minifyResult.extractedComments &&
      minifyResult.extractedComments.length > 0
    ) {
      result.extractedComments = (result.extractedComments || []).concat(
        minifyResult.extractedComments
      );
    }
  }

  return result;
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
    /** @type {InternalMinifyOptions} */
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
