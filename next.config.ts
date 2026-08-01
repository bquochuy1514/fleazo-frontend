import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		// Next 16 only allows quality values listed here (default is [75] alone)
		// — an unlisted `quality` prop is silently coerced to the nearest one.
		qualities: [75, 90, 100],
		remotePatterns: [
			// Cloudinary — avatars, product images, category icons
			{
				protocol: 'https',
				hostname: 'res.cloudinary.com',
			},
			// Google profile pictures (Google OAuth users)
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
			},
		],
	},
};

export default nextConfig;
