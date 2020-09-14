import path from 'path';

import TerserPlugin from '../src';

import {
  compile,
  getCompiler,
  getErrors,
  getWarnings,
  readsAssets,
  removeCache,
} from './helpers';

describe('minify option', () => {
  beforeEach(() => Promise.all([removeCache()]));

  afterEach(() => Promise.all([removeCache()]));

  it('should work', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, './fixtures/minify/es6.js'),
      output: {
        path: path.resolve(__dirname, './dist-terser'),
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new TerserPlugin({
      terserOptions: {
        keep_fnames: true,
        mangle: {
          reserved: ['baz'],
        },
      },
      minify(file, inputSourceMap, minimizerOptions) {
        // eslint-disable-next-line global-require
        return require('terser').minify(file, minimizerOptions);
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work when the "parallel" option is "true"', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, './fixtures/minify/es6.js'),
      output: {
        path: path.resolve(__dirname, './dist-terser'),
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new TerserPlugin({
      parallel: true,
      minify(file, inputSourceMap, minimizerOptions) {
        // eslint-disable-next-line global-require
        return require('terser').minify(file, minimizerOptions);
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work when the "parallel" option is "false"', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, './fixtures/minify/es6.js'),
      output: {
        path: path.resolve(__dirname, './dist-terser'),
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new TerserPlugin({
      parallel: false,
      minify(file, inputSourceMap, minimizerOptions) {
        // eslint-disable-next-line global-require
        return require('terser').minify(file, minimizerOptions);
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw an error when an error', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, './fixtures/minify/es6.js'),
      output: {
        path: path.resolve(__dirname, './dist-terser'),
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new TerserPlugin({
      minify() {
        throw Error('Error');
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw an error when an error when the "parallel" option is "true"', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, './fixtures/minify/es6.js'),
      output: {
        path: path.resolve(__dirname, './dist-terser'),
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new TerserPlugin({
      parallel: true,
      minify: () => {
        throw Error('Error');
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw an error when an error when the "parallel" option is "false"', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, './fixtures/minify/es6.js'),
      output: {
        path: path.resolve(__dirname, './dist-terser'),
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new TerserPlugin({
      parallel: false,
      minify: () => {
        throw Error('Error');
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should snapshot with extracting comments', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, './fixtures/minify/es5.js'),
      output: {
        path: path.resolve(__dirname, './dist-uglify-js'),
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new TerserPlugin({
      extractComments: true,
      async minify(file) {
        // eslint-disable-next-line global-require
        const result = await require('terser').minify(file, {
          mangle: {
            reserved: ['baz'],
          },
        });

        return { ...result, extractedComments: ['/* Foo */'] };
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with source maps', async () => {
    const compiler = getCompiler({
      devtool: 'source-map',
      entry: path.resolve(__dirname, './fixtures/minify/es6.js'),
      output: {
        path: path.resolve(__dirname, './dist-terser'),
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new TerserPlugin({
      sourceMap: true,
      minify(file, sourceMap) {
        const terserOption = {
          mangle: {
            reserved: ['baz'],
          },
        };

        if (sourceMap) {
          terserOption.sourceMap = {
            content: sourceMap,
          };
        }

        // eslint-disable-next-line global-require
        return require('terser').minify(file, terserOption);
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with "uglify-js" minimizer', async () => {
    const compiler = getCompiler({
      ...(getCompiler.isWebpack4() ? {} : { target: ['es5', 'web'] }),
      entry: path.resolve(__dirname, './fixtures/minify/es5.js'),
      output: {
        path: path.resolve(__dirname, './dist-uglify-js'),
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new TerserPlugin({
      minify(file) {
        // eslint-disable-next-line global-require
        return require('uglify-js').minify(file, {
          mangle: {
            reserved: ['baz'],
          },
        });
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with "terser" minimizer', async () => {
    const compiler = getCompiler({
      entry: path.resolve(__dirname, './fixtures/minify/es6.js'),
      output: {
        path: path.resolve(__dirname, './dist-terser'),
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new TerserPlugin({
      minify(file) {
        // eslint-disable-next-line global-require
        return require('terser').minify(file, {
          mangle: {
            reserved: ['baz'],
          },
        });
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });
});
