'use client';

import { useState } from 'react';
import Image, { type ImageLoaderProps } from 'next/image';
import { ChevronLeft, ChevronRight, ImageIcon, X } from 'lucide-react';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { ProductImage } from '@/types/product.types';

function cloudinaryDetailLoader({ src, width }: ImageLoaderProps) {
	return src.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}

export function ListingGallery({
	images,
	title,
}: {
	images: ProductImage[];
	title: string;
}) {
	const [activeIndex, setActiveIndex] = useState(0);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [failedUrls, setFailedUrls] = useState<Set<string>>(() => new Set());

	if (images.length === 0) {
		return (
			<div className="flex aspect-square items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground lg:aspect-[4/3]">
				<ImageIcon aria-hidden className="size-10" />
				<span className="sr-only">Tin đăng chưa có ảnh</span>
			</div>
		);
	}

	const active = images[activeIndex];
	const activeFailed = failedUrls.has(active.url);
	const markImageFailed = (url: string) => {
		setFailedUrls((current) => {
			if (current.has(url)) return current;
			return new Set(current).add(url);
		});
	};
	const showPrev = () =>
		setActiveIndex((index) => (index - 1 + images.length) % images.length);
	const showNext = () => setActiveIndex((index) => (index + 1) % images.length);

	return (
		<>
			<div className="flex flex-col gap-3 lg:flex-row">
				{images.length > 1 && (
					<div className="order-2 flex gap-2 overflow-x-auto pb-1 lg:order-1 lg:w-20 lg:flex-col lg:overflow-x-visible lg:overflow-y-auto lg:pb-0">
						{images.map((image, index) => {
							const imageFailed = failedUrls.has(image.url);

							return (
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
									{imageFailed ? (
										<span className="flex size-full items-center justify-center bg-muted text-muted-foreground">
											<ImageIcon aria-hidden className="size-5" />
										</span>
									) : (
										<Image
											loader={cloudinaryDetailLoader}
											src={image.url}
											alt=""
											fill
											sizes="80px"
											onError={() => markImageFailed(image.url)}
											className="object-cover"
										/>
									)}
								</button>
							);
						})}
					</div>
				)}

				<button
					type="button"
					onClick={() => setLightboxOpen(true)}
					className="relative order-1 block aspect-square w-full flex-1 overflow-hidden rounded-2xl border border-border bg-muted lg:order-2 lg:aspect-[4/3] lg:w-auto"
				>
					{activeFailed ? (
						<ImageFallback className="text-muted-foreground" />
					) : (
						<Image
							loader={cloudinaryDetailLoader}
							src={active.url}
							alt={title}
							fill
							priority
							sizes="(min-width: 1024px) 60vw, 100vw"
							onError={() => markImageFailed(active.url)}
							className="object-contain"
						/>
					)}
				</button>
			</div>

			<Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
				<DialogContent
					showCloseButton={false}
					overlayClassName="bg-fz-ink/95 backdrop-blur-none"
					className="max-w-[calc(100%-2rem)] gap-0 border-none bg-transparent p-0 ring-0 sm:max-w-2xl"
				>
					<DialogTitle className="sr-only">{title}</DialogTitle>
					<div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black">
						{activeFailed ? (
							<ImageFallback className="text-white/60" />
						) : (
							<Image
								loader={cloudinaryDetailLoader}
								src={active.url}
								alt={title}
								fill
								sizes="90vw"
								onError={() => markImageFailed(active.url)}
								className="object-contain"
							/>
						)}
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

function ImageFallback({ className }: { className: string }) {
	return (
		<span className={cn('flex size-full items-center justify-center', className)}>
			<ImageIcon aria-hidden className="size-10" />
			<span className="sr-only">Không thể tải ảnh tin đăng</span>
		</span>
	);
}
