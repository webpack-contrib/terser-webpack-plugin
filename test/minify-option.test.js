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

  it('should snapshot for the "uglify-js" minifier', async () => {
    const compiler = getCompiler({
      entry: `${__dirname}/fixtures/minify/es5.js`,
      output: {
        ecmaVersion: 5,
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

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should snapshot snapshot for the "uglify-js" minifier with extracting comments', async () => {
    const compiler = getCompiler({
      entry: `${__dirname}/fixtures/minify/es5.js`,
      output: {
        ecmaVersion: 5,
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

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should snapshot for the "terser" minifier', async () => {
    const compiler = getCompiler({
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

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should snapshot snapshot for "terser" minifier when the "sourceMap" option is "true"', async () => {
    const compiler = getCompiler({
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

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should snapshot for the "terser" minifier when the "parallel" option is "true"', async () => {
    const compiler = getCompiler({
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

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should snapshot for errors into the "minify" option', async () => {
    const compiler = getCompiler({
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

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should snapshot for errors into the "minify" option when the "parallel" option is "true"', async () => {
    const compiler = getCompiler({
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

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });
});
