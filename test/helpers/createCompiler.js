import path from 'path';

import webpack from 'webpack';
import MemoryFileSystem from 'memory-fs';

export default function createCompiler(options = {}) {
  const compiler = webpack(
    Array.isArray(options)
      ? options
      : {
          mode: 'production',
          bail: true,
          cache: false,
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

  compiler.outputFileSystem = new MemoryFileSystem();

  return compiler;
}
