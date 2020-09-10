import serialize from 'serialize-javascript';

import { transform } from '../src/minify';

import getCompiler from './helpers/getCompiler';

describe('worker', () => {
  it('should match snapshot when options.extractComments is "false"', async () => {
    const options = {
      name: 'test1.js',
      input:
        'var foo = 1;/* hello */\n// Comment\n/* duplicate */\n/* duplicate */',
      extractComments: false,
    };
    const workerResult = await transform(serialize(options));

    expect(workerResult).toMatchSnapshot();
  });

  it('should match snapshot when options.extractComments is "true"', async () => {
    const options = {
      name: 'test1.js',
      input:
        'var foo = 1;/* hello */\n// Comment\n/* duplicate */\n/* duplicate */',
      extractComments: true,
    };
    const workerResult = await transform(serialize(options));

    expect(workerResult).toMatchSnapshot();
  });

  it('should match snapshot when options.extractComments is RegExp', async () => {
    const options = {
      name: 'test1.js',
      input:
        'var foo = 1;/* hello */\n// Comment\n/* duplicate */\n/* duplicate */',
      extractComments: /hello/,
    };
    const workerResult = await transform(serialize(options));

    expect(workerResult).toMatchSnapshot();
  });

  it('should match snapshot when options.extractComments is Function', async () => {
    const options = {
      name: 'test1.js',
      input:
        'var foo = 1;/* hello */\n// Comment\n/* duplicate */\n/* duplicate */',
      extractComments: () => true,
    };
    const workerResult = await transform(serialize(options));

    expect(workerResult).toMatchSnapshot();
  });

  it('should match snapshot when options.extractComments is empty Object', async () => {
    const options = {
      name: 'test1.js',
      input:
        'var foo = 1;/* hello */\n// Comment\n/* duplicate */\n/* duplicate */',
      extractComments: {},
    };
    const workerResult = await transform(serialize(options));

    expect(workerResult).toMatchSnapshot();
  });

  it('should match snapshot when options.extractComments is Object with "true" value', async () => {
    const options = {
      name: 'test1.js',
      input:
        'var foo = 1;/* hello */\n// Comment\n/* duplicate */\n/* duplicate */',
      extractComments: {
        condition: true,
      },
    };
    const workerResult = await transform(serialize(options));

    expect(workerResult).toMatchSnapshot();
  });

  it('should match snapshot when options.extractComments is Object with "some" value', async () => {
    const options = {
      name: 'test1.js',
      input:
        'var foo = 1;/* hello */\n// Comment\n/* duplicate */\n/* duplicate */',
      extractComments: {
        condition: 'some',
      },
    };
    const workerResult = await transform(serialize(options));

    expect(workerResult).toMatchSnapshot();
  });

  it('should match snapshot when options.extractComments is Object with "all" value', async () => {
    const options = {
      name: 'test1.js',
      input:
        'var foo = 1;/* hello */\n// Comment\n/* duplicate */\n/* duplicate */',
      extractComments: {
        condition: 'all',
      },
    };
    const workerResult = await transform(serialize(options));

    expect(workerResult).toMatchSnapshot();
  });

  it('should match snapshot when options.extractComments is "all" value', async () => {
    const options = {
      name: 'test1.js',
      input:
        'var foo = 1;/* hello */\n// Comment\n/* duplicate */\n/* duplicate */',
      extractComments: 'all',
    };
    const workerResult = await transform(serialize(options));

    expect(workerResult).toMatchSnapshot();
  });

  it('should match snapshot when options.extractComments is "some" value', async () => {
    const options = {
      name: 'test1.js',
      input:
        'var foo = 1;/* hello */\n// Comment\n/* duplicate */\n/* duplicate */',
      extractComments: 'some',
    };
    const workerResult = await transform(serialize(options));

    expect(workerResult).toMatchSnapshot();
  });

  it('normalizes when minimizerOptions.output.comments is string: all', async () => {
    const options = {
      name: 'test2.js',
      input:
        'var foo = 1;/* hello */\n// Comment\n/* duplicate */\n/* duplicate */',
      minimizerOptions: {
        output: {
          comments: 'all',
        },
      },
    };
    const workerResult = await transform(serialize(options));

    expect(workerResult).toMatchSnapshot();
  });

  it('should match snapshot when minimizerOptions.compress.comments is boolean', async () => {
    const options = {
      name: 'test3.js',
      input:
        'var foo = 1;/* hello */\n// Comment\n/* duplicate */\n/* duplicate */',
      minimizerOptions: {
        compress: true,
      },
    };
    const workerResult = await transform(serialize(options));

    expect(workerResult).toMatchSnapshot();
  });

  it('should match snapshot when minimizerOptions.compress.comments is object', async () => {
    const options = {
      name: 'test3.js',
      input:
        'var foo = 1;/* hello */\n// Comment\n/* duplicate */\n/* duplicate */',
      minimizerOptions: {
        compress: {
          passes: 2,
        },
      },
    };
    const workerResult = await transform(serialize(options));

    expect(workerResult).toMatchSnapshot();
  });

  it('should match snapshot when minimizerOptions.output.comments is string: some', async () => {
    const options = {
      name: 'test3.js',
      input:
        'var foo = 1;/* hello */\n// Comment\n/* duplicate */\n/* duplicate */',
      minimizerOptions: {
        output: {
          comments: 'some',
        },
      },
    };
    const workerResult = await transform(serialize(options));

    expect(workerResult).toMatchSnapshot();
  });

  it('should match snapshot when minimizerOptions.extractComments is number', async () => {
    const options = {
      name: 'test4.js',
      input:
        'var foo = 1;/* hello */\n// Comment\n/* duplicate */\n/* duplicate */',
      minimizerOptions: {
        output: {
          comments: 'some',
        },
      },
      extractComments: 1,
    };
    const workerResult = await transform(serialize(options));

    expect(workerResult).toMatchSnapshot();
  });

  it('should match snapshot with extract option set to a single file', async () => {
    const options = {
      name: 'test5.js',
      input: '/******/ function hello(a) {console.log(a)}',
      minimizerOptions: {
        output: {
          comments: 'all',
        },
      },
      extractComments: {
        condition: 'should be extracted',
        filename: (file) =>
          getCompiler.isWebpack4()
            ? file.replace(/(\.\w+)$/, '.license$1')
            : file.filename.replace(/(\.\w+)$/, '.license$1'),
        banner: (licenseFile) =>
          `License information can be found in ${licenseFile}`,
      },
    };
    const workerResult = await transform(serialize(options));

    expect(workerResult).toMatchSnapshot();
  });

  it('should match snapshot with options.inputSourceMap', async () => {
    const options = {
      name: 'test6.js',
      input: 'function foo(x) { if (x) { return bar(); not_called1(); } }',
      inputSourceMap: {
        version: 3,
        sources: ['test1.js'],
        names: ['foo', 'x', 'bar', 'not_called1'],
        mappings: 'AAAA,QAASA,KAAIC,GACT,GAAIA,EAAG,CACH,MAAOC,MACPC',
      },
    };
    const workerResult = await transform(serialize(options));

    expect(workerResult).toMatchSnapshot();
  });

  it('should match snapshot when options.extractComments is "true"', async () => {
    const options = {
      name: 'test1.js',
      input:
        'var foo = 1;/* hello */\n// Comment\n/* duplicate */\n/* duplicate */',
      minify: (item) => {
        return item['test1.js'];
      },
    };
    const workerResult = await transform(serialize(options));

    expect(workerResult).toMatchSnapshot();
  });

  it('should match snapshot when minimizerOptions.mangle is "null"', async () => {
    const options = {
      name: 'test4.js',
      input:
        'var foo = 1;/* hello */\n// Comment\n/* duplicate */\n/* duplicate */',
      minimizerOptions: {
        mangle: null,
      },
    };
    const workerResult = await transform(serialize(options));

    expect(workerResult).toMatchSnapshot();
  });

  it('should match snapshot when minimizerOptions.mangle is boolean', async () => {
    const options = {
      name: 'test4.js',
      input:
        'var foo = 1;/* hello */\n// Comment\n/* duplicate */\n/* duplicate */',
      minimizerOptions: {
        mangle: true,
      },
    };
    const workerResult = await transform(serialize(options));

    expect(workerResult).toMatchSnapshot();
  });

  it('should match snapshot when minimizerOptions.mangle is object', async () => {
    const options = {
      name: 'test4.js',
      input:
        'var foo = 1;/* hello */\n// Comment\n/* duplicate */\n/* duplicate */',
      minimizerOptions: {
        mangle: { toplevel: true },
      },
    };
    const workerResult = await transform(serialize(options));

    expect(workerResult).toMatchSnapshot();
  });
});
