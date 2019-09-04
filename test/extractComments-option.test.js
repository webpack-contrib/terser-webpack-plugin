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
    new TerserPlugin({
      extractComments: {
        condition: true,
        filename(file) {
          return file.replace(/(\.\w+)$/, '.license$1');
        },
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
    new TerserPlugin({
      terserOptions: {
        output: {
          comments: /@license/i,
        },
      },
      extractComments: {
        filename(file) {
          return file.replace(/(\.\w+)$/, '.license$1');
        },
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
});
