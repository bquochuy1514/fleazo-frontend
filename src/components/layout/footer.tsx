import Link from 'next/link';

// Minimal placeholder — flesh out with real columns (about, categories, support,
// social) later. Enough for now so (main)/layout.tsx has a real Footer, not a stub.
export function Footer() {
	return (
		<footer className="border-t border-border bg-background">
			<div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
				<p className="font-heading text-base font-semibold text-fz-primary">
					Fleazo
				</p>
				<p className="mt-1">
					Nền tảng mua bán đồ cũ dành cho sinh viên các trường đại học
					Việt Nam.
				</p>
				<p className="mt-4">
					© {new Date().getFullYear()}{' '}
					<Link href="/" className="hover:text-foreground">
						Fleazo
					</Link>
					. Đồ án tốt nghiệp UIT.
				</p>
			</div>
		</footer>
	);
}
