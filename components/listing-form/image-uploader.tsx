'use client';

import {
	useEffect,
	useRef,
	useState,
	type PointerEvent as ReactPointerEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { GripVertical, ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import type { ProductImageOrderItem } from '@/lib/products';
import { cn } from '@/lib/utils';

export type ImageItem = { file: File; previewUrl: string };
export type ExistingImage = { id: number; url: string };

type ImageEntry =
	| { key: string; type: 'existing'; image: ExistingImage }
	| { key: string; type: 'new'; image: ImageItem };

type DragPreview = { imageUrl: string; x: number; y: number };

type ImageUploaderProps = {
	onChange?: (items: ImageItem[]) => void;
	// Edit mode: pre-existing images are placed before new uploads initially.
	initialImages?: ExistingImage[];
	onExistingImagesChange?: (remainingIds: number[]) => void;
	onOrderChange?: (
		order: ProductImageOrderItem[],
		coverPreviewUrl: string | undefined,
	) => void;
	// Comes from the seller's membership plan (plan.maxImagesPerListing).
	// Defaults to Infinity ("not known yet"), NOT a guessed finite number —
	// a guessed default that's too low would trim/reject a seller's own
	// existing images in edit mode before the real membership fetch resolves
	// (e.g. a Premium seller's 6-image listing getting cut to 3 for a
	// heartbeat because the caller hasn't learned they're Premium yet).
	// Only restricts once the caller passes the real value.
	maxImages?: number;
};

const toEntry = (image: ExistingImage): ImageEntry => ({
	key: `existing-${image.id}`,
	type: 'existing',
	image,
});

export function ImageUploader({
	onChange,
	initialImages,
	onExistingImagesChange,
	onOrderChange,
	maxImages = Infinity,
}: ImageUploaderProps) {
	const [entries, setEntries] = useState<ImageEntry[]>(() =>
		(initialImages ?? []).map(toEntry),
	);
	const entriesRef = useRef(entries);
	const [draggingKey, setDraggingKey] = useState<string | null>(null);
	const [dragOverKey, setDragOverKey] = useState<string | null>(null);
	const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
	const touchDrag = useRef<{
		key: string;
		startX: number;
		startY: number;
		started: boolean;
	} | null>(null);

	const commit = (next: ImageEntry[]) => {
		entriesRef.current = next;
		setEntries(next);
		const coverPreviewUrl = next[0]
			? next[0].type === 'existing'
				? next[0].image.url
				: next[0].image.previewUrl
			: undefined;
		const newItems = next
			.filter((entry): entry is Extract<ImageEntry, { type: 'new' }> => entry.type === 'new')
			.map((entry) => entry.image);
		const remainingIds = next
			.filter(
				(entry): entry is Extract<ImageEntry, { type: 'existing' }> =>
					entry.type === 'existing',
			)
			.map((entry) => entry.image.id);
		const newFileIndex = new Map(
			newItems.map((item, index) => [item.previewUrl, index]),
		);

		onChange?.(newItems);
		onExistingImagesChange?.(remainingIds);
		onOrderChange?.(
			next.map((entry): ProductImageOrderItem => {
				if (entry.type === 'existing') {
					return { type: 'existing', id: entry.image.id };
				}
				return {
					type: 'new',
					fileIndex: newFileIndex.get(entry.image.previewUrl) ?? 0,
				};
			}),
			coverPreviewUrl,
		);
	};

	// maxImages can drop after mount (the caller starts with a conservative
	// default, then corrects once the real membership plan loads). If that
	// leaves more images attached than the plan actually allows, trim from
	// the end and say why — silently dropping images with no explanation
	// would look like data loss.
	useEffect(() => {
		if (entriesRef.current.length <= maxImages) return;
		const dropped = entriesRef.current.length - maxImages;
		commit(entriesRef.current.slice(0, maxImages));
		toast.error(
			`Gói của bạn chỉ cho phép tối đa ${maxImages} ảnh mỗi tin — đã bỏ bớt ${dropped} ảnh cuối.`,
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [maxImages]);

	const move = (fromKey: string, toKey: string) => {
		if (fromKey === toKey) return;
		const current = entriesRef.current;
		const fromIndex = current.findIndex((entry) => entry.key === fromKey);
		const toIndex = current.findIndex((entry) => entry.key === toKey);
		if (fromIndex < 0 || toIndex < 0) return;

		const next = [...current];
		const [moved] = next.splice(fromIndex, 1);
		next.splice(toIndex, 0, moved);
		commit(next);
	};

	const beginDrag = (
		key: string,
		imageUrl: string,
		x: number,
		y: number,
	) => {
		setDraggingKey(key);
		setDragPreview({ imageUrl, x, y });
	};

	const updateDragPreview = (x: number, y: number) => {
		setDragPreview((current) => (current ? { ...current, x, y } : current));
	};

	const handleAdd = (fileList: FileList | null) => {
		if (!fileList) return;
		// No explicit ImageEntry return type here — that would widen this to
		// the existing|new union and lose the `.image.previewUrl` access below.
		const newEntries = Array.from(fileList).map((file) => {
			const previewUrl = URL.createObjectURL(file);
			return {
				key: `new-${previewUrl}`,
				type: 'new' as const,
				image: { file, previewUrl },
			};
		});

		const combined = [...entriesRef.current, ...newEntries];
		const overflow = combined.length - maxImages;
		if (overflow > 0) {
			// Revoke the object URLs for the files that won't make the cut —
			// otherwise they leak until the page unloads.
			newEntries
				.slice(newEntries.length - overflow)
				.forEach((entry) => URL.revokeObjectURL(entry.image.previewUrl));
			toast.error(
				`Bạn chỉ có thể thêm tối đa ${maxImages} ảnh — đã bỏ qua ${overflow} ảnh cuối cùng bạn vừa chọn.`,
			);
		}
		commit(combined.slice(0, maxImages));
	};

	const handleRemove = (key: string) => {
		const removed = entriesRef.current.find((entry) => entry.key === key);
		if (removed?.type === 'new') URL.revokeObjectURL(removed.image.previewUrl);
		commit(entriesRef.current.filter((entry) => entry.key !== key));
	};

	const handleTouchMove = (
		event: ReactPointerEvent<HTMLDivElement>,
		key: string,
		imageUrl: string,
	) => {
		if (event.pointerType !== 'touch') return;
		const gesture = touchDrag.current;
		if (!gesture || gesture.key !== key) return;

		if (!gesture.started) {
			const distance = Math.hypot(
				event.clientX - gesture.startX,
				event.clientY - gesture.startY,
			);
			if (distance < 8) return;
			gesture.started = true;
			beginDrag(key, imageUrl, event.clientX, event.clientY);
		}

		event.preventDefault();
		updateDragPreview(event.clientX, event.clientY);
		const target = document
			.elementFromPoint(event.clientX, event.clientY)
			?.closest<HTMLElement>('[data-image-key]')
			?.dataset.imageKey;
		if (target && target !== key) {
			setDragOverKey(target);
			move(key, target);
		}
	};

	const endTouchDrag = () => {
		touchDrag.current = null;
		setDraggingKey(null);
		setDragOverKey(null);
		setDragPreview(null);
	};

	return (
		<div>
			<div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
				{entries.map((entry, index) => {
					const imageUrl =
						entry.type === 'existing'
							? entry.image.url
							: entry.image.previewUrl;

					return (
						<div
							key={entry.key}
							data-image-key={entry.key}
							draggable
							onDragStart={(event) => {
								event.dataTransfer.effectAllowed = 'move';
								event.dataTransfer.setData('text/plain', entry.key);
								const rect = event.currentTarget.getBoundingClientRect();
								event.dataTransfer.setDragImage(
									event.currentTarget,
									rect.width / 2,
									rect.height / 2,
								);
								beginDrag(
									entry.key,
									imageUrl,
									event.clientX,
									event.clientY,
								);
							}}
							onDrag={(event) =>
								updateDragPreview(event.clientX, event.clientY)
							}
							onDragOver={(event) => event.preventDefault()}
							onDragEnter={() => setDragOverKey(entry.key)}
							onDrop={(event) => {
								event.preventDefault();
								move(
									event.dataTransfer.getData('text/plain') ||
										draggingKey ||
										entry.key,
									entry.key,
								);
								endTouchDrag();
							}}
							onDragEnd={endTouchDrag}
							onPointerDown={(event) => {
								if (
									event.pointerType !== 'touch' ||
									(event.target as HTMLElement).closest('[data-image-remove]')
								)
									return;
								event.currentTarget.setPointerCapture(event.pointerId);
								touchDrag.current = {
									key: entry.key,
									startX: event.clientX,
									startY: event.clientY,
									started: false,
								};
							}}
							onPointerMove={(event) =>
								handleTouchMove(event, entry.key, imageUrl)
							}
							onPointerUp={endTouchDrag}
							onPointerCancel={endTouchDrag}
							className={cn(
								'relative aspect-square touch-none cursor-grab overflow-hidden rounded-xl border border-border bg-muted transition-[opacity,transform,box-shadow] duration-150 active:cursor-grabbing',
								draggingKey === entry.key &&
									'scale-[0.97] cursor-grabbing opacity-55',
								dragOverKey === entry.key &&
									'border-fz-ink ring-2 ring-fz-ink/20',
							)}
						>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={imageUrl} alt="" className="size-full object-cover" />
							{index === 0 && (
								<span className="absolute top-1.5 left-1.5 rounded-md bg-fz-ink/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
									Ảnh bìa
								</span>
							)}
							<span
								aria-hidden
								className="pointer-events-none absolute bottom-1.5 left-1.5 flex size-6 items-center justify-center rounded-full bg-fz-ink/65 text-white"
							>
								<GripVertical className="size-3.5" />
							</span>
							<button
								type="button"
								data-image-remove
								onPointerDown={(event) => event.stopPropagation()}
								onClick={() => handleRemove(entry.key)}
								aria-label="Xoá ảnh"
								className="absolute top-1.5 right-1.5 flex size-7 cursor-pointer items-center justify-center rounded-full bg-fz-ink/70 text-white transition-colors hover:bg-fz-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
							>
								<X className="size-3.5" />
							</button>
						</div>
					);
				})}

				{entries.length < maxImages && (
					<label
						className={cn(
							'flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-muted/40 text-muted-foreground transition-colors hover:border-ring hover:bg-muted hover:text-fz-ink',
						)}
					>
						<ImagePlus className="size-6" />
						<span className="text-xs font-medium">Thêm ảnh</span>
						<input
							type="file"
							accept="image/*"
							multiple
							className="hidden"
							onChange={(event) => {
								handleAdd(event.target.files);
								event.target.value = '';
							}}
						/>
					</label>
				)}
			</div>

			{dragPreview &&
				typeof document !== 'undefined' &&
				createPortal(
					<div
						aria-hidden
						className="pointer-events-none fixed z-[100] size-24 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border-2 border-white bg-muted shadow-xl shadow-fz-ink/25"
						style={{
							left: dragPreview.x,
							top: dragPreview.y,
						}}
					>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={dragPreview.imageUrl}
							alt=""
							className="size-full object-cover"
						/>
					</div>,
					document.body,
				)}

			<p className="mt-2 text-xs text-muted-foreground">
				Giữ và kéo ảnh để đổi thứ tự. Ảnh đầu tiên là ảnh bìa hiển thị ở
				danh sách tin đăng.
				{Number.isFinite(maxImages) && ` Tối đa ${maxImages} ảnh.`}
			</p>
		</div>
	);
}
