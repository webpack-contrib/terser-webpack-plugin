import TerserPlugin from '../src/index';

import { cleanErrorStack, createCompiler, compile, getAssets } from './helpers';

describe('test option', () => {
  let compiler;

  beforeEach(() => {
    compiler = createCompiler({
      entry: {
        js: `${__dirname}/fixtures/entry.js`,
        mjs: `${__dirname}/fixtures/entry.mjs`,
        importExport: `${__dirname}/fixtures/import-export/entry.js`,
        AsyncImportExport: `${__dirname}/fixtures/async-import-export/entry.js`,
      },
      output: {
        path: `${__dirname}/dist`,
        filename: '[name].js?var=[hash]',
        chunkFilename: '[id].[name].js?ver=[hash]',
      },
    });
  });

  it('should match snapshot with empty value', async () => {
    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for a single `test` value ({RegExp})', async () => {
    new TerserPlugin({
      test: /(m)?js\.js(\?.*)?$/i,
    }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for a single "test" value ({String})', async () => {
    new TerserPlugin({
      test: 'js.js',
    }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for multiple "test" values ({RegExp})', async () => {
    new TerserPlugin({
      test: [/(m)?js\.js(\?.*)?$/i, /AsyncImportExport\.js(\?.*)?$/i],
    }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for multiple "test" values ({String})', async () => {
    new TerserPlugin({
      test: ['js.js', 'AsyncImportExport.js'],
    }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot and uglify "mjs"', async () => {
    compiler = createCompiler({
      entry: {
        js: `${__dirname}/fixtures/entry.js`,
        mjs: `${__dirname}/fixtures/entry.mjs`,
        importExport: `${__dirname}/fixtures/import-export/entry.js`,
        AsyncImportExport: `${__dirname}/fixtures/async-import-export/entry.js`,
      },
      output: {
        path: `${__dirname}/dist`,
        filename: '[name].mjs?var=[hash]',
        chunkFilename: '[id].[name].mjs?ver=[hash]',
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
});
