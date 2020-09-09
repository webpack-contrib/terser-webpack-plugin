import path from 'path';

import TerserPlugin from '../src/index';

import {
  compile,
  getCompiler,
  getErrors,
  getWarnings,
  readsAssets,
  removeCache,
} from './helpers';

describe('exclude option', () => {
  let compiler;

  beforeEach(() => {
    compiler = getCompiler({
      entry: {
        excluded1: path.resolve(__dirname, './fixtures/excluded1.js'),
        excluded2: path.resolve(__dirname, './fixtures/excluded2.js'),
        entry: path.resolve(__dirname, './fixtures/entry.js'),
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

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot for a single String value', async () => {
    new TerserPlugin({
      exclude: 'excluded1',
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot for multiple RegExp values', async () => {
    new TerserPlugin({
      exclude: [/excluded1/i, /excluded2/i],
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should match snapshot for multiple String values', async () => {
    new TerserPlugin({
      exclude: ['excluded1', 'excluded2'],
    }).apply(compiler);

    const stats = await compile(compiler);

    expect(readsAssets(compiler, stats)).toMatchSnapshot('assets');
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });
});
