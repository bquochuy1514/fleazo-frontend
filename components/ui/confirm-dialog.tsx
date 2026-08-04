'use client';

import { Loader2 } from 'lucide-react';
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
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="font-heading font-semibold tracking-tight">
						{title}
					</DialogTitle>
					<DialogDescription className="leading-6">
						{description}
					</DialogDescription>
				</DialogHeader>

				{children}

				<DialogFooter>
					<DialogClose asChild>
						<Button
							variant="outline"
							size="lg"
							disabled={isLoading}
							className="h-11 sm:h-9"
						>
							{cancelLabel}
						</Button>
					</DialogClose>
					<Button
						variant={variant}
						size="lg"
						disabled={isLoading}
						onClick={onConfirm}
						className="h-11 sm:h-9"
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
