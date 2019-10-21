import { SourceMapDevToolPlugin } from 'webpack';

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

describe('sourceMap', () => {
  beforeEach(() => Promise.all([removeCache()]));

  afterEach(() => Promise.all([removeCache()]));

  it('should match snapshot for a "false" value (the "devtool" option has the "source-map" value)', async () => {
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

  it('should match snapshot for a "false" value (the "devtool" option has the "false" value)', async () => {
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

  it('should match snapshot for a "true" value (the "devtool" option has the "source-map" value)', async () => {
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

  it('should match snapshot for a "true" value (the "devtool" option has the "inline-source-map" value)', async () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/entry.js`,
      devtool: 'inline-source-map',
    });

    new TerserPlugin({ sourceMap: true }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for a "true" value (the "devtool" option has the "hidden-source-map" value)', async () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/entry.js`,
      devtool: 'hidden-source-map',
    });

    new TerserPlugin({ sourceMap: true }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for a "true" value (the "devtool" option has the "nosources-source-map" value)', async () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/entry.js`,
      devtool: 'nosources-source-map',
    });

    new TerserPlugin({ sourceMap: true }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for a "true" value (the "devtool" option has the "false" value)', async () => {
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

  it('should match snapshot for a "true" value (the "devtool" option has the "source-map" value) and source map invalid', async () => {
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

  it('should match snapshot when the "devtool" option has the "source-map" value', async () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/entry.js`,
      devtool: 'source-map',
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot when the "devtool" option has the "sourcemap" value', async () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/entry.js`,
      devtool: 'sourcemap',
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot when the "devtool" option has the "source-map" value', async () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/entry.js`,
      devtool: 'inline-source-map',
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot when the "devtool" option has the "source-map" value', async () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/entry.js`,
      devtool: 'hidden-source-map',
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot when the "devtool" option has the "source-map" value', async () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/entry.js`,
      devtool: 'nosources-source-map',
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for a "true" value (the "devtool" option has the "eval" value)', async () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/entry.js`,
      devtool: 'eval',
    });

    new TerserPlugin({ sourceMap: true }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for a "true" value (the "devtool" option has the "cheap-source-map" value)', async () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/entry.js`,
      devtool: 'cheap-source-map',
    });

    new TerserPlugin({ sourceMap: true }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for the `SourceMapDevToolPlugin` plugin (like `source-map`)', async () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/entry.js`,
      devtool: false,
      plugins: [
        new SourceMapDevToolPlugin({
          filename: '[file].map[query]',
          module: true,
          columns: true,
        }),
      ],
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for the `SourceMapDevToolPlugin` plugin (like `cheap-source-map`)', async () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/entry.js`,
      devtool: false,
      plugins: [
        new SourceMapDevToolPlugin({
          filename: '[file].map[query]',
          module: false,
          columns: false,
        }),
      ],
    });

    new TerserPlugin().apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for multi compiler mode with source maps', async () => {
    const multiCompiler = createCompiler([
      {
        mode: 'production',
        devtool: 'eval',
        bail: true,
        cache: false,
        entry: `${__dirname}/fixtures/entry.js`,
        output: {
          path: `${__dirname}/dist`,
          filename: '[name]-1.js',
          chunkFilename: '[id]-1.[name].js',
        },
        optimization: {
          minimize: false,
        },
        plugins: [new TerserPlugin()],
      },
      {
        mode: 'production',
        devtool: 'source-map',
        bail: true,
        cache: false,
        entry: `${__dirname}/fixtures/entry.js`,
        output: {
          path: `${__dirname}/dist`,
          filename: '[name]-2.js',
          chunkFilename: '[id]-2.[name].js',
        },
        optimization: {
          minimize: false,
        },
        plugins: [new TerserPlugin()],
      },
      {
        mode: 'production',
        bail: true,
        cache: false,
        devtool: false,
        entry: `${__dirname}/fixtures/entry.js`,
        output: {
          path: `${__dirname}/dist`,
          filename: '[name]-3.js',
          chunkFilename: '[id]-3.[name].js',
        },
        optimization: {
          minimize: false,
        },
        plugins: [
          new SourceMapDevToolPlugin({
            filename: '[file].map[query]',
            module: false,
            columns: false,
          }),
          new TerserPlugin(),
        ],
      },
      {
        mode: 'production',
        bail: true,
        cache: false,
        devtool: false,
        entry: `${__dirname}/fixtures/entry.js`,
        output: {
          path: `${__dirname}/dist`,
          filename: '[name]-4.js',
          chunkFilename: '[id]-4.[name].js',
        },
        optimization: {
          minimize: false,
        },
        plugins: [
          new SourceMapDevToolPlugin({
            filename: '[file].map[query]',
            module: true,
            columns: true,
          }),
          new TerserPlugin(),
        ],
      },
    ]);

    const multiStats = await compile(multiCompiler);

    multiStats.stats.forEach((stats, index) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');
      expect(getAssets(stats, multiCompiler.compilers[index])).toMatchSnapshot(
        'assets'
      );
    });
  });
});
