import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import '../styles/globals.css';
import { cn } from '@/lib/utils';

const beVietnamPro = Be_Vietnam_Pro({
	subsets: ['latin', 'vietnamese'],
	weight: ['400', '500', '600', '700'],
	variable: '--font-sans',
});

export const metadata: Metadata = {
	title: 'Fleazo — Chợ đồ cũ sinh viên',
	description:
		'Nền tảng mua bán đồ cũ dành cho sinh viên các trường đại học Việt Nam',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="vi"
			className={cn(
				'h-full antialiased font-sans',
				beVietnamPro.variable,
			)}
		>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	);
}
