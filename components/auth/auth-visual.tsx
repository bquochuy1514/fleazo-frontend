import Image from 'next/image';
import { Logo } from '@/components/logo';

// Photo panel for (auth) pages — desktop/tablet only, no photo below `md`
// (mobile auth leads with the form; see AuthFormPanel's md:hidden logo).
// Inset panel on the LEFT from `md`: right side would put the form panel's
// scrollbar right at the seam with the photo.
// No route word overlay — the form panel's own <h1> already covers that.
// Purely presentational, no 'use client' needed.
// `-order-1` only matters for desktop row order now (mobile never renders this).
// `/auth-image-desktop.png` (~4:5) is the real photo; re-crop by eye if swapped,
// don't trust 4:5 as exact. `/auth-image-mobile.png` is unused, left in /public.
export function AuthVisual() {
	return (
		<div className="relative -order-1 hidden overflow-hidden md:block md:h-auto md:w-[52%] md:overflow-visible md:p-3 lg:p-4">
			{/* Only this inner layer is rounded — outer wrapper stays a plain
			    rectangle so its padding reads as the card's paper framing it. */}
			<div className="relative size-full overflow-hidden md:rounded-3xl">
				<Image
					src="/auth-image-desktop.png"
					alt=""
					fill
					priority
					quality={90}
					sizes="(min-width: 768px) 52vw, 0px"
					className="object-cover object-right"
				/>

				{/* Dark near top only, for the logo mark's contrast. */}
				<div className="absolute inset-0 bg-gradient-to-b from-fz-ink/50 via-transparent to-transparent" />

				<Logo
					size="lg"
					className="absolute top-5 left-5 text-white md:top-6 md:left-6"
				/>
			</div>
		</div>
	);
}
