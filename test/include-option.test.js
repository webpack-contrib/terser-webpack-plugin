import TerserPlugin from '../src/index';

import { cleanErrorStack, createCompiler, compile, getAssets } from './helpers';

describe('include option', () => {
  let compiler;

  beforeEach(() => {
    compiler = createCompiler({
      entry: {
        included1: `${__dirname}/fixtures/included1.js`,
        included2: `${__dirname}/fixtures/included2.js`,
        entry: `${__dirname}/fixtures/entry.js`,
      },
    });
  });

  it('should match snapshot for a single RegExp value', async () => {
    new TerserPlugin({
      include: /included1/i,
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
      include: 'included1',
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
      include: [/included1/i, /included2/i],
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
      include: ['included1', 'included2'],
    }).apply(compiler);

    const stats = await compile(compiler);

    const errors = stats.compilation.errors.map(cleanErrorStack);
    const warnings = stats.compilation.warnings.map(cleanErrorStack);

    expect(errors).toMatchSnapshot('errors');
    expect(warnings).toMatchSnapshot('warnings');
    expect(getAssets(stats, compiler)).toMatchSnapshot('assets');
  });
});
