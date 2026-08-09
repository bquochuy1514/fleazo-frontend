import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Logo } from '@/components/logo';
import { FounderAvatar } from '@/components/founder-avatar';
import { buttonVariants } from '@/components/ui/button';
import {
	FacebookIcon,
	GithubIcon,
	LinkedinIcon,
} from '@/components/icons/brand-icons';
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
	{ href: '/cau-hoi-thuong-gap', label: 'Câu hỏi thường gặp' },
];

const DEV_EMAIL = 'bquochuy260405@gmail.com';

// Recruiter-facing credit, not a generic "social" row — GitHub/LinkedIn are
// what a hiring manager actually clicks from here; Facebook stays (asked
// for by name) but Instagram was dropped since it adds nothing for this
// audience.
const DEV_LINKS = [
	{ href: 'https://github.com/bquochuy1514', label: 'GitHub', Icon: GithubIcon },
	{
		href: 'https://www.linkedin.com/in/huy-bui-quoc-a47a33389/',
		label: 'LinkedIn',
		Icon: LinkedinIcon,
	},
	{
		href: 'https://www.facebook.com/bquochuy1514',
		label: 'Facebook',
		Icon: FacebookIcon,
	},
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

				{/* Recruiter-facing credit — deliberately its own card, not folded
				    into the copyright line like a generic social row, since this
				    is the thing a hiring manager is actually here to find. */}
				<div className="mt-10 flex flex-col gap-4 rounded-2xl border border-border bg-muted/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
					<div className="flex items-center gap-3.5">
						<FounderAvatar className="size-11" />
						<div>
							<p className="text-sm font-semibold text-fz-ink">
								Bùi Quốc Huy
							</p>
							<p className="mt-0.5 text-xs leading-5 text-muted-foreground">
								Sinh viên Trường Đại học Công nghệ Thông tin, Đại
								học Quốc gia Thành phố Hồ Chí Minh
							</p>
							<a
								href={`mailto:${DEV_EMAIL}`}
								className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-fz-ink"
							>
								<Mail aria-hidden className="size-3.5" />
								{DEV_EMAIL}
							</a>
						</div>
					</div>
					<div className="flex items-center gap-2">
						{DEV_LINKS.map(({ href, label, Icon }) => (
							<a
								key={href}
								href={href}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={label}
								className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-fz-ink hover:text-fz-ink"
							>
								<Icon className="size-4" />
							</a>
						))}
					</div>
				</div>

				<p className="mt-6 text-xs text-muted-foreground">
					© {new Date().getFullYear()} Fleazo.
				</p>
			</div>
		</footer>
	);
}
