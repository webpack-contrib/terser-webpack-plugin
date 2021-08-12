/** @typedef {import("source-map").RawSourceMap} RawSourceMap */
/** @typedef {import("terser").MinifyOptions} TerserMinifyOptions */
/** @typedef {import("terser").FormatOptions} FormatOptions */
/** @typedef {import("terser").MangleOptions} MangleOptions */
/** @typedef {import("./index.js").ExtractCommentsOptions} ExtractCommentsOptions */
/** @typedef {import("./index.js").ExtractCommentsFunction} ExtractCommentsFunction */
/** @typedef {import("./index.js").ExtractCommentsCondition} ExtractCommentsCondition */
/** @typedef {import("./index.js").Input} Input */
/** @typedef {import("./index.js").InternalMinifyResult} InternalMinifyResult */

/**
 * @typedef {TerserMinifyOptions & { sourceMap: undefined } & ({ output: FormatOptions & { beautify: boolean } } | { format: FormatOptions & { beautify: boolean } })} NormalizedTerserMinifyOptions
 */

/**
 * @typedef {Array<string>} ExtractedComments
 */

/* istanbul ignore next */
/**
 * @param {Input} input
 * @param {RawSourceMap | undefined} sourceMap
 * @param {TerserMinifyOptions} minimizerOptions
 * @param {ExtractCommentsOptions} extractComments
 * @return {Promise<InternalMinifyResult>}
 */
async function terserMinify(
  input,
  sourceMap,
  minimizerOptions,
  extractComments
) {
  /**
   * @param {any} value
   * @returns {boolean}
   */
  const isObject = (value) => {
    const type = typeof value;

    return value != null && (type === "object" || type === "function");
  };

  /**
   * @param {NormalizedTerserMinifyOptions} terserOptions
   * @param {ExtractedComments} extractedComments
   * @returns {ExtractCommentsFunction}
   */
  const buildComments = (terserOptions, extractedComments) => {
    /** @type {{ [index: string]: ExtractCommentsCondition }} */
    const condition = {};

    let comments;

    if (terserOptions.format) {
      ({ comments } = terserOptions.format);
    } else if (terserOptions.output) {
      ({ comments } = terserOptions.output);
    }

    condition.preserve = typeof comments !== "undefined" ? comments : false;

    if (typeof extractComments === "boolean" && extractComments) {
      condition.extract = "some";
    } else if (
      typeof extractComments === "string" ||
      extractComments instanceof RegExp
    ) {
      condition.extract = extractComments;
    } else if (typeof extractComments === "function") {
      condition.extract = extractComments;
    } else if (extractComments && isObject(extractComments)) {
      condition.extract =
        typeof extractComments.condition === "boolean" &&
        extractComments.condition
          ? "some"
          : typeof extractComments.condition !== "undefined"
          ? extractComments.condition
          : "some";
    } else {
      // No extract
      // Preserve using "commentsOpts" or "some"
      condition.preserve = typeof comments !== "undefined" ? comments : "some";
      condition.extract = false;
    }

    // Ensure that both conditions are functions
    ["preserve", "extract"].forEach((key) => {
      /** @type {undefined | string} */
      let regexStr;
      /** @type {undefined | RegExp} */
      let regex;

      switch (typeof condition[key]) {
        case "boolean":
          condition[key] = condition[key] ? () => true : () => false;

          break;
        case "function":
          break;
        case "string":
          if (condition[key] === "all") {
            condition[key] = () => true;

            break;
          }

          if (condition[key] === "some") {
            condition[key] = /** @type {ExtractCommentsFunction} */ (
              (astNode, comment) =>
                (comment.type === "comment2" || comment.type === "comment1") &&
                /@preserve|@lic|@cc_on|^\**!/i.test(comment.value)
            );

            break;
          }

          regexStr = /** @type {string} */ (condition[key]);

          condition[key] = /** @type {ExtractCommentsFunction} */ (
            (astNode, comment) =>
              new RegExp(/** @type {string} */ (regexStr)).test(comment.value)
          );

          break;
        default:
          regex = /** @type {RegExp} */ (condition[key]);

          condition[key] = /** @type {ExtractCommentsFunction} */ (
            (astNode, comment) =>
              /** @type {RegExp} */ (regex).test(comment.value)
          );
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
          comment.type === "comment2"
            ? `/*${comment.value}*/`
            : `//${comment.value}`;

        // Don't include duplicate comments
        if (!extractedComments.includes(commentText)) {
          extractedComments.push(commentText);
        }
      }

      return /** @type {{ preserve: ExtractCommentsFunction }} */ (
        condition
      ).preserve(astNode, comment);
    };
  };

  /**
   * @param {TerserMinifyOptions} [terserOptions={}]
   * @returns {NormalizedTerserMinifyOptions}
   */
  const buildTerserOptions = (terserOptions = {}) => {
    // Need deep copy objects to avoid https://github.com/terser/terser/issues/366
    return {
      ...terserOptions,
      compress:
        typeof terserOptions.compress === "boolean"
          ? terserOptions.compress
          : { ...terserOptions.compress },
      // ecma: terserOptions.ecma,
      // ie8: terserOptions.ie8,
      // keep_classnames: terserOptions.keep_classnames,
      // keep_fnames: terserOptions.keep_fnames,
      mangle:
        terserOptions.mangle == null
          ? true
          : typeof terserOptions.mangle === "boolean"
          ? terserOptions.mangle
          : { ...terserOptions.mangle },
      // module: terserOptions.module,
      // nameCache: { ...terserOptions.toplevel },
      // the `output` option is deprecated
      ...(terserOptions.format
        ? { format: { beautify: false, ...terserOptions.format } }
        : { output: { beautify: false, ...terserOptions.output } }),
      parse: { ...terserOptions.parse },
      // safari10: terserOptions.safari10,
      // Ignoring sourceMap from options
      // eslint-disable-next-line no-undefined
      sourceMap: undefined,
      // toplevel: terserOptions.toplevel
    };
  };

  // eslint-disable-next-line global-require
  const { minify } = require("terser");
  // Copy terser options
  const terserOptions = buildTerserOptions(minimizerOptions);

  // Let terser generate a SourceMap
  if (sourceMap) {
    // @ts-ignore
    terserOptions.sourceMap = { asObject: true };
  }

  /** @type {ExtractedComments} */
  const extractedComments = [];

  if (terserOptions.output) {
    terserOptions.output.comments = buildComments(
      terserOptions,
      extractedComments
    );
  } else if (terserOptions.format) {
    terserOptions.format.comments = buildComments(
      terserOptions,
      extractedComments
    );
  }

  const [[filename, code]] = Object.entries(input);
  const result = await minify({ [filename]: code }, terserOptions);

  // @ts-ignore
  return { ...result, extractedComments };
}

// eslint-disable-next-line import/prefer-default-export
export { terserMinify };
