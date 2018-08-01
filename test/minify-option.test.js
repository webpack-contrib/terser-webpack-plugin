import path from 'path';

import TerserPlugin from '../src';

import { cleanErrorStack, compile, createCompiler } from './helpers';

describe('when applied with `minify` option', () => {
  it('matches snapshot for `uglify-js` minifier', () => {
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

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (
          Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
        ) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
    });
  });

  it('matches snapshot for `terser` minifier', () => {
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

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (
          Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
        ) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
    });
  });

  it('matches snapshot for `terser` minifier and `sourceMap` is `true`', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/minify/es6.js`,
      output: {
        path: `${__dirname}/dist-terser`,
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    function removeAbsoluteSourceMapSources(source) {
      if (source.map && source.map.sources) {
        // eslint-disable-next-line no-param-reassign
        source.map.sources = source.map.sources.map((sourceFromMap) =>
          path.relative(process.cwd(), sourceFromMap)
        );
      }

      return source;
    }

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

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (
          Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
        ) {
          expect(
            removeAbsoluteSourceMapSources(
              stats.compilation.assets[file].sourceAndMap()
            )
          ).toMatchSnapshot(file);
        }
      }
    });
  });

  it('matches snapshot for `terser` minifier and `parallel` is `true`', () => {
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

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (
          Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
        ) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
    });
  });

  it('matches snapshot for errors into `minify` option', () => {
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

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (
          Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
        ) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
    });
  });

  it('matches snapshot for errors into `minify` option and `parallel` is `true`', () => {
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
      minify() {
        throw Error('Error');
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (
          Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
        ) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
    });
  });
});
