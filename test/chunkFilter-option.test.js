import TerserPlugin from '../src/index';

import {
  cleanErrorStack,
  createCompiler,
  compile,
  getAssets,
  removeCache,
} from './helpers';

describe('chunkFilter option', () => {
  let compiler;

  beforeEach(() => {
    compiler = createCompiler({
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

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });
});
