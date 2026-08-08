import Link from 'next/link';
import { Logo } from '@/components/logo';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/category.types';

const FOOTER_CATEGORY_LIMIT = 5;

// One combined column — a portfolio project has no ToS/privacy boilerplate
// to warrant a separate "Về Fleazo" column, and a single-link column next
// to a 3-link one would read unbalanced.
const SUPPORT_LINKS = [
	{ href: '/gioi-thieu', label: 'Giới thiệu' },
	{ href: '/huong-dan-dang-tin', label: 'Hướng dẫn đăng tin' },
	{ href: '/lien-he', label: 'Liên hệ' },
	{ href: '/faq', label: 'Câu hỏi thường gặp' },
];

const SOCIAL_LINKS = [
	{ href: 'https://facebook.com', label: 'Facebook' },
	{ href: 'https://instagram.com', label: 'Instagram' },
];

// CTA band + link columns — no newsletter/email capture (no backend feature
// for it). CTA is seller-acquisition, not lead-gen.
export function Footer({ categories = [] }: { categories?: Category[] }) {
	const featuredCategories = categories.slice(0, FOOTER_CATEGORY_LIMIT);

	return (
		<footer className="w-full border-t border-border">
			<div className="relative overflow-hidden bg-fz-ink px-4 py-10">
				{/* Decorative mark, not brand — huge, low-opacity, aria-hidden.
				    Same mask-image trick as Logo (bg-current reads the mask's
				    alpha), just sized up and dropped into currentColor: white. */}
				<span
					aria-hidden
					className="pointer-events-none absolute top-1/2 right-0 hidden size-72 -translate-y-1/2 translate-x-1/4 bg-white opacity-[0.06] sm:block"
					style={{
						maskImage: 'url(/logo.png)',
						WebkitMaskImage: 'url(/logo.png)',
						maskRepeat: 'no-repeat',
						WebkitMaskRepeat: 'no-repeat',
						maskSize: 'contain',
						WebkitMaskSize: 'contain',
						maskPosition: 'center',
						WebkitMaskPosition: 'center',
					}}
				/>

				<div className="relative mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
					<div>
						<p className="flex items-center gap-3 font-heading text-xs font-medium tracking-[0.2em] text-white/60 uppercase">
							<span aria-hidden className="h-px w-8 bg-white/30" />
							Dọn đồ, kiếm tiền
						</p>
						<h2 className="mt-3 font-heading text-2xl font-bold text-white sm:text-3xl">
							Có đồ không dùng nữa?
						</h2>
						<p className="mt-1 text-sm text-white/70">
							Đăng tin miễn phí, tiếp cận hàng ngàn sinh viên quanh
							bạn.
						</p>
					</div>
					<Link
						href="/dang-tin"
						className={cn(
							buttonVariants({ variant: 'secondary', size: 'lg' }),
							'shrink-0',
						)}
					>
						Đăng tin ngay
					</Link>
				</div>
			</div>

			<div className="mx-auto max-w-6xl px-4 py-10">
				<div className="grid grid-cols-1 gap-8 sm:grid-cols-4">
					<div className="sm:col-span-2">
						{/* Full lockup at larger size — footer has room the header doesn't.
						    Not a link: this is a brand mark, not a second "go home"
						    nav item competing with the real links right below it. */}
						<Logo size="lg" interactive={false} />
						<p className="mt-2 max-w-xs text-sm text-muted-foreground">
							Chợ đồ cũ dành cho sinh viên — mua bán nhanh, gọn,
							đáng tin.
						</p>
					</div>

					{featuredCategories.length > 0 && (
						<div>
							<h3 className="text-sm font-medium text-fz-ink">
								Danh mục
							</h3>
							<ul className="mt-3 space-y-2 text-sm text-muted-foreground">
								{featuredCategories.map((category) => (
									<li key={category.id}>
										<Link
											href={`/tim-kiem?categoryId=${category.id}`}
											className="hover:text-fz-ink"
										>
											{category.name}
										</Link>
									</li>
								))}
							</ul>
						</div>
					)}

					<div>
						<h3 className="text-sm font-medium text-fz-ink">
							Hỗ trợ
						</h3>
						<ul className="mt-3 space-y-2 text-sm text-muted-foreground">
							{SUPPORT_LINKS.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="hover:text-fz-ink"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
					<p className="text-xs text-muted-foreground">
						© {new Date().getFullYear()} Fleazo.
					</p>
					{/* lucide-react no longer ships brand icons — pill-style text
					    links instead, echoing the Header's pill language rather
					    than reading as bare inline text. */}
					<div className="flex items-center gap-2 text-xs">
						{SOCIAL_LINKS.map((social) => (
							<a
								key={social.href}
								href={social.href}
								target="_blank"
								rel="noopener noreferrer"
								className="rounded-full border border-border px-3 py-1.5 text-muted-foreground transition-colors hover:border-fz-ink hover:text-fz-ink"
							>
								{social.label}
							</a>
						))}
					</div>
				</div>
			</div>
		</footer>
	);
}
