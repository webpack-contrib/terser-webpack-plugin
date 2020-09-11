import path from 'path';

import TerserPlugin from '../src/index';

import {
  compile,
  getCompiler,
  getErrors,
  getWarnings,
  readsAssets,
  removeCache,
} from './helpers';

describe('test option', () => {
  let compiler;

  beforeEach(() => {
    compiler = getCompiler({
      entry: {
        js: path.resolve(__dirname, './fixtures/entry.js'),
        mjs: path.resolve(__dirname, './fixtures/entry.mjs'),
        importExport: path.resolve(
          __dirname,
          './fixtures/import-export/entry.js'
        ),
        AsyncImportExport: path.resolve(
          __dirname,
          './fixtures/async-import-export/entry.js'
        ),
      },
      output: {
        path: path.resolve(__dirname, './dist'),
        filename: `[name].js?var=[${
          getCompiler.isWebpack4() ? 'hash' : 'fullhash'
        }]`,
        chunkFilename: `[id].[name].js?ver=[${
          getCompiler.isWebpack4() ? 'hash' : 'fullhash'
        }]`,
      },
    });

    return Promise.all([removeCache()]);
  });

  afterEach(() => Promise.all([removeCache()]));

  it('should match snapshot with empty value', async () => {
    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot for a single `test` value ({RegExp})', async () => {
    new TerserPlugin({
      test: /(m)?js\.js(\?.*)?$/i,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot for a single "test" value ({String})', async () => {
    new TerserPlugin({
      test: 'js.js',
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot for multiple "test" values ({RegExp})', async () => {
    new TerserPlugin({
      test: [/(m)?js\.js(\?.*)?$/i, /AsyncImportExport\.js(\?.*)?$/i],
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot for multiple "test" values ({String})', async () => {
    new TerserPlugin({
      test: ['js.js', 'AsyncImportExport.js'],
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot and uglify "mjs"', async () => {
    compiler = getCompiler({
      entry: {
        js: path.resolve(__dirname, './fixtures/entry.js'),
        mjs: path.resolve(__dirname, './fixtures/entry.mjs'),
        importExport: path.resolve(
          __dirname,
          './fixtures/import-export/entry.js'
        ),
        AsyncImportExport: path.resolve(
          __dirname,
          './fixtures/async-import-export/entry.js'
        ),
      },
      output: {
        path: path.resolve(__dirname, './dist'),
        filename: `[name].mjs?var=[${
          getCompiler.isWebpack4() ? 'hash' : 'fullhash'
        }]`,
        chunkFilename: `[id].[name].mjs?ver=[${
          getCompiler.isWebpack4() ? 'hash' : 'fullhash'
        }]`,
      },
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });
});
