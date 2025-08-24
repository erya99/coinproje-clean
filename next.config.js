/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'raw.githubusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'assets.coingecko.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net', pathname: '/**' },
      { protocol: 'https', hostname: 's2.coinmarketcap.com', pathname: '/**' },
      { protocol: 'https', hostname: 'ipfs.io', pathname: '/**' },
      { protocol: 'https', hostname: '**.ipfs.dweb.link', pathname: '/**' },
    ],
    // bazı hostinglerde performans için gerekirse:
    // unoptimized: true,
  },
};

module.exports = nextConfig;
