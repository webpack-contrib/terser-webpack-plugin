const path = require('path');

const webpackPackageJson = require('webpack/package.json');

const webpackVersion =
  // eslint-disable-next-line global-require
  process.env.WEBPACK_VERSION || webpackPackageJson.version[0];

module.exports = {
  resolveSnapshotPath: (testPath) =>
    path.join(
      path.dirname(testPath),
      '__snapshots__',
      `webpack${webpackVersion}`,
      `${path.basename(testPath)}.snap`
    ),
  resolveTestPath: (snapshotPath) =>
    snapshotPath
      .replace(path.join('/__snapshots__', `webpack${webpackVersion}`), '')
      .slice(0, -'.snap'.length),
  testPathForConsistencyCheck: path.posix.join(
    'consistency_check',
    '__tests__',
    'example.test.js'
  ),
};
