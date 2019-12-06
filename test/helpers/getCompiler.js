import path from 'path';

import webpack from 'webpack';
import webpackPackageJson from 'webpack/package.json';
import { createFsFromVolume, Volume } from 'memfs';

export default function getCompiler(options = {}) {
  const compiler = webpack(
    Array.isArray(options)
      ? options
      : {
          mode: 'production',
          bail: true,
          cache: getCompiler.isWebpack4() ? false : { type: 'memory' },
          entry: path.resolve(__dirname, '../fixtures/entry.js'),
          optimization: {
            minimize: false,
          },
          output: {
            pathinfo: false,
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].js',
            chunkFilename: '[id].[name].js',
          },
          plugins: [],
          ...options,
        }
  );

  const outputFileSystem = createFsFromVolume(new Volume());
  // Todo remove when we drop webpack@4 support
  outputFileSystem.join = path.join.bind(path);

  compiler.outputFileSystem = outputFileSystem;

  return compiler;
}

getCompiler.isWebpack4 = () =>
  // eslint-disable-next-line global-require
  (process.env.WEBPACK_VERSION || webpackPackageJson.version[0]) === '4';
