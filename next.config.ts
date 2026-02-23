import type { NextConfig } from 'next';
import type { RemotePattern } from 'next/dist/shared/lib/image-config';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

type http = 'http' | 'https' | undefined;

// Remote patterns for production API
const remotePatterns: RemotePattern[] = [
	{
		protocol: 'https',
		hostname: 'api-contracts.elbouazzatiholding.ma',
		port: '',
		pathname: '/media/**',
		search: '',
	},
	{
		protocol: 'http',
		hostname: 'api-contracts.elbouazzatiholding.ma',
		port: '',
		pathname: '/media/**',
		search: '',
	},
];

// Add localhost for development
if (isDev && process.env.NEXT_PUBLIC_API_ROOT_URL) {
	const port = process.env.NEXT_PUBLIC_API_ROOT_PORT;
	const shouldIncludePort = port && port !== '80' && port !== '443';

	remotePatterns.push({
		protocol: process.env.NEXT_PUBLIC_HTTP_PROTOCOLE as http,
		hostname: process.env.NEXT_PUBLIC_API_ROOT_URL as string,
		...(shouldIncludePort && { port }),
		pathname: '/media/**',
	});
}

const nextConfig: NextConfig = {
	reactCompiler: true,
	reactStrictMode: true,
	poweredByHeader: false,
	compress: false,
	typedRoutes: true,

	experimental: {
		typedEnv: true,
		turbopackFileSystemCacheForDev: true,
		optimizeCss: isProd,
	},

	sassOptions: {
		includePaths: [path.join(__dirname, 'src', 'styles'), path.join(__dirname, 'public')],
	},

	images: {
		unoptimized: isDev,
		formats: ['image/avif', 'image/webp'],
		remotePatterns,
	},

	async rewrites() {
		return {
			beforeFiles: [],
			afterFiles: [],
			fallback: [],
		};
	},
};

export default nextConfig;
