import path from 'path';

export default function getAssets(stats, compiler) {
  const usedFs = compiler.outputFileSystem;
  const outputPath = stats.compilation.outputOptions.path;
  const assets = {};

  for (const file in stats.compilation.assets) {
    if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)) {
      let targetFile = file;

      const queryStringIdx = targetFile.indexOf('?');

      if (queryStringIdx >= 0) {
        targetFile = targetFile.substr(0, queryStringIdx);
      }

      assets[file] = usedFs
        .readFileSync(path.join(outputPath, targetFile))
        .toString();
    }
  }

  return assets;
}
