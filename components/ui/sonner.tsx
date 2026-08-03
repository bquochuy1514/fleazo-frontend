'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';

// theme="system" follows prefers-color-scheme; no next-themes here yet (no manual toggle).
function Toaster(props: ToasterProps) {
	return (
		<Sonner
			theme="system"
			className="toaster group"
			style={
				{
					'--normal-bg':
						'color-mix(in srgb, var(--popover) 70%, transparent)',
					'--normal-text': 'var(--popover-foreground)',
					'--normal-border':
						'color-mix(in srgb, var(--border) 70%, transparent)',
					'--border-radius': 'var(--radius)',
				} as React.CSSProperties
			}
			toastOptions={{
				classNames: {
					toast: 'backdrop-blur-md shadow-lg shadow-black/5',
				},
			}}
			{...props}
		/>
	);
}

export { Toaster };
