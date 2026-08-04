'use client';

import { useState } from 'react';
import Image, { type ImageLoaderProps } from 'next/image';
import { ImageIcon } from 'lucide-react';

function cloudinaryListingLoader({ src, width }: ImageLoaderProps) {
	return src.replace('/upload/', `/upload/f_auto,q_auto,c_fill,g_auto,w_${width}/`);
}

export function ListingThumbnail({ src, alt }: { src?: string; alt: string }) {
	const [failed, setFailed] = useState(!src);
	const isBlobPreview = src?.startsWith('blob:');

	if (!src || failed) {
		return (
			<div className="flex size-full items-center justify-center text-muted-foreground">
				<ImageIcon aria-hidden className="size-8" />
				<span className="sr-only">Không thể tải ảnh tin đăng</span>
			</div>
		);
	}

	if (isBlobPreview) {
		return (
			// next/image cannot render a local blob preview before the upload finishes.
			// eslint-disable-next-line @next/next/no-img-element
			<img
				src={src}
				alt={alt}
				className="size-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
			/>
		);
	}

	return (
		<Image
			loader={cloudinaryListingLoader}
			src={src}
			alt={alt}
			fill
			sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
			onError={() => setFailed(true)}
			className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
		/>
	);
}
