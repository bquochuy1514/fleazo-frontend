'use client';

import * as React from 'react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

// On the surface radius scale (rounded-md), not the pill scale — a checkbox
// is a small binary control, not one of the system's tap targets that read
// as buttons (see globals.css: "Pill = interactive, radius scale = surface").
// Checked state is ink, matching --primary — moss stays reserved for price
// tags and the save toggle, this isn't either.
function Checkbox({
	className,
	...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
	return (
		<CheckboxPrimitive.Root
			data-slot="checkbox"
			className={cn(
				'peer size-5 shrink-0 rounded-md border border-input outline-none transition-colors data-[state=checked]:border-fz-ink data-[state=checked]:bg-fz-ink focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50',
				className,
			)}
			{...props}
		>
			<CheckboxPrimitive.Indicator className="flex items-center justify-center text-primary-foreground">
				<Check className="size-3.5" strokeWidth={3} />
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	);
}

export { Checkbox };
