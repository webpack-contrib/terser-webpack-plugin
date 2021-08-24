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

/* istanbul ignore next */
/**
 * @param {Input} input
 * @param {RawSourceMap | undefined} sourceMap
 * @param {InternalPredefinedMinimizerOptions & TerserMinifyOptions} minimizerOptions
 * @param {ExtractCommentsOptions | undefined} extractComments
 * @return {Promise<MinifyResult>}
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
  // Copy `terser` options
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
  const minified = await minify({ [filename]: code }, terserOptions);

  return {
    code: /** @type {string} **/ (minified.code),
    // @ts-ignore
    // eslint-disable-next-line no-undefined
    map: minified.map ? /** @type {RawSourceMap} **/ (minified.map) : undefined,
    extractedComments,
  };
}

/* istanbul ignore next */
/**
 * @param {Input} input
 * @param {RawSourceMap | undefined} sourceMap
 * @param {InternalPredefinedMinimizerOptions & UglifyJSMinifyOptions} minimizerOptions
 * @param {ExtractCommentsOptions | undefined} extractComments
 * @return {Promise<MinifyResult>}
 */
async function uglifyJsMinify(
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
   * @param {NormalizedUglifyJSMinifyOptions} uglifyJsOptions
   * @param {ExtractedComments} extractedComments
   * @returns {ExtractCommentsFunction}
   */
  const buildComments = (uglifyJsOptions, extractedComments) => {
    /** @type {{ [index: string]: ExtractCommentsCondition }} */
    const condition = {};
    const { comments } = uglifyJsOptions.output;

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
   * @param {UglifyJSMinifyOptions} [uglifyJsOptions={}]
   * @returns {NormalizedUglifyJSMinifyOptions}
   */
  const buildUglifyJsOptions = (uglifyJsOptions = {}) => {
    // Need deep copy objects to avoid https://github.com/terser/terser/issues/366
    return {
      ...uglifyJsOptions,
      // warnings: uglifyJsOptions.warnings,
      parse: { ...uglifyJsOptions.parse },
      compress:
        typeof uglifyJsOptions.compress === "boolean"
          ? uglifyJsOptions.compress
          : { ...uglifyJsOptions.compress },
      mangle:
        uglifyJsOptions.mangle == null
          ? true
          : typeof uglifyJsOptions.mangle === "boolean"
          ? uglifyJsOptions.mangle
          : { ...uglifyJsOptions.mangle },
      output: { beautify: false, ...uglifyJsOptions.output },
      // Ignoring sourceMap from options
      // eslint-disable-next-line no-undefined
      sourceMap: undefined,
      // toplevel: uglifyJsOptions.toplevel
      // nameCache: { ...uglifyJsOptions.toplevel },
      // ie8: uglifyJsOptions.ie8,
      // keep_fnames: uglifyJsOptions.keep_fnames,
    };
  };

  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  const { minify } = require("uglify-js");

  // eslint-disable-next-line no-param-reassign
  delete minimizerOptions.ecma;
  // eslint-disable-next-line no-param-reassign
  delete minimizerOptions.module;

  // Copy `uglify-js` options
  const uglifyJsOptions = buildUglifyJsOptions(minimizerOptions);

  // Let terser generate a SourceMap
  if (sourceMap) {
    // @ts-ignore
    uglifyJsOptions.sourceMap = true;
  }

  /** @type {ExtractedComments} */
  const extractedComments = [];

  // @ts-ignore
  uglifyJsOptions.output.comments = buildComments(
    uglifyJsOptions,
    extractedComments
  );

  const [[filename, code]] = Object.entries(input);
  const minified = await minify({ [filename]: code }, uglifyJsOptions);

  return {
    code: /** @type {string} **/ (minified.code || code),
    // eslint-disable-next-line no-undefined
    map: minified.map ? JSON.parse(minified.map) : undefined,
    errors: minified.error ? [minified.error] : [],
    warnings: minified.warnings || [],
    extractedComments,
  };
}

/* istanbul ignore next */
/**
 * @param {Input} input
 * @param {RawSourceMap | undefined} sourceMap
 * @param {InternalPredefinedMinimizerOptions & SwcMinifyOptions} minimizerOptions
 * @return {Promise<MinifyResult>}
 */
async function swcMinify(input, sourceMap, minimizerOptions) {
  /**
   * @param {SwcMinifyOptions} [swcOptions={}]
   * @returns {NormalizedSwcMinifyOptions}
   */
  const buildSwcOptions = (swcOptions = {}) => {
    // Need deep copy objects to avoid https://github.com/terser/terser/issues/366
    return {
      ...swcOptions,
      compress:
        typeof swcOptions.compress === "boolean"
          ? swcOptions.compress
          : { ...swcOptions.compress },
      mangle:
        swcOptions.mangle == null
          ? true
          : typeof swcOptions.mangle === "boolean"
          ? swcOptions.mangle
          : { ...swcOptions.mangle },
      // ecma: swcOptions.ecma,
      // keep_classnames: swcOptions.keep_classnames,
      // keep_fnames: swcOptions.keep_fnames,
      // module: swcOptions.module,
      // safari10: swcOptions.safari10,
      // toplevel: swcOptions.toplevel
      // eslint-disable-next-line no-undefined
      sourceMap: undefined,
    };
  };

  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  const swc = require("@swc/core");
  // Copy `swc` options
  const swcOptions = buildSwcOptions(minimizerOptions);

  // Let `swc` generate a SourceMap
  if (sourceMap) {
    // @ts-ignore
    swcOptions.sourceMap = true;
  }

  const [[, code]] = Object.entries(input);
  const minified = await swc.minify(code, swcOptions);

  return {
    code: minified.code,
    // eslint-disable-next-line no-undefined
    map: minified.map ? JSON.parse(minified.map) : undefined,
  };
}

/* istanbul ignore next */
/**
 * @param {Input} input
 * @param {RawSourceMap | undefined} sourceMap
 * @param {InternalPredefinedMinimizerOptions & EsbuildMinifyOptions} minimizerOptions
 * @return {Promise<MinifyResult>}
 */
async function esbuildMinify(input, sourceMap, minimizerOptions) {
  /**
   * @param {EsbuildMinifyOptions} [esbuildOptions={}]
   * @returns {EsbuildMinifyOptions}
   */
  const buildEsbuildOptions = (esbuildOptions = {}) => {
    // Need deep copy objects to avoid https://github.com/terser/terser/issues/366
    return {
      minify: true,
      legalComments: "inline",
      ...esbuildOptions,
      sourcemap: false,
    };
  };

  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  const esbuild = require("esbuild");

  // eslint-disable-next-line no-param-reassign
  delete minimizerOptions.ecma;

  if (minimizerOptions.module) {
    // eslint-disable-next-line no-param-reassign
    minimizerOptions.format = "esm";
  }

  // eslint-disable-next-line no-param-reassign
  delete minimizerOptions.module;

  // Copy `swc` options
  const esbuildOptions = buildEsbuildOptions(minimizerOptions);

  // Let `swc` generate a SourceMap
  if (sourceMap) {
    esbuildOptions.sourcemap = true;
  }

  const [[, code]] = Object.entries(input);
  const minified = await esbuild.transform(code, esbuildOptions);

  return {
    code: minified.code,
    // eslint-disable-next-line no-undefined
    map: minified.map ? JSON.parse(minified.map) : undefined,
    warnings: minified.warnings
      ? minified.warnings.map((item) => item.toString())
      : [],
  };
}

export { terserMinify, uglifyJsMinify, swcMinify, esbuildMinify };
