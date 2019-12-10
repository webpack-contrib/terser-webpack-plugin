const path = require('path');

const webpackPackageJson = require('webpack/package.json');

// eslint-disable-next-line global-require
const [webpackVersion] = webpackPackageJson.version;
const snapshotExtension = `.snap.webpack${webpackVersion}`;

// eslint-disable-next-line no-console
console.log('Current webpack version:', webpackVersion);

module.exports = {
  resolveSnapshotPath: (testPath) =>
    path.join(
      path.dirname(testPath),
      '__snapshots__',
      `${path.basename(testPath)}${snapshotExtension}`
    ),
  resolveTestPath: (snapshotPath) =>
    snapshotPath
      .replace(`${path.sep}__snapshots__`, '')
      .slice(0, -snapshotExtension.length),
  testPathForConsistencyCheck: path.join(
    'consistency_check',
    '__tests__',
    'example.test.js'
  ),
};
