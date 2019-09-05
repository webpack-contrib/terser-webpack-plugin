import serialize from 'serialize-javascript';

import worker from '../src/worker';

describe('worker', () => {
  it('should match snapshot when options.extractComments is regex', () => {
    const options = {
      file: 'test1.js',
      input: 'var foo = 1;/* hello */',
      extractComments: /foo/,
    };
    const workerResult = worker.transform(serialize(options));

    expect(workerResult).toMatchSnapshot(options.file);
  });

  it('normalizes when terserOptions.output.comments is string: all', () => {
    const options = {
      file: 'test2.js',
      input: 'var foo = 1;/* hello */',
      terserOptions: {
        output: {
          comments: 'all',
        },
      },
    };
    const workerResult = worker.transform(serialize(options));

    expect(workerResult).toMatchSnapshot(options.file);
  });

  it('should match snapshot when terserOptions.output.comments is string: some', () => {
    const options = {
      file: 'test3.js',
      input: 'var foo = 1;/* hello */',
      terserOptions: {
        output: {
          comments: 'some',
        },
      },
    };
    const workerResult = worker.transform(serialize(options));

    expect(workerResult).toMatchSnapshot(options.file);
  });

  it('should match snapshot when terserOptions.extractComments is number', () => {
    const options = {
      file: 'test4.js',
      input: 'var foo = 1;/* hello */',
      terserOptions: {
        output: {
          comments: 'some',
        },
      },
      extractComments: 1,
    };
    const workerResult = worker.transform(serialize(options));

    expect(workerResult).toMatchSnapshot(options.file);
  });

  it('should match snapshot with extract option set to a single file', () => {
    const options = {
      file: 'test5.js',
      input: '/******/ function hello(a) {console.log(a)}',
      terserOptions: {
        output: {
          comments: 'all',
        },
      },
      extractComments: {
        condition: 'should be extracted',
        filename: (file) => file.replace(/(\.\w+)$/, '.license$1'),
        banner: (licenseFile) =>
          `License information can be found in ${licenseFile}`,
      },
    };
    const workerResult = worker.transform(serialize(options));

    expect(workerResult).toMatchSnapshot(options.file);
  });

  it('should match snapshot with options.inputSourceMap', () => {
    const options = {
      file: 'test6.js',
      input: 'function foo(x) { if (x) { return bar(); not_called1(); } }',
      inputSourceMap: {
        version: 3,
        sources: ['test1.js'],
        names: ['foo', 'x', 'bar', 'not_called1'],
        mappings: 'AAAA,QAASA,KAAIC,GACT,GAAIA,EAAG,CACH,MAAOC,MACPC',
      },
    };
    const workerResult = worker.transform(serialize(options));

    expect(workerResult).toMatchSnapshot(options.file);
  });
});
