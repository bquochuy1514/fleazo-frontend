import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { DarkSurfaceAmbient } from '@/components/layout/dark-surface-ambient';

// Global 404 — lives at the app root, so it's NOT wrapped by (main)'s
// Header/Footer. Stands alone: brings its own logo, no nav beyond "home".
// Dark surface here too (see dark-surface-ambient.tsx) — the whole point
// is a full-bleed dark backdrop for the logo's white wordmark to sit on.
export default function NotFound() {
	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center gap-10 overflow-hidden bg-fz-dark-surface px-6 py-16 text-center">
			<DarkSurfaceAmbient />

			<Logo className="h-14" clickable={false} />

			<div>
				<p className="bg-gradient-to-r from-fz-accent-deep to-fz-accent-bright bg-clip-text font-heading text-8xl font-bold tracking-tight text-transparent sm:text-9xl">
					404
				</p>
				<p className="mt-1 text-sm font-semibold tracking-[0.3em] text-white/50 sm:text-base">
					NOT FOUND
				</p>

				<p className="mt-6 font-heading text-xl font-semibold text-white sm:text-2xl">
					Trang này không tồn tại
				</p>
				<p className="mx-auto mt-2 max-w-xs text-sm text-white/60 sm:text-base">
					Có thể đường dẫn sai, hoặc tin đăng đã được gỡ xuống.
				</p>
			</div>

			<Link href="/" className={buttonVariants({ variant: 'default' })}>
				Về trang chủ
			</Link>
		</div>
	);
}
