import path from 'path';

import webpack from 'webpack';

import TerserPlugin from '../src/index';

import {
  compile,
  getCompiler,
  getErrors,
  getWarnings,
  readsAssets,
  removeCache,
  ExistingCommentsFile,
} from './helpers';

function createFilenameFn() {
  return (fileData) => {
    expect(fileData).toBeDefined();

    // A file can contain a query string (for example when you have `output.filename: '[name].js?[chunkhash]'`)
    // You must consider this
    return `${fileData.filename}.LICENSE.txt${fileData.query}`;
  };
}

describe('extractComments option', () => {
  let compiler;

  beforeEach(() => {
    compiler = getCompiler({
      entry: {
        one: path.resolve(__dirname, './fixtures/comments.js'),
        two: path.resolve(__dirname, './fixtures/comments-2.js'),
        three: path.resolve(__dirname, './fixtures/comments-3.js'),
        four: path.resolve(__dirname, './fixtures/comments-4.js'),
      },
      output: {
        filename: 'filename/[name].js',
        chunkFilename: 'chunks/[id].[name].js',
      },
    });

    return Promise.all([removeCache()]);
  });

  afterEach(() => Promise.all([removeCache()]));

  it('should match snapshot when a value is not specify', async () => {
    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot for the "false" value', async () => {
    new TerserPlugin({ extractComments: false }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot for the "true" value', async () => {
    new TerserPlugin({ extractComments: true }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot for the "/Foo/" value', async () => {
    new TerserPlugin({ extractComments: /Foo/ }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot for the "all" value', async () => {
    new TerserPlugin({ extractComments: 'all' }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot for the "some" value', async () => {
    new TerserPlugin({ extractComments: 'some' }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot for the "Foo" value', async () => {
    new TerserPlugin({ extractComments: 'Foo' }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot for a "function" value', async () => {
    new TerserPlugin({ extractComments: () => true }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot for the "extractComments.condition" with the "true" value', async () => {
    new TerserPlugin({
      extractComments: {
        condition: true,
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot when extracts comments to multiple files', async () => {
    expect.assertions(8);

    new TerserPlugin({
      extractComments: {
        condition: true,
        filename: createFilenameFn(),
        banner: (licenseFile) => {
          return `License information can be found in ${licenseFile}`;
        },
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
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

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
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

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
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

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot when no condition, preserve only `/@license/i` comments and extract "some" comments', async () => {
    expect.assertions(8);

    new TerserPlugin({
      terserOptions: {
        output: {
          comments: /@license/i,
        },
      },
      extractComments: {
        filename: createFilenameFn(),
        banner: (licenseFile) => {
          return `License information can be found in ${licenseFile}`;
        },
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot for the `true` value and dedupe duplicate comments', async () => {
    new TerserPlugin({ extractComments: true }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
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

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot when extracts comments to files with query string', async () => {
    compiler = getCompiler({
      entry: {
        one: path.resolve(__dirname, './fixtures/comments.js'),
        two: path.resolve(__dirname, './fixtures/comments-2.js'),
        three: path.resolve(__dirname, './fixtures/comments-3.js'),
        four: path.resolve(__dirname, './fixtures/comments-4.js'),
      },
      output: {
        filename: 'filename/[name].js?[chunkhash]',
        chunkFilename: 'chunks/[id].[name].js?[chunkhash]',
      },
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot when extracts comments to files with query string and with placeholders', async () => {
    compiler = getCompiler({
      entry: {
        one: path.resolve(__dirname, './fixtures/comments.js'),
        two: path.resolve(__dirname, './fixtures/comments-2.js'),
        three: path.resolve(__dirname, './fixtures/comments-3.js'),
        four: path.resolve(__dirname, './fixtures/comments-4.js'),
      },
      output: {
        filename: 'filename/[name].js?[chunkhash]',
        chunkFilename: 'chunks/[id].[name].js?[chunkhash]',
      },
    });

    new TerserPlugin({
      extractComments: {
        condition: true,
        filename: `[file].LICENSE.txt?query=[query]&filebase=[${
          getCompiler.isWebpack4() ? 'filebase' : 'base'
        }]`,
        banner(licenseFile) {
          return `License information can be found in ${licenseFile}`;
        },
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot when extracts comments to files with query string and when filename is a function', async () => {
    expect.assertions(8);

    compiler = getCompiler({
      entry: {
        one: path.resolve(__dirname, './fixtures/comments.js'),
        two: path.resolve(__dirname, './fixtures/comments-2.js'),
        three: path.resolve(__dirname, './fixtures/comments-3.js'),
        four: path.resolve(__dirname, './fixtures/comments-4.js'),
      },
      output: {
        filename: 'filename/[name].js?[chunkhash]',
        chunkFilename: 'chunks/[id].[name].js?[chunkhash]',
      },
    });

    new TerserPlugin({
      extractComments: {
        condition: true,
        filename: createFilenameFn(),
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot for nested comment file', async () => {
    compiler = getCompiler({
      entry: {
        one: path.resolve(__dirname, './fixtures/comments.js'),
      },
    });

    new TerserPlugin({
      extractComments: {
        condition: true,
        filename: 'comments/directory/one.js',
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot for comment file when filename is nested', async () => {
    compiler = getCompiler({
      entry: {
        one: path.resolve(__dirname, './fixtures/comments.js'),
      },
      output: {
        filename: 'nested/directory/[name].js?[chunkhash]',
      },
    });

    new TerserPlugin({
      extractComments: {
        condition: true,
        filename: 'one.js',
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot and extract "some" comments', async () => {
    new TerserPlugin({
      extractComments: true,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot and preserve "all" and extract "some" comments', async () => {
    new TerserPlugin({
      extractComments: true,
      terserOptions: {
        output: {
          comments: 'all',
        },
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot and do not preserve and extract "all" comments', async () => {
    new TerserPlugin({
      extractComments: 'all',
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot and preserve "all" and extract "all" comments', async () => {
    new TerserPlugin({
      extractComments: 'all',
      terserOptions: {
        output: {
          comments: 'all',
        },
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot and do not preserve and extract "all" comments', async () => {
    new TerserPlugin({
      extractComments: () => true,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot and preserve "all" and extract "all" comments', async () => {
    new TerserPlugin({
      extractComments: () => true,
      terserOptions: {
        output: {
          comments: 'all',
        },
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot and do not preserve and extract "some" comments', async () => {
    new TerserPlugin({
      extractComments: {},
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot and preserve "all" and extract "some" comments', async () => {
    new TerserPlugin({
      extractComments: {},
      terserOptions: {
        output: {
          comments: 'all',
        },
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot and preserve "all" and extract "some" comments', async () => {
    new TerserPlugin({
      extractComments: {
        condition: 'some',
      },
      terserOptions: {
        output: {
          comments: 'all',
        },
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot and preserve "all" and do not extract comments', async () => {
    new TerserPlugin({
      extractComments: {
        condition: false,
      },
      terserOptions: {
        output: {
          comments: 'all',
        },
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot and preserve "some" do not extract comments', async () => {
    new TerserPlugin({
      extractComments: false,
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot and preserve "all" do not extract comments', async () => {
    new TerserPlugin({
      extractComments: false,
      terserOptions: {
        output: {
          comments: 'all',
        },
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot and do not preserve or extract comments', async () => {
    new TerserPlugin({
      extractComments: false,
      terserOptions: {
        output: {
          comments: false,
        },
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot and keep shebang', async () => {
    compiler = getCompiler({
      entry: {
        shebang: path.resolve(__dirname, './fixtures/shebang.js'),
        shebang1: path.resolve(__dirname, './fixtures/shebang-1.js'),
      },
      target: 'node',
      plugins: [
        new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
      ],
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with the existing licenses file', async () => {
    new ExistingCommentsFile().apply(compiler);
    new TerserPlugin({
      extractComments: {
        filename: 'licenses.txt',
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });
});
