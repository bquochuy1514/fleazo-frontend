import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({
	className,
	mark = false,
	clickable = true,
}: {
	className?: string;
	mark?: boolean;
	clickable?: boolean;
}) {
	const image = (
		<>
			<Image
				src="/fleazo-logo.png"
				alt="Fleazo"
				width={284}
				height={95}
				priority
				className={cn(
					'h-12 w-auto',
					mark && 'hidden sm:block',
					className,
				)}
			/>
			{mark && (
				<Image
					src="/fleazo-mark.png"
					alt="Fleazo"
					width={40}
					height={40}
					priority
					className="size-12 sm:hidden"
				/>
			)}
		</>
	);

	// clickable=false: purely decorative display, no link to "/" — used on
	// (auth) pages where the goal is just showing the mark, not navigation.
	if (!clickable) {
		return <span className="inline-block shrink-0">{image}</span>;
	}

	return (
		<Link
			href="/"
			className="inline-block shrink-0 transition-opacity hover:opacity-80"
		>
			{image}
		</Link>
	);
}
