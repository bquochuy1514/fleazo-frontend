import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { buttonVariants } from '@/components/ui/button';
import { getProvinces } from '@/lib/locations';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
	title: 'Không tìm thấy trang — Fleazo',
};

// Global 404, sits directly under the root layout (no route group), so it
// renders its own Header unlike every other page.
export default async function NotFound() {
	const provinces = await getProvinces();

	return (
		<div className="flex min-h-full flex-1 flex-col">
			<Header provinces={provinces} />

			<main className="flex flex-1 flex-col items-center justify-center px-4 pt-24 pb-16 text-center">
				{/* Stacked and centered, not side-by-side, so the wide 612×408 art reads. */}
				<div className="fz-rise w-full max-w-md sm:max-w-lg">
					<Image
						src="/not-found-illustration.png"
						alt=""
						width={612}
						height={408}
						className="h-auto w-full"
						priority
						quality={90}
					/>
				</div>

				<h1
					style={{ animationDelay: '70ms' }}
					className="fz-rise mt-6 font-heading text-3xl font-bold text-fz-ink sm:text-4xl"
				>
					Trang này đã được... dọn đi mất rồi.
				</h1>
				<p
					style={{ animationDelay: '140ms' }}
					className="fz-rise mt-3 max-w-md text-[15px] text-muted-foreground sm:text-base"
				>
					Có thể đường link đã cũ, hoặc trang đã được dời đi nơi khác.
				</p>
				<Link
					href="/"
					style={{ animationDelay: '210ms' }}
					className={cn(
						'fz-rise',
						buttonVariants({ variant: 'default' }),
						'mt-6 h-11 px-6',
					)}
				>
					Về trang chủ
				</Link>
			</main>
		</div>
	);
}
