import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Manrope } from 'next/font/google';
import '../styles/globals.css';
import { cn } from '@/lib/utils';

// Body text — see AGENTS.md → Design System → Typography
const beVietnamPro = Be_Vietnam_Pro({
	subsets: ['latin', 'vietnamese'],
	weight: ['400', '500', '600', '700'],
	variable: '--font-sans',
});

// Display/heading text — variable weight, used for headings and price display
const manrope = Manrope({
	subsets: ['latin', 'vietnamese'],
	variable: '--font-heading',
});

export const metadata: Metadata = {
	title: 'Fleazo - Chợ đồ cũ sinh viên',
	description:
		'Nền tảng mua bán đồ cũ dành cho sinh viên các trường đại học Việt Nam',
	icons: {
		icon: '/fleazo-mark.png',
	},
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
				manrope.variable,
			)}
		>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	);
}
