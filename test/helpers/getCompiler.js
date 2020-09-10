import path from 'path';

import webpack from 'webpack';
import { createFsFromVolume, Volume } from 'memfs';

export default function getCompiler(options = {}) {
  const compiler = webpack(
    Array.isArray(options)
      ? options
      : {
          mode: 'production',
          bail: true,
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

getCompiler.isWebpack4 = () => webpack.version[0] === '4';
