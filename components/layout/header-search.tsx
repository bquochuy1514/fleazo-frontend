'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Desktop: the field grows leftward out of the trigger, into the header's
// empty middle space — the icons to the trigger's right never shift.
// Mobile: the header pill has no room for that, so it opens as an overlay.
export function HeaderSearch() {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const desktopRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		inputRef.current?.focus();

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpen(false);
		};
		const onPointerDown = (e: PointerEvent) => {
			if (!desktopRef.current?.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('pointerdown', onPointerDown);
		return () => {
			document.removeEventListener('keydown', onKeyDown);
			document.removeEventListener('pointerdown', onPointerDown);
		};
	}, [open]);

	const submit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const q = new FormData(e.currentTarget).get('q');
		const keyword = typeof q === 'string' ? q.trim() : '';
		if (!keyword) return;
		setOpen(false);
		router.push(`/tim-kiem?q=${encodeURIComponent(keyword)}`);
	};

	return (
		<>
			{/* Desktop. The field is always mounted so it can animate its own
			    width; collapsed it's zero-width and inert, which also keeps it
			    out of the tab order. */}
			<div ref={desktopRef} className="hidden items-center md:flex">
				<form onSubmit={submit} className="flex items-center">
					<div
						className={cn(
							'overflow-hidden transition-[width,opacity] duration-200 ease-out motion-reduce:transition-none',
							open ? 'w-56 opacity-100' : 'w-0 opacity-0',
						)}
					>
						<Input
							ref={inputRef}
							name="q"
							type="search"
							placeholder="Tìm sách, laptop, xe đạp..."
							aria-label="Tìm kiếm"
							aria-hidden={!open}
							tabIndex={open ? 0 : -1}
							autoComplete="off"
							className="h-9 rounded-full pr-3 pl-4"
						/>
					</div>
					<Button
						type={open ? 'submit' : 'button'}
						variant="ghost"
						size="icon"
						aria-label={open ? 'Tìm kiếm' : 'Mở ô tìm kiếm'}
						aria-expanded={open}
						onClick={() => {
							if (!open) setOpen(true);
						}}
					>
						<Search className="size-5" />
					</Button>
				</form>
			</div>

			{/* Mobile trigger */}
			<Button
				variant="ghost"
				size="icon"
				aria-label="Mở ô tìm kiếm"
				aria-expanded={open}
				className="md:hidden"
				onClick={() => setOpen(true)}
			>
				<Search className="size-5" />
			</Button>

			{open && (
				<div
					role="dialog"
					aria-modal="true"
					aria-label="Tìm kiếm"
					className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm md:hidden"
					onClick={(e) => {
						if (e.target === e.currentTarget) setOpen(false);
					}}
				>
					<div className="flex items-center gap-2 px-4 pt-5">
						<form onSubmit={submit} className="flex flex-1 gap-2">
							<Input
								ref={inputRef}
								name="q"
								type="search"
								placeholder="Tìm sách, laptop, xe đạp..."
								aria-label="Tìm kiếm"
								autoComplete="off"
								className="h-11 flex-1 rounded-full px-4"
							/>
							<Button type="submit" size="icon-lg" aria-label="Tìm kiếm">
								<Search className="size-5" />
							</Button>
						</form>
						<Button
							variant="ghost"
							size="icon-lg"
							aria-label="Đóng"
							onClick={() => setOpen(false)}
						>
							<X className="size-5" />
						</Button>
					</div>
				</div>
			)}
		</>
	);
}
