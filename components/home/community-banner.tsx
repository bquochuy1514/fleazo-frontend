import Image from 'next/image';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

// The one section on the homepage with no eyebrow/H2/subcopy formula —
// full-bleed (no mx-auto max-w-*, same trick footer.tsx's CTA band uses)
// on purpose, so it reads as a break in rhythm between Categories and Feed,
// not a fourth copy of the same block.
export function CommunityBanner() {
	return (
		<section
			data-hero
			className="relative isolate flex min-h-[60vh] items-center overflow-hidden sm:min-h-[70vh]"
		>
			<Image
				src="/beautiful-image.jpg"
				alt=""
				fill
				sizes="100vw"
				className="object-cover object-[center_35%]"
			/>
			{/* Stays dark across the full width below lg — the statement wraps
			    edge-to-edge there, so a light right end would drop it below AA.
			    Only lg+, where the text stops well short of the right, opens up. */}
			<div className="absolute inset-0 bg-gradient-to-r from-fz-ink/80 via-fz-ink/70 to-fz-ink/60 lg:via-fz-ink/68 lg:via-70% lg:to-fz-ink/25" />
			<div className="absolute inset-0 bg-gradient-to-t from-fz-ink/45 via-transparent to-fz-ink/10" />

			<div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
				<ScrollReveal className="max-w-3xl">
					{/* <p>, not <h2> — a brand statement, not a document-outline
					    heading between Categories' and Feed's real H2s. */}
					<p className="font-heading text-[clamp(1.75rem,5vw,3.5rem)] leading-[1.05] font-bold tracking-tight text-balance text-fz-paper">
						Dọn ra khỏi phòng bạn.
						<br />
						Dọn vào phòng người khác.
					</p>
				</ScrollReveal>
			</div>
		</section>
	);
}
