import Image from 'next/image';
import { AuthFormPanel } from '@/components/auth/auth-form-panel';
import { AuthVisual } from '@/components/auth/auth-visual';
import { GuestOnlyGuard } from '@/components/auth/guest-only-guard';

// Auth screens: no marketplace chrome, AuthVisual is the only branding.
//
// h-svh + overflow-hidden (not min-h-dvh) so only the form panel scrolls,
// not the whole page. `svh` not `dvh`: on iPhone Chrome, `100dvh` resolves
// taller than the visible viewport before the address bar settles,
// cropping the heading under browser chrome.
//
// Below `md`: AuthVisual renders nothing, form panel fills full-bleed.
// From `md`: photo reused as a backdrop, tinted (not blurred) since
// backdrop-filter creates an unwanted containing block for fixed descendants.
// Same photo as AuthVisual — keep both in sync if swapped.
export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="relative h-svh overflow-hidden md:flex md:items-center md:justify-center md:p-6 lg:p-10">
			<div aria-hidden className="fixed inset-0 -z-10 hidden md:block">
				<Image
					src="/auth-image-desktop.png"
					alt=""
					fill
					quality={90}
					sizes="100vw"
					className="object-cover object-right"
				/>
				<div className="absolute inset-0 bg-fz-ink/55" />
			</div>

			{/* h-full: fills the fixed-height shell instead of growing past it. */}
			<div className="flex h-full flex-col md:w-full md:max-w-6xl md:flex-row md:overflow-hidden md:rounded-4xl md:border md:border-white/10 md:bg-card md:shadow-2xl">
				<AuthFormPanel>
					<GuestOnlyGuard>{children}</GuestOnlyGuard>
				</AuthFormPanel>

				<AuthVisual />
			</div>
		</div>
	);
}
