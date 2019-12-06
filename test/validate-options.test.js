import TerserPlugin from '../src';

it('validation', () => {
  /* eslint-disable no-new */
  expect(() => {
    new TerserPlugin({ test: /foo/ });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ test: 'foo' });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ test: [/foo/] });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ test: [/foo/, /bar/] });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ test: ['foo', 'bar'] });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ test: [/foo/, 'bar'] });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ test: true });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new TerserPlugin({ test: [true] });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new TerserPlugin({ include: /foo/ });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ include: 'foo' });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ include: [/foo/] });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ include: [/foo/, /bar/] });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ include: ['foo', 'bar'] });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ include: [/foo/, 'bar'] });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ include: true });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new TerserPlugin({ include: [true] });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new TerserPlugin({ exclude: /foo/ });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ exclude: 'foo' });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ exclude: [/foo/] });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ exclude: [/foo/, /bar/] });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ exclude: ['foo', 'bar'] });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ exclude: [/foo/, 'bar'] });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ exclude: true });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new TerserPlugin({ exclude: [true] });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new TerserPlugin({ chunkFilter: () => {} });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ chunkFilter: true });
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
    new TerserPlugin({ cacheKeys: 'test' });
  }).toThrowErrorMatchingSnapshot();

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
    new TerserPlugin({ minify: true });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new TerserPlugin({ terserOptions: {} });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ terserOptions: null });
  }).toThrowErrorMatchingSnapshot();

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
    new TerserPlugin({ extractComments: 'comment' });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ extractComments: /comment/ });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ extractComments() {} });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({
      extractComments: {
        condition: true,
      },
    });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({
      extractComments: {
        condition: 'comment',
      },
    });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({
      extractComments: {
        condition: /comment/,
      },
    });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({
      extractComments: {
        condition() {},
      },
    });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({
      extractComments: {
        condition: {},
      },
    });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new TerserPlugin({
      extractComments: {
        filename: 'test.js',
      },
    });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({
      extractComments: {
        filename() {},
      },
    });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({
      extractComments: {
        filename: true,
      },
    });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new TerserPlugin({
      extractComments: {
        banner: true,
      },
    });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({
      extractComments: {
        banner: 'banner',
      },
    });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({
      extractComments: {
        banner() {},
      },
    });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({
      extractComments: {
        banner: /test/,
      },
    });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new TerserPlugin({ extractComments: { unknown: true } });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new TerserPlugin({ warningsFilter() {} });
  }).not.toThrow();

  expect(() => {
    new TerserPlugin({ warningsFilter: true });
  }).toThrowErrorMatchingSnapshot();

  expect(() => {
    new TerserPlugin({ unknown: true });
  }).toThrowErrorMatchingSnapshot();
  /* eslint-enable no-new */
});
