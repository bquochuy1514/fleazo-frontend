import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import { DarkSurfaceAmbient } from '@/components/dark-surface-ambient';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/category.types';
import { Logo } from '../logo';

// Backend trả cây danh mục (cha kèm children) — Footer chỉ hiển thị cấp cha,
// nên lọc parentId === null thay vì render cả children.
async function getParentCategories(): Promise<Category[]> {
	try {
		const res = await api.get<Category[]>('/categories');
		return res.data.filter((category) => category.parentId === null);
	} catch {
		// Lỗi mạng/API không nên làm sập cả footer — ẩn cột Danh mục là đủ.
		return [];
	}
}

const SUPPORT_LINKS = [
	{ href: '/gioi-thieu', label: 'Về Fleazo' },
	{ href: '/huong-dan', label: 'Hướng dẫn mua bán' },
	{ href: '/dieu-khoan', label: 'Điều khoản dịch vụ' },
	{ href: '/bao-mat', label: 'Chính sách bảo mật' },
];

// Footer: shares --color-dark-surface with Header for a matching navy
// bookend top/bottom (see AGENTS.md → Design System → Dark surface). All
// children styled explicitly for a dark background, same rule as Header.
export async function Footer() {
	const categories = await getParentCategories();

	return (
		<footer
			className={cn(
				'relative overflow-hidden bg-fz-dark-surface text-white/70',
				// BottomNav is `fixed`, so it overlays whatever's at the very
				// bottom of the page — without this, it covers the copyright
				// line below once scrolled all the way down. Height must match
				// BottomNav's own h-16 + safe-area padding exactly. sm+ doesn't
				// need it: BottomNav is mobile-only (sm:hidden).
				'pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-0',
			)}
		>
			{/* Ambient background — shared with Header, see dark-surface-ambient.tsx */}
			<DarkSurfaceAmbient />

			<div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
				{/* Brand column */}
				<div className="lg:col-span-1">
					<Logo className="h-10" />
					<p className="mt-3 text-sm leading-relaxed">
						Nền tảng mua bán đồ cũ dành cho sinh viên các trường đại
						học Việt Nam.
					</p>
				</div>

				{/* Danh mục nổi bật */}
				<nav aria-label="Danh mục">
					<h3 className="font-heading text-sm font-semibold text-white">
						Danh mục
					</h3>
					<ul className="mt-3 space-y-2 text-sm">
						{categories.map((item) => (
							<li key={item.id}>
								<Link
									href={`/danh-muc/${item.slug}`}
									className="hover:text-white"
								>
									{item.name}
								</Link>
							</li>
						))}
					</ul>
				</nav>

				{/* Hỗ trợ */}
				<nav aria-label="Hỗ trợ">
					<h3 className="font-heading text-sm font-semibold text-white">
						Hỗ trợ
					</h3>
					<ul className="mt-3 space-y-2 text-sm">
						{SUPPORT_LINKS.map((item) => (
							<li key={item.href}>
								<Link
									href={item.href}
									className="hover:text-white"
								>
									{item.label}
								</Link>
							</li>
						))}
					</ul>
				</nav>

				{/* Liên hệ — no brand icons here on purpose: lucide-react has
				    no Facebook/Instagram marks and AGENTS.md forbids adding a
				    second icon library just for social logos. */}
				<div>
					<h3 className="font-heading text-sm font-semibold text-white">
						Liên hệ
					</h3>
					<ul className="mt-3 space-y-2 text-sm">
						<li>
							<a
								href="mailto:fleazocompany@gmail.com"
								className="flex items-center gap-2 hover:text-white"
							>
								<Mail className="size-4 shrink-0" />
								fleazocompany@gmail.com
							</a>
						</li>
						<li>
							<a
								href="tel:+0342637682"
								className="flex items-center gap-2 hover:text-white"
							>
								<Phone className="size-4" />
								0342637682
							</a>
						</li>
					</ul>
				</div>
			</div>

			{/* Bottom bar: copyright, separated with a hairline so it reads
			    distinct from the column grid above without a second signature
			    element competing with Header's ambient pattern. */}
			<div className="relative border-t border-white/10">
				<div className="mx-auto max-w-6xl px-4 py-5 text-xs">
					© {new Date().getFullYear()}{' '}
					<Link href="/" className="hover:text-white">
						Fleazo
					</Link>
					. Dự án cá nhân phục vụ mục đích học tập và phát triển.
				</div>
			</div>
		</footer>
	);
}
