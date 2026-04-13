/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@xterm/xterm', '@xterm/addon-fit'],
};

// Ne charger @next/bundle-analyzer qu'en ANALYZE=true (devDependency, absent après npm prune en prod)
export default async function createNextConfig() {
  if (process.env.ANALYZE === 'true') {
    const { default: BundleAnalyzer } = await import('@next/bundle-analyzer');
    return BundleAnalyzer({ enabled: true })(nextConfig);
  }
  return nextConfig;
}
