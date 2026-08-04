'use client';

import { useState } from 'react';
import { Package } from 'lucide-react';
import Image, { type ImageLoaderProps } from 'next/image';

function cloudinarySquare({ src, width }: ImageLoaderProps) {
	return src.replace(
		'/upload/',
		`/upload/f_auto,q_auto,c_fill,g_auto,ar_1:1,w_${width}/`,
	);
}

export function CategoryThumbnail({
	src,
	alt,
	priority = false,
}: {
	src: string | null;
	alt: string;
	priority?: boolean;
}) {
	const [failed, setFailed] = useState(!src);

	return (
		<div className="relative aspect-square overflow-hidden rounded-2xl bg-muted sm:rounded-3xl">
			{src && !failed ? (
				<Image
					loader={cloudinarySquare}
					src={src}
					fill
					sizes="(min-width: 1024px) 29vw, (min-width: 640px) 31vw, 50vw"
					alt={alt}
					priority={priority}
					onError={() => setFailed(true)}
					className="absolute inset-0 size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.025] motion-reduce:transition-none"
				/>
			) : (
				<span className="absolute inset-0 flex items-center justify-center bg-fz-accent-soft text-fz-accent">
					<Package aria-hidden className="size-10" />
					<span className="sr-only">Không thể tải ảnh danh mục</span>
				</span>
			)}
		</div>
	);
}
