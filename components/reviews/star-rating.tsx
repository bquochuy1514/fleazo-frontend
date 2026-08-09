import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// Ink, not moss — moss is reserved for price tags and the save-button's
// active state; a filled star is a different kind of "selected" state, same
// family as tab/status dots elsewhere in the app, which all use ink too.
//
// Each star fills by its own percentage (e.g. star 4 of a 3.5 rating fills
// 50%) rather than rounding to the nearest whole star, via a clipped overlay
// star on top of an outline star.
export function StarRatingDisplay({
	rating,
	size = 'size-4',
}: {
	rating: number;
	size?: string;
}) {
	return (
		<div className="flex items-center gap-0.5" aria-label={`${rating} trên 5 sao`}>
			{[1, 2, 3, 4, 5].map((n) => {
				const fillPercent = Math.round(Math.min(1, Math.max(0, rating - (n - 1))) * 100);
				return (
					<span key={n} className={cn('relative inline-block shrink-0', size)}>
						<Star aria-hidden className={cn(size, 'text-border')} />
						<span
							className="absolute inset-0 overflow-hidden"
							style={{ width: `${fillPercent}%` }}
						>
							<Star aria-hidden className={cn(size, 'fill-fz-ink text-fz-ink')} />
						</span>
					</span>
				);
			})}
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
