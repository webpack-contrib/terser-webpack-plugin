import crypto from 'crypto';

import { getHasher } from '../src/hash-helper';

const UNHASHED = 'this is some text';
const HASHED_MD4 = '565a21837631bdec2da173a5de2a2f87';
const HASHED_SHA1 = '0393694d16b84deb612e47ce6252bd35f0d86c06';

describe('getHasher', () => {
  it('should return MD4 hasher with no compiler parameter', () => {
    const hasher = getHasher();

    expect(hasher).not.toBeNull();
    expect(hasher.update(UNHASHED).digest('hex')).toEqual(HASHED_MD4);
  });

  it('should return MD4 hasher with incomplete compiler parameter', () => {
    const compiler = { incomplete: { bad: {} } };
    const hasher = getHasher(compiler);

    expect(hasher).not.toBeNull();
    expect(hasher.update(UNHASHED).digest('hex')).toEqual(HASHED_MD4);
  });

  it('should return hasher with string as hashFunction', () => {
    const compiler = { output: { hashFunction: 'SHA1' } };
    const hasher = getHasher(compiler);

    expect(hasher).not.toBeNull();
    expect(hasher.update(UNHASHED).digest('hex')).toEqual(HASHED_SHA1);
  });

  it('should return hasher with function as hashFunction', () => {
    const compiler = {
      output: { hashFunction: () => crypto.createHash('SHA1') },
    };
    const hasher = getHasher(compiler);

    expect(hasher).not.toBeNull();
    expect(hasher.update(UNHASHED).digest('hex')).toEqual(HASHED_SHA1);
  });
});
