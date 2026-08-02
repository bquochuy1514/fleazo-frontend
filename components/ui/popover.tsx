'use client';

import * as React from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

function Popover({
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
	return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
	return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverAnchor({
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
	return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

function PopoverContent({
	className,
	align = 'start',
	sideOffset = 8,
	// Radix's own collision-avoidance (flipping side, shrinking via
	// --radix-popover-content-available-height/width) otherwise lets the
	// content butt right up against the viewport edge — it avoids
	// overlapping the trigger, not touching the browser chrome. This keeps a
	// visible gutter on every side once it's had to flip/shift.
	collisionPadding = 12,
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Content
				data-slot="popover-content"
				align={align}
				sideOffset={sideOffset}
				collisionPadding={collisionPadding}
				className={cn(
					'z-50 rounded-2xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg outline-none',
					'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
					'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
					'motion-reduce:animate-none',
					className,
				)}
				{...props}
			/>
		</PopoverPrimitive.Portal>
	);
}

export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent };
