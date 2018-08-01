import TerserPlugin from '../src';
import CJSTerserPlugin from '../src/cjs';

describe('CJS', () => {
  it('should exported plugin', () => {
    expect(CJSTerserPlugin).toEqual(TerserPlugin);
  });
});
