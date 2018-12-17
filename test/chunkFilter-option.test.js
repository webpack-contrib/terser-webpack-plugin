import TerserPlugin from '../src/index';

import { cleanErrorStack, createCompiler, compile } from './helpers';

describe('when applied with `chunkFilter` option', () => {
  let compiler;

  beforeEach(() => {
    compiler = createCompiler({
      entry: {
        included: `${__dirname}/fixtures/included1.js`,
        entry: `${__dirname}/fixtures/entry.js`,
      },
    });
  });

  it('matches snapshot for a single `chunkFilter`', () => {
    new TerserPlugin({
      chunkFilter: (chunk) => {
        if (chunk.name === 'included') {
          return false;
        }

        return true;
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
