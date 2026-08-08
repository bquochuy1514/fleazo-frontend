import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// Ink, not moss — moss stays reserved for price tags and the save-button
// active state (see AGENTS.md → Design System); a filled star is a
// different kind of "selected" state, same family as tab/status dots
// elsewhere in the app, which all use ink too.
export function StarRatingDisplay({
	rating,
	size = 'size-4',
}: {
	rating: number;
	size?: string;
}) {
	return (
		<div className="flex items-center gap-0.5" aria-label={`${rating} trên 5 sao`}>
			{[1, 2, 3, 4, 5].map((n) => (
				<Star
					key={n}
					aria-hidden
					className={cn(size, n <= Math.round(rating) ? 'fill-fz-ink text-fz-ink' : 'text-border')}
				/>
			))}
		</div>
	);
}

export function StarRatingInput({
	value,
	onChange,
}: {
	value: number;
	onChange: (value: number) => void;
}) {
	return (
		<div className="flex items-center gap-1" role="radiogroup" aria-label="Chọn số sao">
			{[1, 2, 3, 4, 5].map((n) => (
				<button
					key={n}
					type="button"
					role="radio"
					aria-checked={n === value}
					aria-label={`${n} sao`}
					onClick={() => onChange(n)}
					className="rounded-md p-1 transition-transform active:scale-90"
				>
					<Star
						aria-hidden
						className={cn('size-7', n <= value ? 'fill-fz-ink text-fz-ink' : 'text-border')}
					/>
				</button>
			))}
		</div>
	);
}
