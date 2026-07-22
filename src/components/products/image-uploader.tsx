'use client';

import { useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ImageUploaderProps = {
	onChange?: (files: File[]) => void;
};

export function ImageUploader({ onChange }: ImageUploaderProps) {
	const [items, setItems] = useState<{ file: File; previewUrl: string }[]>(
		[],
	);

	const handleAdd = (fileList: FileList | null) => {
		if (!fileList) return;
		const newItems = Array.from(fileList).map((file) => ({
			file,
			previewUrl: URL.createObjectURL(file),
		}));
		const next = [...items, ...newItems];
		setItems(next);
		onChange?.(next.map((i) => i.file));
	};

	const handleRemove = (index: number) => {
		const next = items.filter((_, i) => i !== index);
		setItems(next);
		onChange?.(next.map((i) => i.file));
	};

	return (
		<div>
			<div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
				{items.map((item, index) => (
					<div
						key={item.previewUrl}
						className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
					>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={item.previewUrl}
							alt=""
							className="size-full object-cover"
						/>
						{index === 0 && (
							<span className="absolute top-1.5 left-1.5 rounded-md bg-fz-ink/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
								Ảnh bìa
							</span>
						)}
						<button
							type="button"
							onClick={() => handleRemove(index)}
							className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-fz-ink/70 text-white hover:bg-fz-ink"
						>
							<X className="size-3.5" />
						</button>
					</div>
				))}

				<label
					className={cn(
						'flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-fz-primary hover:text-fz-primary',
					)}
				>
					<ImagePlus className="size-6" />
					<span className="text-xs font-medium">Thêm ảnh</span>
					<input
						type="file"
						accept="image/*"
						multiple
						className="hidden"
						onChange={(e) => handleAdd(e.target.files)}
					/>
				</label>
			</div>

			<p className="mt-2 text-xs text-muted-foreground">
				Ảnh đầu tiên sẽ là ảnh bìa hiển thị ở danh sách tin đăng. Tối đa
				10 ảnh.
			</p>
		</div>
	);
}
