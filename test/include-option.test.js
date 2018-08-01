import TerserPlugin from '../src/index';

import { cleanErrorStack, createCompiler, compile } from './helpers';

describe('when applied with `include` option', () => {
  let compiler;

  beforeEach(() => {
    compiler = createCompiler({
      entry: {
        included1: `${__dirname}/fixtures/included1.js`,
        included2: `${__dirname}/fixtures/included2.js`,
        entry: `${__dirname}/fixtures/entry.js`,
      },
    });
  });

  it('matches snapshot for a single `include` value', () => {
    new TerserPlugin({
      include: /included1/i,
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

  it('matches snapshot for multiple `include` values', () => {
    new TerserPlugin({
      include: [/included1/i, /included2/i],
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
