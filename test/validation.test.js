import TerserPlugin from '../src';

it('validation', () => {
  /* eslint-disable no-new */
  expect(() => {
    new TerserPlugin({ test: /foo/ });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ test: [/foo/] });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ include: /foo/ });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ include: [/foo/] });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ exclude: /foo/ });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ exclude: [/foo/] });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ doesntExist: true });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new TerserPlugin({ cache: true });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ cache: false });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ cache: 'path/to/cache/directory' });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ cache: {} });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new TerserPlugin({ cacheKeys() {} });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ parallel: true });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ parallel: false });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ parallel: 2 });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ parallel: '2' });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new TerserPlugin({ parallel: {} });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new TerserPlugin({ sourceMap: true });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ sourceMap: false });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ sourceMap: 'true' });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new TerserPlugin({ minify() {} });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ terserOptions: null });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new TerserPlugin({ terserOptions: {} });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({
      terserOptions: {
        // eslint-disable-next-line no-undefined
        ecma: undefined,
        warnings: false,
        parse: {},
        compress: {},
        mangle: true,
        module: false,
        output: null,
        toplevel: false,
        nameCache: null,
        ie8: false,
        keep_classnames: false,
        keep_fnames: false,
        safari10: false,
      },
    });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ terserOptions: { emca: 5 } });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ extractComments: true });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ extractComments: false });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ extractComments: /comment/ });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ extractComments() {} });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ warningsFilter() {} });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ warningsFilter: true });
  }).toThrowErrorMatchingSnapshot();
  /* eslint-enable no-new */
});
