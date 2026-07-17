import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	images: {
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
