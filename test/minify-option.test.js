import TerserPlugin from '../src';

import {
  cleanErrorStack,
  compile,
  createCompiler,
  getAssets,
  removeCache,
} from './helpers';

// Based on https://github.com/facebook/jest/blob/edde20f75665c2b1e3c8937f758902b5cf28a7b4/packages/jest-runner/src/__tests__/test_runner.test.js

jest.mock('worker-farm', () => {
  const mock = jest.fn((options, worker) =>
    jest.fn((data, callback) =>
      // eslint-disable-next-line global-require, import/no-dynamic-require
      require(worker)(data, callback)
    )
  );

  mock.end = jest.fn();

  return mock;
});

describe('minify option', () => {
  beforeEach(() => Promise.all([removeCache()]));

  afterEach(() => Promise.all([removeCache()]));

  it('should snapshot for the "uglify-js" minifier', async () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/minify/es5.js`,
      output: {
        path: `${__dirname}/dist-uglify-js`,
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

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should snapshot snapshot for the "uglify-js" minifier with extracting comments', async () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/minify/es5.js`,
      output: {
        path: `${__dirname}/dist-uglify-js`,
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new TerserPlugin({
      extractComments: true,
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

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should snapshot for the "terser" minifier', async () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/minify/es6.js`,
      output: {
        path: `${__dirname}/dist-terser`,
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

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should snapshot snapshot for "terser" minifier when the "sourceMap" option is "true"', async () => {
    const compiler = createCompiler({
      devtool: 'source-map',
      entry: `${__dirname}/fixtures/minify/es6.js`,
      output: {
        path: `${__dirname}/dist-terser`,
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

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should snapshot for the "terser" minifier when the "parallel" option is "true"', async () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/minify/es6.js`,
      output: {
        path: `${__dirname}/dist-terser`,
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new TerserPlugin({
      parallel: true,
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

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should snapshot for errors into the "minify" option', async () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/minify/es6.js`,
      output: {
        path: `${__dirname}/dist-terser`,
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

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
  });

  it('should snapshot for errors into the "minify" option when the "parallel" option is "true"', async () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/minify/es6.js`,
      output: {
        path: `${__dirname}/dist-terser`,
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

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
  });
});
