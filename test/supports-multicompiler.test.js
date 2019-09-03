import MultiCompiler from 'webpack/lib/MultiCompiler';
import MultiStats from 'webpack/lib/MultiStats';

import TerserPlugin from '../src/index';

import {
  cleanErrorStack,
  createCompiler,
  countPlugins,
  compile,
  getAssets,
} from './helpers';

describe('multi-compiler mode', () => {
  it('should match snapshot with empty options', async () => {
    const multiCompiler = createCompiler([
      {
        mode: 'production',
        bail: true,
        cache: false,
        entry: `${__dirname}/fixtures/entry.js`,
        output: {
          path: `${__dirname}/dist`,
          filename: '[name].[chunkhash].js',
          chunkFilename: '[id].[name].[chunkhash].js',
        },
        optimization: {
          minimize: false,
        },
      },
      {
        mode: 'production',
        bail: true,
        cache: false,
        entry: `${__dirname}/fixtures/entry.js`,
        output: {
          path: `${__dirname}/dist`,
          filename: '[name].[chunkhash].js',
          chunkFilename: '[id].[name].[chunkhash].js',
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
        entry: `${__dirname}/fixtures/import-export/entry.js`,
        output: {
          path: `${__dirname}/dist-MultiCompiler`,
          filename: '[name].[chunkhash].js',
          chunkFilename: '[id].[name].[chunkhash].js',
        },
        optimization: {
          minimize: false,
        },
        plugins: [new TerserPlugin()],
      },
    ]);

    const emptyPluginCount = countPlugins(multiCompiler.compilers[0]);
    const expectedPluginCount = countPlugins(multiCompiler.compilers[1]);

    expect(emptyPluginCount).not.toEqual(expectedPluginCount);
    expect(multiCompiler).toBeInstanceOf(MultiCompiler);

    multiCompiler.compilers.slice(2).forEach((compiler) => {
      const pluginCount = countPlugins(compiler);
      expect(pluginCount).not.toEqual(emptyPluginCount);
      expect(pluginCount).toEqual(expectedPluginCount);
      expect(pluginCount).toMatchSnapshot('compiler plugin count');
    });

    expect(multiCompiler).toBeInstanceOf(MultiCompiler);

    const multiStats = await compile(multiCompiler);

    expect(multiStats).toBeInstanceOf(MultiStats);

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
