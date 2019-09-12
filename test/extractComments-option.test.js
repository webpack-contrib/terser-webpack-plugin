import TerserPlugin from '../src/index';

import {
  cleanErrorStack,
  compile,
  createCompiler,
  getAssets,
  removeCache,
} from './helpers';

describe('extractComments option', () => {
  let compiler;

  beforeEach(() => {
    compiler = createCompiler({
      entry: {
        one: `${__dirname}/fixtures/comments.js`,
        two: `${__dirname}/fixtures/comments-2.js`,
        three: `${__dirname}/fixtures/comments-3.js`,
        four: `${__dirname}/fixtures/comments-4.js`,
      },
      output: {
        filename: 'filename/[name].[chunkhash].js',
        chunkFilename: 'chunks/[id].[name].[chunkhash].js',
      },
    });

    return Promise.all([removeCache()]);
  });

  afterEach(() => Promise.all([removeCache()]));

  it('should match snapshot when a value is not specify', async () => {
    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for the "false" value', async () => {
    new TerserPlugin({ extractComments: false }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for the "true" value', async () => {
    new TerserPlugin({ extractComments: true }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for the "/Foo/" value', async () => {
    new TerserPlugin({ extractComments: /Foo/ }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for the "all" value', async () => {
    new TerserPlugin({ extractComments: 'all' }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for the "some" value', async () => {
    new TerserPlugin({ extractComments: 'some' }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for the "Foo" value', async () => {
    new TerserPlugin({ extractComments: 'Foo' }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for a "function" value', async () => {
    new TerserPlugin({ extractComments: () => true }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for the "extractComments.condition" with the "true" value', async () => {
    new TerserPlugin({
      extractComments: {
        condition: true,
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot when extracts comments to multiple files', async () => {
    expect.assertions(13);

    new TerserPlugin({
      extractComments: {
        condition: true,
        filename: (file, fileData) => {
          expect(file).toBeDefined();
          expect(fileData).toBeDefined();

          return file.replace(/(\.\w+)$/, '.license$1');
        },
        banner: (licenseFile) => {
          return `License information can be found in ${licenseFile}`;
        },
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot when extracts comments to a single file', async () => {
    new TerserPlugin({
      extractComments: {
        condition: true,
        filename: 'extracted-comments.js',
        banner(licenseFile) {
          return `License information can be found in ${licenseFile}`;
        },
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot when extracts without condition', async () => {
    new TerserPlugin({
      extractComments: {
        condition: true,
        filename: 'extracted-comments.js',
        banner(licenseFile) {
          return `License information can be found in ${licenseFile}`;
        },
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for the `true` value and preserve "@license" comments', async () => {
    new TerserPlugin({
      terserOptions: {
        output: {
          comments: /@license/i,
        },
      },
      extractComments: true,
    }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot when no condition, extracts only `/@license/i` comments', async () => {
    expect.assertions(13);

    new TerserPlugin({
      terserOptions: {
        output: {
          comments: /@license/i,
        },
      },
      extractComments: {
        filename: (file, fileData) => {
          expect(file).toBeDefined();
          expect(fileData).toBeDefined();

          return file.replace(/(\.\w+)$/, '.license$1');
        },
        banner: (licenseFile) => {
          return `License information can be found in ${licenseFile}`;
        },
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for the `true` value and dedupe duplicate comments', async () => {
    new TerserPlugin({ extractComments: true }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot when extracts comments to a single file and dedupe duplicate comments', async () => {
    new TerserPlugin({
      extractComments: {
        condition: true,
        filename: 'extracted-comments.js',
        banner(licenseFile) {
          return `License information can be found in ${licenseFile}`;
        },
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot when extracts comments to files with query string', async () => {
    compiler = createCompiler({
      entry: {
        one: `${__dirname}/fixtures/comments.js`,
        two: `${__dirname}/fixtures/comments-2.js`,
        three: `${__dirname}/fixtures/comments-3.js`,
        four: `${__dirname}/fixtures/comments-4.js`,
      },
      output: {
        filename: 'filename/[name].js?[chunkhash]',
        chunkFilename: 'chunks/[id].[name].js?[chunkhash]',
      },
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot when extracts comments to files with query string and with placeholders', async () => {
    compiler = createCompiler({
      entry: {
        one: `${__dirname}/fixtures/comments.js`,
        two: `${__dirname}/fixtures/comments-2.js`,
        three: `${__dirname}/fixtures/comments-3.js`,
        four: `${__dirname}/fixtures/comments-4.js`,
      },
      output: {
        filename: 'filename/[name].js?[chunkhash]',
        chunkFilename: 'chunks/[id].[name].js?[chunkhash]',
      },
    });

    new TerserPlugin({
      extractComments: {
        condition: true,
        filename: '[file].LICENSE?query=[query]&filebase=[filebase]',
        banner(licenseFile) {
          return `License information can be found in ${licenseFile}`;
        },
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot when extracts comments to files with query string and when filename is a function', async () => {
    expect.assertions(13);

    compiler = createCompiler({
      entry: {
        one: `${__dirname}/fixtures/comments.js`,
        two: `${__dirname}/fixtures/comments-2.js`,
        three: `${__dirname}/fixtures/comments-3.js`,
        four: `${__dirname}/fixtures/comments-4.js`,
      },
      output: {
        filename: 'filename/[name].js?[chunkhash]',
        chunkFilename: 'chunks/[id].[name].js?[chunkhash]',
      },
    });

    new TerserPlugin({
      extractComments: {
        condition: true,
        filename: (file, fileData) => {
          expect(file).toBeDefined();
          expect(fileData).toBeDefined();

          // A file can contain a query string (for example when you have `output.filename: '[name].js?[chunkhash]'`)
          // You must consider this
          return file.replace(/\.(\w+)($|\?)/, '.$1.LICENSE$2');
        },
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });
});
