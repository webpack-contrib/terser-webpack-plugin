import TerserPlugin from '../src/index';

import { cleanErrorStack, createCompiler, compile } from './helpers';

describe('when applied with `warningsFilter` option', () => {
  let compiler;

  beforeEach(() => {
    compiler = createCompiler({
      entry: {
        one: `${__dirname}/fixtures/unreachable-code.js`,
        two: `${__dirname}/fixtures/unreachable-code-2.js`,
      },
    });
  });

  it('matches snapshot for a `function` value and `sourceMap` is `false` (filter by message)', () => {
    new TerserPlugin({
      warningsFilter(warning) {
        if (/Dropping unreachable code/.test(warning)) {
          return true;
        }

        return false;
      },
      terserOptions: {
        warnings: true,
      },
      sourceMap: false,
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

  it('matches snapshot for a `function` value and `sourceMap` is `true` (filter by message)', () => {
    new TerserPlugin({
      warningsFilter(warning) {
        if (/Dropping unreachable code/.test(warning)) {
          return true;
        }

        return false;
      },
      terserOptions: {
        warnings: true,
      },
      sourceMap: true,
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

  it('matches snapshot for a `function` value and `sourceMap` is `true` (filter by source)', () => {
    new TerserPlugin({
      warningsFilter(warning, source) {
        if (/unreachable-code\.js/.test(source)) {
          return true;
        }

        return false;
      },
      terserOptions: {
        warnings: true,
      },
      sourceMap: true,
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

  it('matches snapshot for a `function` value and `sourceMap` is `true` (filter by file)', () => {
    new TerserPlugin({
      warningsFilter(warning, source, file) {
        if (/two\.(.*)?\.js/.test(file)) {
          return true;
        }

        return false;
      },
      terserOptions: {
        warnings: true,
      },
      sourceMap: true,
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
