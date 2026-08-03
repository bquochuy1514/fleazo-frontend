'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ImageIcon, X } from 'lucide-react';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { ProductImage } from '@/types/product.types';

// Sorted once by the caller; order=0 is the cover.
export function ProductGallery({
	images,
	title,
}: {
	images: ProductImage[];
	title: string;
}) {
	const [activeIndex, setActiveIndex] = useState(0);
	const [lightboxOpen, setLightboxOpen] = useState(false);

	if (images.length === 0) {
		return (
			<div className="flex aspect-square items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground lg:aspect-[4/3]">
				<ImageIcon className="size-10" />
			</div>
		);
	}

	const active = images[activeIndex];
	const showPrev = () =>
		setActiveIndex((i) => (i - 1 + images.length) % images.length);
	const showNext = () => setActiveIndex((i) => (i + 1) % images.length);

	return (
		<>
			{/* Below lg: thumbnails as a horizontal strip under the image.
			    At lg+: fixed-width vertical rail on the left, image fills the rest. */}
			<div className="flex flex-col gap-3 lg:flex-row">
				{images.length > 1 && (
					<div className="order-2 flex gap-2 overflow-x-auto pb-1 lg:order-1 lg:w-20 lg:flex-col lg:overflow-x-visible lg:overflow-y-auto lg:pb-0">
						{images.map((image, index) => (
							<button
								key={image.id}
								type="button"
								onClick={() => setActiveIndex(index)}
								aria-label={`Ảnh ${index + 1}`}
								aria-current={index === activeIndex}
								className={cn(
									'relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors sm:size-20',
									index === activeIndex
										? 'border-fz-ink'
										: 'border-transparent hover:border-border',
								)}
							>
								<Image
									src={image.url}
									alt=""
									fill
									sizes="80px"
									className="object-cover"
								/>
							</button>
						))}
					</div>
				)}

				{/* aspect-square below lg; 4:3 at lg+ to avoid an overly tall hero pushing content down. */}
				<button
					type="button"
					onClick={() => setLightboxOpen(true)}
					className="relative order-1 block aspect-square w-full flex-1 overflow-hidden rounded-2xl border border-border bg-muted lg:order-2 lg:aspect-[4/3] lg:w-auto"
				>
					<Image
						src={active.url}
						alt={title}
						fill
						priority
						sizes="(min-width: 1024px) 60vw, 100vw"
						className="object-cover"
					/>
				</button>
			</div>

			<Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
				{/* Near-opaque overlay: default is too transparent, letting the gallery image's swap show through behind the lightbox. */}
				<DialogContent
					showCloseButton={false}
					overlayClassName="bg-fz-ink/95 backdrop-blur-none"
					className="max-w-[calc(100%-2rem)] gap-0 border-none bg-transparent p-0 ring-0 sm:max-w-2xl"
				>
					{/* Visually hidden — required for screen readers, image is the real content. */}
					<DialogTitle className="sr-only">{title}</DialogTitle>
					<div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black">
						<Image
							src={active.url}
							alt={title}
							fill
							sizes="90vw"
							className="object-contain"
						/>
						{/* Custom close button — default is invisible against this dialog's black backdrop. */}
						<DialogClose
							aria-label="Đóng"
							className="absolute top-2 right-2 flex size-9 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
						>
							<X className="size-5" />
						</DialogClose>
						{images.length > 1 && (
							<>
								<button
									type="button"
									onClick={showPrev}
									aria-label="Ảnh trước"
									className="absolute top-1/2 left-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
								>
									<ChevronLeft className="size-5" />
								</button>
								<button
									type="button"
									onClick={showNext}
									aria-label="Ảnh sau"
									className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
								>
									<ChevronRight className="size-5" />
								</button>
							</>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
