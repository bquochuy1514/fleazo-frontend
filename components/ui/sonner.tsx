'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';

// Simplified from fleazo-frontend's version, which drives `theme` off
// next-themes — that package isn't installed here (v2's dark mode is plain
// `prefers-color-scheme` in globals.css, no runtime toggle to sync yet).
// theme="system" alone already follows the OS setting; re-add next-themes
// here if this repo ever grows a manual light/dark switch.
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
