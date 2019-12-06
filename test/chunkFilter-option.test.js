import TerserPlugin from '../src/index';

import {
  compile,
  getCompiler,
  getErrors,
  getWarnings,
  readsAssets,
  removeCache,
} from './helpers';

describe('chunkFilter option', () => {
  let compiler;

  beforeEach(() => {
    compiler = getCompiler({
      entry: {
        included: `${__dirname}/fixtures/included1.js`,
        entry: `${__dirname}/fixtures/entry.js`,
      },
    });

    return Promise.all([removeCache()]);
  });

  afterEach(() => Promise.all([removeCache()]));

  it('should match snapshot for a Function value', async () => {
    new TerserPlugin({
      chunkFilter: (chunk) => {
        if (chunk.name === 'included') {
          return false;
        }

        return true;
      },
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getWarnings(stats)).toMatchSnapshot('errors');
    expect(getErrors(stats)).toMatchSnapshot('warnings');
  });
});
