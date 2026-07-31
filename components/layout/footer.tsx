import Link from 'next/link';
import { Logo } from '@/components/logo';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ABOUT_LINKS = [
	{ href: '/gioi-thieu', label: 'Giới thiệu' },
	{ href: '/dieu-khoan', label: 'Điều khoản dịch vụ' },
	{ href: '/chinh-sach-bao-mat', label: 'Chính sách bảo mật' },
];

const SUPPORT_LINKS = [
	{ href: '/lien-he', label: 'Liên hệ' },
	{ href: '/faq', label: 'Câu hỏi thường gặp' },
];

// CTA band + link columns — no newsletter/email capture (no such backend
// feature exists, see AGENTS.md → Layout decisions). The CTA is
// seller-acquisition, not lead-gen.
export function Footer() {
	return (
		<footer className="border-t border-border">
			<div className="bg-fz-ink px-4 py-10">
				<div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
					<div>
						<h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
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
				<div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
					<div className="col-span-2 sm:col-span-2">
						<Logo />
						<p className="mt-2 max-w-xs text-sm text-muted-foreground">
							Chợ đồ cũ dành cho sinh viên — mua bán nhanh, gọn,
							đáng tin.
						</p>
					</div>

					<div>
						<h3 className="text-sm font-medium text-fz-ink">
							Về Fleazo
						</h3>
						<ul className="mt-3 space-y-2 text-sm text-muted-foreground">
							{ABOUT_LINKS.map((link) => (
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
						© {new Date().getFullYear()} Fleazo. Đã đăng ký bản
						quyền.
					</p>
					{/* lucide-react no longer ships brand/social icons — plain
					    text links instead of guessed logo marks. */}
					<div className="flex items-center gap-4 text-xs">
						<a
							href="https://facebook.com"
							target="_blank"
							rel="noopener noreferrer"
							className="text-muted-foreground transition hover:text-fz-ink"
						>
							Facebook
						</a>
						<a
							href="https://instagram.com"
							target="_blank"
							rel="noopener noreferrer"
							className="text-muted-foreground transition hover:text-fz-ink"
						>
							Instagram
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
