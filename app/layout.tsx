import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Hanken_Grotesk } from 'next/font/google';
import '@/styles/globals.css';
import { AuthProvider } from '@/providers/auth-provider';
import { Toaster } from '@/components/ui/sonner';

const spaceGrotesk = Space_Grotesk({
	variable: '--font-heading',
	subsets: ['latin', 'vietnamese'],
	weight: ['500', '700'],
});

const hankenGrotesk = Hanken_Grotesk({
	variable: '--font-sans',
	subsets: ['latin', 'vietnamese'],
	weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
	title: 'Fleazo — Chợ đồ cũ sinh viên',
	description: 'Nền tảng mua bán đồ cũ dành cho sinh viên',
	icons: {
		icon: '/logo.png',
	},
};

// The browser default is `resizes-visual`: the on-screen keyboard slides over
// the page without changing the layout viewport, which leaves anything pinned
// to `bottom-0` — the picker sheet, any future one — sitting behind it. This
// makes the keyboard take real space instead, so `dvh` and bottom-anchored
// panels both see the room that's actually left.
export const viewport: Viewport = {
	interactiveWidget: 'resizes-content',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="vi"
			className={`${spaceGrotesk.variable} ${hankenGrotesk.variable} h-full antialiased`}
		>
			<body className="flex min-h-full flex-col">
				<AuthProvider>{children}</AuthProvider>
				<Toaster position="bottom-center" />
			</body>
		</html>
	);
}
