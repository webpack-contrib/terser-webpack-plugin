const { minify: terserMinify } = require('terser');

const buildTerserOptions = ({
  ecma,
  warnings,
  parse = {},
  compress = {},
  mangle,
  module,
  output,
  toplevel,
  nameCache,
  ie8,
  /* eslint-disable camelcase */
  keep_classnames,
  keep_fnames,
  /* eslint-enable camelcase */
  safari10,
} = {}) => ({
  ecma,
  warnings,
  parse: { ...parse },
  compress: typeof compress === 'boolean' ? compress : { ...compress },
  // eslint-disable-next-line no-nested-ternary
  mangle:
    mangle == null
      ? true
      : typeof mangle === 'boolean'
      ? mangle
      : { ...mangle },
  output: {
    beautify: false,
    ...output,
  },
  module,
  // Ignoring sourceMap from options
  sourceMap: null,
  toplevel,
  nameCache,
  ie8,
  keep_classnames,
  keep_fnames,
  safari10,
});

function isObject(value) {
  const type = typeof value;

  return value != null && (type === 'object' || type === 'function');
}

const buildComments = (options, terserOptions, extractedComments) => {
  const condition = {};
  const commentsOpts = terserOptions.output.comments;
  const { extractComments } = options;

  condition.preserve =
    typeof commentsOpts !== 'undefined' ? commentsOpts : false;

  if (typeof extractComments === 'boolean' && extractComments) {
    condition.extract = 'some';
  } else if (
    typeof extractComments === 'string' ||
    extractComments instanceof RegExp
  ) {
    condition.extract = extractComments;
  } else if (typeof extractComments === 'function') {
    condition.extract = extractComments;
  } else if (isObject(extractComments)) {
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
    // Todo remove this in next major release
    condition.preserve =
      typeof commentsOpts !== 'undefined' ? commentsOpts : 'some';
    condition.extract = false;
  }

  // Ensure that both conditions are functions
  ['preserve', 'extract'].forEach((key) => {
    let regexStr;
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
          condition[key] = (astNode, comment) => {
            return (
              comment.type === 'comment2' &&
              /^\**!|@preserve|@license|@cc_on/i.test(comment.value)
            );
          };

          break;
        }

        regexStr = condition[key];

        condition[key] = (astNode, comment) => {
          return new RegExp(regexStr).test(comment.value);
        };

        break;
      default:
        regex = condition[key];

        condition[key] = (astNode, comment) => regex.test(comment.value);
    }
  });

  // Redefine the comments function to extract and preserve
  // comments according to the two conditions
  return (astNode, comment) => {
    if (condition.extract(astNode, comment)) {
      const commentText =
        comment.type === 'comment2'
          ? `/*${comment.value}*/`
          : `//${comment.value}`;

      // Don't include duplicate comments
      if (!extractedComments.includes(commentText)) {
        extractedComments.push(commentText);
      }
    }

    return condition.preserve(astNode, comment);
  };
};

const minify = (options) => {
  const { file, input, inputSourceMap, minify: minifyFn } = options;

  if (minifyFn) {
    return minifyFn({ [file]: input }, inputSourceMap);
  }

  // Copy terser options
  const terserOptions = buildTerserOptions(options.terserOptions);

  // Let terser generate a SourceMap
  if (inputSourceMap) {
    terserOptions.sourceMap = true;
  }

  const extractedComments = [];

  terserOptions.output.comments = buildComments(
    options,
    terserOptions,
    extractedComments
  );

  const { error, map, code, warnings } = terserMinify(
    { [file]: input },
    terserOptions
  );

  return { error, map, code, warnings, extractedComments };
};

module.exports = minify;
