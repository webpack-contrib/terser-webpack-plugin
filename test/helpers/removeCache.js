import cacache from 'cacache';

import getCacheDirectory from './getCacheDirectory';

async function removeCache(cacheDirectory) {
  const cacheDir = cacheDirectory || getCacheDirectory();

  return cacache.rm.all(cacheDir);
}

export default removeCache;
