import crypto from 'crypto';

export function getHasher(compiler = null) {
  const hashFunction =
    compiler && compiler.output && compiler.output.hashFunction;

  if (typeof hashFunction === 'string') {
    return crypto.createHash(hashFunction);
  } else if (typeof hashFunction === 'function') {
    return hashFunction();
  } 
    return crypto.createHash('md4');
  
}

export default getHasher;
