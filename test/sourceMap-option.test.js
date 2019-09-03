import TerserPlugin from '../src/index';

import {
  createCompiler,
  compile,
  cleanErrorStack,
  getAssets,
  removeCache,
} from './helpers';

expect.addSnapshotSerializer({
  test: (value) => {
    // For string that are valid JSON
    if (typeof value !== 'string') {
      return false;
    }

    try {
      return typeof JSON.parse(value) === 'object';
    } catch (e) {
      return false;
    }
  },
  print: (value) => JSON.stringify(JSON.parse(value), null, 2),
});

describe('when options.sourceMap', () => {
  beforeEach(() => Promise.all([removeCache()]));

  afterEach(() => Promise.all([removeCache()]));

  it('matches snapshot for a single `false` value (`devtool` is `source-map`)', async () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/entry.js`,
      devtool: 'source-map',
    });

    new TerserPlugin({ sourceMap: false }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('matches snapshot for a single `false` value (`devtool` is `false`)', async () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/entry.js`,
      devtool: false,
    });

    new TerserPlugin({ sourceMap: false }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('matches snapshot for a single `true` value (`devtool` is `source-map`)', async () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/entry.js`,
      devtool: 'source-map',
    });

    new TerserPlugin({ sourceMap: true }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('matches snapshot for a single `true` value (`devtool` is `false`)', async () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/entry.js`,
      devtool: false,
    });

    new TerserPlugin({ sourceMap: true }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('matches snapshot for a single `true` value (`devtool` is `source-map`) and source map invalid', async () => {
    const emitBrokenSourceMapPlugin = new (class EmitBrokenSourceMapPlugin {
      apply(pluginCompiler) {
        pluginCompiler.hooks.compilation.tap(
          { name: this.constructor.name },
          (compilation) => {
            compilation.hooks.additionalChunkAssets.tap(
              { name: this.constructor.name },
              () => {
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
              }
            );
          }
        );
      }
    })();
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/entry.js`,
      devtool: 'source-map',
      plugins: [emitBrokenSourceMapPlugin],
    });

    new TerserPlugin({ sourceMap: true }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });
});
