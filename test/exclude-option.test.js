import TerserPlugin from '../src/index';

import {
  cleanErrorStack,
  createCompiler,
  compile,
  getAssets,
  removeCache,
} from './helpers';

describe('exclude option', () => {
  let compiler;

  beforeEach(() => {
    compiler = createCompiler({
      entry: {
        excluded1: `${__dirname}/fixtures/excluded1.js`,
        excluded2: `${__dirname}/fixtures/excluded2.js`,
        entry: `${__dirname}/fixtures/entry.js`,
      },
    });

    return Promise.all([removeCache()]);
  });

  afterEach(() => Promise.all([removeCache()]));

  it('should match snapshot for a single RegExp value', async () => {
    new TerserPlugin({
      exclude: /excluded1/i,
    }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for a single String value', async () => {
    new TerserPlugin({
      exclude: 'excluded1',
    }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for multiple RegExp values', async () => {
    new TerserPlugin({
      exclude: [/excluded1/i, /excluded2/i],
    }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });

  it('should match snapshot for multiple String values', async () => {
    new TerserPlugin({
      exclude: ['excluded1', 'excluded2'],
    }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });
});
