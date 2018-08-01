import MultiCompiler from 'webpack/lib/MultiCompiler';
import MultiStats from 'webpack/lib/MultiStats';

import TerserPlugin from '../src/index';

import {
  cleanErrorStack,
  createCompiler,
  countPlugins,
  compile,
} from './helpers';

describe('when using MultiCompiler', () => {
  it('matches snapshot with empty options', () => {
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

    return compile(multiCompiler).then((multiStats) => {
      expect(multiStats).toBeInstanceOf(MultiStats);

      multiStats.stats.forEach((stats) => {
        const errors = stats.compilation.errors.map(cleanErrorStack);
        const warnings = stats.compilation.warnings.map(cleanErrorStack);

        expect(errors.length).toEqual(0);
        expect(warnings.length).toEqual(0);

        expect(errors).toMatchSnapshot('errors');
        expect(warnings).toMatchSnapshot('warnings');

        for (const file in stats.compilation.assets) {
          if (
            Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
          ) {
            expect(stats.compilation.assets[file].source()).toMatchSnapshot(
              file
            );
          }
        }
      });
    });
  });
});
