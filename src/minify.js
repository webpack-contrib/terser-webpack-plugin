/** @typedef {import("./index.js").InternalMinifyOptions} InternalMinifyOptions */
/** @typedef {import("./index.js").MinifyResult} MinifyResult */
/** @typedef {import("source-map").RawSourceMap} RawSourceMap */

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
  const result = { code: options.input };

  /**
   * @param {RawSourceMap | undefined} oldMap
   * @param {RawSourceMap | undefined} newMap
   * @returns {RawSourceMap | undefined}
   */
  const mergeSourceMap = (oldMap, newMap) => {
    if (!oldMap) {
      return newMap;
    }

    if (!newMap) {
      return oldMap;
    }

    // eslint-disable-next-line global-require
    const sourceMap = require("source-map");
    const oldMapConsumer = new sourceMap.SourceMapConsumer(oldMap);
    const newMapConsumer = new sourceMap.SourceMapConsumer(newMap);
    const mergedMapGenerator = new sourceMap.SourceMapGenerator();

    newMapConsumer.eachMapping((m) => {
      // pass when `originalLine` is null.
      // It occurs in case that the node does not have origin in original code.
      if (m.originalLine == null) {
        return;
      }

      const origPosInOldMap = oldMapConsumer.originalPositionFor({
        line: m.originalLine,
        column: m.originalColumn,
      });

      if (origPosInOldMap.source == null) {
        return;
      }

      mergedMapGenerator.addMapping({
        original: {
          line: origPosInOldMap.line,
          column: origPosInOldMap.column,
        },
        generated: {
          line: m.generatedLine,
          column: m.generatedColumn,
        },
        source: origPosInOldMap.source,
        name: origPosInOldMap.name,
      });
    });

    const consumers = [oldMapConsumer, newMapConsumer];

    consumers.forEach((consumer) => {
      // @ts-ignore
      consumer.sources.forEach(
        /**
         * @param {string} sourceFile
         */
        (sourceFile) => {
          // @ts-ignore
          // eslint-disable-next-line no-underscore-dangle
          mergedMapGenerator._sources.add(sourceFile);

          const sourceContent = consumer.sourceContentFor(sourceFile);

          if (sourceContent != null) {
            mergedMapGenerator.setSourceContent(sourceFile, sourceContent);
          }
        }
      );
    });

    const merged = JSON.parse(mergedMapGenerator.toString());

    merged.sourceRoot = oldMap.sourceRoot;
    merged.file = oldMap.file;

    return merged;
  };

  const { inputSourceMap } = options;

  for (let i = 0; i <= minifyFns.length - 1; i++) {
    const minifyFn = minifyFns[i];
    const minifyOptions = Array.isArray(options.minimizerOptions)
      ? options.minimizerOptions[i]
      : options.minimizerOptions;

    // eslint-disable-next-line no-await-in-loop
    const minifyResult = await minifyFn(
      { [options.name]: result.code },
      result.map || inputSourceMap,
      minifyOptions,
      options.extractComments
    );

    result.code = minifyResult.code;

    if (minifyResult.map) {
      result.map = mergeSourceMap(inputSourceMap, minifyResult.map);
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
