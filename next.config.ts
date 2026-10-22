import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Lo movemos fuera del bloque 'experimental'
  cacheComponents: true,
  partialPrefetching: true
};

export default nextConfig;
