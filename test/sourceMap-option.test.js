import TerserPlugin from '../src/index';

import { createCompiler, compile, cleanErrorStack } from './helpers';

describe('when options.sourceMap', () => {
  it('matches snapshot for a single `false` value (`devtool` is `source-map`)', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/entry.js`,
      devtool: 'source-map',
    });

    new TerserPlugin({ sourceMap: false }).apply(compiler);

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

  it('matches snapshot for a single `false` value (`devtool` is `false`)', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/entry.js`,
      devtool: false,
    });

    new TerserPlugin({ sourceMap: false }).apply(compiler);

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

  it('matches snapshot for a single `true` value (`devtool` is `source-map`)', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/entry.js`,
      devtool: 'source-map',
    });

    new TerserPlugin({ sourceMap: true }).apply(compiler);

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

  it('matches snapshot for a single `true` value (`devtool` is `false`)', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/entry.js`,
      devtool: false,
    });

    new TerserPlugin({ sourceMap: true }).apply(compiler);

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

  it('matches snapshot for a single `true` value (`devtool` is `source-map`) and source map invalid', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/entry.js`,
      devtool: 'source-map',
      plugins: [
        {
          apply(pluginCompiler) {
            pluginCompiler.plugin('compilation', (compilation) => {
              compilation.plugin('additional-chunk-assets', () => {
                compilation.additionalChunkAssets.push('broken-source-map.js');

                const assetContent = 'var test = 1;';

                // eslint-disable-next-line no-param-reassign
                compilation.assets['broken-source-map.js'] = {
                  size() {
                    return assetContent.length;
                  },
                  source() {
                    return assetContent;
                  },
                  sourceAndMap() {
                    return {
                      source: this.source(),
                      map: {},
                    };
                  },
                };
              });
            });
          },
        },
      ],
    });

    new TerserPlugin({ sourceMap: true }).apply(compiler);

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
