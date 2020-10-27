const { minify: terserMinify } = require('terser');

/** @typedef {import("source-map").RawSourceMap} RawSourceMap */
/** @typedef {import("./index.js").ExtractCommentsOptions} ExtractCommentsOptions */
/** @typedef {import("./index.js").CustomMinifyFunction} CustomMinifyFunction */
/** @typedef {import("./index.js").MinifyOptions} MinifyOptions */
/** @typedef {import("terser").MinifyOptions} TerserMinifyOptions */
/** @typedef {import("terser").MinifyOutput} MinifyOutput */
/** @typedef {import("terser").FormatOptions} FormatOptions */
/** @typedef {import("terser").MangleOptions} MangleOptions */
/** @typedef {import("./index.js").ExtractCommentsFunction} ExtractCommentsFunction */
/** @typedef {import("./index.js").ExtractCommentsCondition} ExtractCommentsCondition */

/**
 * @typedef {Object} InternalMinifyOptions
 * @property {string} name
 * @property {string} input
 * @property {RawSourceMap} inputSourceMap
 * @property {ExtractCommentsOptions} extractComments
 * @property {CustomMinifyFunction} minify
 * @property {MinifyOptions} minifyOptions
 */

/**
 * @typedef {Array<string>} ExtractedComments
 */

/**
 * @typedef {Promise<MinifyOutput & { extractedComments?: ExtractedComments}>} InternalMinifyResult
 */

/**
 * @typedef {TerserMinifyOptions & { sourceMap: undefined } & ({ output: FormatOptions & { beautify: boolean } } | { format: FormatOptions & { beautify: boolean } })} NormalizedTerserMinifyOptions
 */

/**
 * @param {TerserMinifyOptions} [terserOptions={}]
 * @returns {NormalizedTerserMinifyOptions}
 */
function buildTerserOptions(terserOptions = {}) {
  return {
    ...terserOptions,
    mangle:
      terserOptions.mangle == null
        ? true
        : typeof terserOptions.mangle === 'boolean'
        ? terserOptions.mangle
        : { ...terserOptions.mangle },
    // Ignoring sourceMap from options
    // eslint-disable-next-line no-undefined
    sourceMap: undefined,
    // the `output` option is deprecated
    ...(terserOptions.format
      ? { format: { beautify: false, ...terserOptions.format } }
      : { output: { beautify: false, ...terserOptions.output } }),
  };
}

/**
 * @param {any} value
 * @returns {boolean}
 */
function isObject(value) {
  const type = typeof value;

  return value != null && (type === 'object' || type === 'function');
}

/**
 * @param {ExtractCommentsOptions} extractComments
 * @param {NormalizedTerserMinifyOptions} terserOptions
 * @param {ExtractedComments} extractedComments
 * @returns {ExtractCommentsFunction}
 */
function buildComments(extractComments, terserOptions, extractedComments) {
  /** @type {{ [index: string]: ExtractCommentsCondition }} */
  const condition = {};

  let comments;

  if (terserOptions.format) {
    ({ comments } = terserOptions.format);
  } else if (terserOptions.output) {
    ({ comments } = terserOptions.output);
  }

  condition.preserve = typeof comments !== 'undefined' ? comments : false;

  if (typeof extractComments === 'boolean' && extractComments) {
    condition.extract = 'some';
  } else if (
    typeof extractComments === 'string' ||
    extractComments instanceof RegExp
  ) {
    condition.extract = extractComments;
  } else if (typeof extractComments === 'function') {
    condition.extract = extractComments;
  } else if (extractComments && isObject(extractComments)) {
    condition.extract =
      typeof extractComments.condition === 'boolean' &&
      extractComments.condition
        ? 'some'
        : typeof extractComments.condition !== 'undefined'
        ? extractComments.condition
        : 'some';
  } else {
    // No extract
    // Preserve using "commentsOpts" or "some"
    condition.preserve = typeof comments !== 'undefined' ? comments : 'some';
    condition.extract = false;
  }

  // Ensure that both conditions are functions
  ['preserve', 'extract'].forEach((key) => {
    /** @type {undefined | string} */
    let regexStr;
    /** @type {undefined | RegExp} */
    let regex;

    switch (typeof condition[key]) {
      case 'boolean':
        condition[key] = condition[key] ? () => true : () => false;

        break;
      case 'function':
        break;
      case 'string':
        if (condition[key] === 'all') {
          condition[key] = () => true;

          break;
        }

        if (condition[key] === 'some') {
          condition[key] = /** @type {ExtractCommentsFunction} */ ((
            astNode,
            comment
          ) => {
            return (
              (comment.type === 'comment2' || comment.type === 'comment1') &&
              /@preserve|@lic|@cc_on|^\**!/i.test(comment.value)
            );
          });

          break;
        }

        regexStr = /** @type {string} */ (condition[key]);

        condition[key] = /** @type {ExtractCommentsFunction} */ ((
          astNode,
          comment
        ) => {
          return new RegExp(/** @type {string} */ (regexStr)).test(
            comment.value
          );
        });

        break;
      default:
        regex = /** @type {RegExp} */ (condition[key]);

        condition[key] = /** @type {ExtractCommentsFunction} */ ((
          astNode,
          comment
        ) => /** @type {RegExp} */ (regex).test(comment.value));
    }
  });

  // Redefine the comments function to extract and preserve
  // comments according to the two conditions
  return (astNode, comment) => {
    if (
      /** @type {{ extract: ExtractCommentsFunction }} */
      (condition).extract(astNode, comment)
    ) {
      const commentText =
        comment.type === 'comment2'
          ? `/*${comment.value}*/`
          : `//${comment.value}`;

      // Don't include duplicate comments
      if (!extractedComments.includes(commentText)) {
        extractedComments.push(commentText);
      }
    }

    return /** @type {{ preserve: ExtractCommentsFunction }} */ (condition).preserve(
      astNode,
      comment
    );
  };
}

/**
 * @param {InternalMinifyOptions} options
 * @returns {InternalMinifyResult}
 */
async function minify(options) {
  const {
    name,
    input,
    inputSourceMap,
    minify: minifyFn,
    minifyOptions,
  } = options;

  if (minifyFn) {
    return minifyFn({ [name]: input }, inputSourceMap, minifyOptions);
  }

  // Copy terser options
  const terserOptions = buildTerserOptions(minifyOptions);

  // Let terser generate a SourceMap
  if (inputSourceMap) {
    // @ts-ignore
    terserOptions.sourceMap = { asObject: true };
  }

  /** @type {ExtractedComments} */
  const extractedComments = [];
  const { extractComments } = options;

  if (terserOptions.output) {
    terserOptions.output.comments = buildComments(
      extractComments,
      terserOptions,
      extractedComments
    );
  } else if (terserOptions.format) {
    terserOptions.format.comments = buildComments(
      extractComments,
      terserOptions,
      extractedComments
    );
  }

  const result = await terserMinify({ [name]: input }, terserOptions);

  return { ...result, extractedComments };
}

/**
 * @param {string} options
 * @returns {InternalMinifyResult}
 */
function transform(options) {
  // 'use strict' => this === undefined (Clean Scope)
  // Safer for possible security issues, albeit not critical at all here
  // eslint-disable-next-line no-param-reassign
  const evaluatedOptions =
    /** @type {InternalMinifyOptions} */
    // eslint-disable-next-line no-new-func
    (new Function(
      'exports',
      'require',
      'module',
      '__filename',
      '__dirname',
      `'use strict'\nreturn ${options}`
    )(exports, require, module, __filename, __dirname));

  return minify(evaluatedOptions);
}

module.exports.minify = minify;
module.exports.transform = transform;
