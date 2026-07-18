import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Placeholder only, not wired to product search yet. White pill styled for
// the navy header — not shadcn Input's default look, which assumes a light
// page background.
export function SearchInput() {
	return (
		<div className="relative">
			<Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				type="search"
				placeholder="Tìm giáo trình, laptop, xe đạp cũ..."
				className="h-10 rounded-full border-0 bg-white pl-10 pr-4 text-sm text-fz-ink shadow-inner focus-visible:ring-2 focus-visible:ring-fz-accent"
			/>
		</div>
	);
}
