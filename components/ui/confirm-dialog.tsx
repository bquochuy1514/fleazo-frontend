'use client';

import { AlertTriangle, CircleAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

// One controlled instance per page, driven by a `{ target, action } | null`
// state — not one dialog mounted per row.
//
// cancelLabel defaults to "Quay lại", never "Huỷ": these dialogs sit next to a
// confirm button reading "Huỷ tin", and "Huỷ / Huỷ tin" side by side is
// genuinely ambiguous about which one aborts.
export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel,
	cancelLabel = 'Quay lại',
	variant = 'default',
	isLoading = false,
	children,
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: React.ReactNode;
	confirmLabel: string;
	cancelLabel?: string;
	variant?: 'default' | 'destructive';
	isLoading?: boolean;
	// Extra controls between description and footer (e.g. a "don't show again"
	// checkbox on the edit-an-active-listing warning).
	children?: React.ReactNode;
	onConfirm: () => void | Promise<void>;
}) {
	const DialogIcon = variant === 'destructive' ? AlertTriangle : CircleAlert;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
				<div className="flex gap-3 px-5 pt-6 pb-5 sm:px-6">
					<div
						aria-hidden
						className={
							variant === 'destructive'
								? 'flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive'
								: 'flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'
						}
					>
						<DialogIcon className="size-4" />
					</div>
					<DialogHeader className="min-w-0 flex-1 gap-2 pr-6">
						<DialogTitle className="font-heading text-lg leading-tight font-semibold tracking-tight">
						{title}
					</DialogTitle>
					<DialogDescription className="leading-6">
						{description}
					</DialogDescription>
					</DialogHeader>
				</div>

				{children && (
					<div className="border-t border-border px-5 py-4 sm:px-6">
						{children}
					</div>
				)}

				<DialogFooter className="-mx-0 -mb-0 rounded-none border-border bg-muted/35 px-5 py-3 sm:px-6">
					<DialogClose asChild>
						<Button
							variant="outline"
							size="lg"
							disabled={isLoading}
							className="min-h-11 flex-1 sm:flex-none"
						>
							{cancelLabel}
						</Button>
					</DialogClose>
					<Button
						variant={variant}
						size="lg"
						disabled={isLoading}
						onClick={onConfirm}
						className="min-h-11 flex-1 sm:flex-none"
					>
						{isLoading && (
							<Loader2
								aria-hidden
								data-icon="inline-start"
								className="animate-spin"
							/>
						)}
						{confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
