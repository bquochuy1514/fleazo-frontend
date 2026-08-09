import type { Metadata } from 'next';
import { Briefcase, Bug, LifeBuoy, Mail } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { FounderAvatar } from '@/components/founder-avatar';
import {
	FacebookIcon,
	GithubIcon,
	LinkedinIcon,
} from '@/components/icons/brand-icons';

export const metadata: Metadata = {
	title: 'Liên hệ — Fleazo',
	description:
		'Cần hỗ trợ, muốn báo lỗi hay góp ý cho Fleazo? Liên hệ trực tiếp qua email hoặc mạng xã hội.',
};

const DEV_EMAIL = 'bquochuy260405@gmail.com';

// Three reasons someone actually lands on a contact page for a
// single-developer product — not a generic "department" list a real
// company would have. Each pre-fills a mailto subject so the reason
// carries through instead of getting lost in a blank compose window.
const REASONS = [
	{
		icon: LifeBuoy,
		title: 'Hỗ trợ sử dụng',
		body: 'Vướng mắc khi đăng tin, tìm kiếm hoặc quản lý tài khoản trên Fleazo.',
		subject: 'Hỗ trợ sử dụng Fleazo',
	},
	{
		icon: Bug,
		title: 'Báo lỗi / góp ý',
		body: 'Phát hiện lỗi hoặc có ý tưởng giúp Fleazo tốt hơn.',
		subject: 'Báo lỗi / góp ý cho Fleazo',
	},
	{
		icon: Briefcase,
		title: 'Hợp tác & tuyển dụng',
		body: 'Muốn trao đổi công việc, hợp tác hoặc trò chuyện về dự án.',
		subject: 'Hợp tác / cơ hội việc làm',
	},
];

const SOCIALS = [
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

export default function LienHePage() {
	return (
		<div className="mx-auto max-w-3xl px-4 pt-24 pb-20 sm:px-6 sm:pt-28 sm:pb-24">
			<PageHeader
				icon={Mail}
				kicker="Liên hệ"
				title="Cần hỗ trợ? Nhắn cho mình"
				description="Fleazo hiện do một người vận hành, nên mọi câu hỏi, lỗi hay góp ý đều đến thẳng hộp thư — thường phản hồi trong 1–2 ngày."
			/>

			<div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-5">
				{REASONS.map(({ icon: Icon, title, body, subject }, index) => (
					<a
						key={title}
						href={`mailto:${DEV_EMAIL}?subject=${encodeURIComponent(subject)}`}
						className="fz-rise group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-fz-ink"
						style={{ animationDelay: `${80 + index * 60}ms` }}
					>
						<span className="flex size-9 items-center justify-center rounded-full bg-muted text-fz-accent">
							<Icon aria-hidden className="size-4.5" />
						</span>
						<h2 className="mt-3 font-heading text-base font-semibold text-fz-ink">
							{title}
						</h2>
						<p className="mt-1.5 text-sm leading-6 text-muted-foreground">
							{body}
						</p>
						<span className="mt-3 inline-block text-xs font-medium text-fz-accent underline-offset-2 group-hover:underline">
							Gửi email →
						</span>
					</a>
				))}
			</div>

			<div
				className="fz-rise mt-10 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:mt-12 sm:flex-row sm:items-center sm:justify-between sm:p-6"
				style={{ animationDelay: '280ms' }}
			>
				<div className="flex items-center gap-3.5">
					<FounderAvatar className="size-11" />
					<div>
						<p className="text-sm font-semibold text-fz-ink">
							Bùi Quốc Huy
						</p>
						<a
							href={`mailto:${DEV_EMAIL}`}
							className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-fz-ink"
						>
							<Mail aria-hidden className="size-3.5" />
							{DEV_EMAIL}
						</a>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{SOCIALS.map(({ href, label, Icon }) => (
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
		</div>
	);
}
