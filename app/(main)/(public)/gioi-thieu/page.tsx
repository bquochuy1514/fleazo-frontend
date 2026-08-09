import type { Metadata } from 'next';
import Link from 'next/link';
import {
	Crown,
	GraduationCap,
	Handshake,
	Sparkles,
	Store,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { FounderAvatar } from '@/components/founder-avatar';

export const metadata: Metadata = {
	title: 'Giới thiệu — Fleazo',
	description:
		'Fleazo là chợ đồ cũ dành cho sinh viên — nơi đồ không dùng nữa của người này thành thứ đang cần của người khác.',
};

// Same icon language as the homepage's TRUST list and the đăng-tin guide's
// callouts — reusing GraduationCap/Handshake/Sparkles/Crown instead of
// picking new icons keeps this page feeling like part of the same product,
// not a bolted-on marketing page.
const VALUES = [
	{
		icon: GraduationCap,
		title: 'Sinh viên, cho sinh viên',
		body: 'Người mua và người bán đều quanh khu vực trường bạn — hiểu nhau về giá, về đồ, về chuyện đồ cũ vẫn dùng tốt.',
	},
	{
		icon: Handshake,
		title: 'Không qua trung gian',
		body: 'Nhắn tin trực tiếp, tự hẹn gặp và chốt giá. Fleazo không giữ tiền, không thu phí giao dịch.',
	},
	{
		icon: Sparkles,
		title: 'AI hỗ trợ đăng tin',
		body: 'Tải ảnh lên, AI gợi ý tiêu đề, mô tả và danh mục — đăng một tin không mất quá vài phút.',
	},
	{
		icon: Crown,
		title: 'Linh hoạt theo nhu cầu',
		body: 'Đăng tin cơ bản miễn phí; cần đăng nhiều hơn hoặc hiển thị lâu hơn thì có gói thành viên đi kèm.',
	},
];

export default function GioiThieuPage() {
	return (
		<div className="mx-auto max-w-3xl px-4 pt-24 pb-20 sm:px-6 sm:pt-28 sm:pb-24">
			<PageHeader
				icon={Store}
				kicker="Giới thiệu"
				title="Đồ cũ của bạn, còn hữu ích lắm"
				description="Fleazo là chợ đồ cũ dành riêng cho sinh viên — nơi cuốn sách khoá trước để lại, chiếc xe đạp hết cần dùng hay chiếc laptop lên đời rồi, tìm được đúng người đang cần."
			/>

			<p
				className="fz-rise mt-10 max-w-2xl font-heading text-xl leading-8 font-semibold text-fz-ink sm:mt-12 sm:text-2xl sm:leading-9"
				style={{ animationDelay: '80ms' }}
			>
				Mỗi kỳ chuyển trọ, mỗi lần ra trường, biết bao đồ vẫn còn tốt bị bỏ
				lại — không phải vì hết giá trị, mà vì không có chỗ nào để bán lại
				dễ dàng. Fleazo sinh ra để lấp đúng khoảng trống đó, gọn trong
				phạm vi sinh viên với nhau.
			</p>

			<p
				className="fz-rise mt-10 text-xs font-semibold tracking-[0.16em] text-fz-muted uppercase sm:mt-12"
				style={{ animationDelay: '120ms' }}
			>
				Vì sao chọn Fleazo
			</p>

			<div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
				{VALUES.map(({ icon: Icon, title, body }, index) => (
					<div
						key={title}
						className="fz-rise rounded-2xl border border-border bg-card p-5"
						style={{ animationDelay: `${160 + index * 60}ms` }}
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
					</div>
				))}
			</div>

			<p
				className="fz-rise mt-10 text-xs font-semibold tracking-[0.16em] text-fz-muted uppercase sm:mt-12"
				style={{ animationDelay: '420ms' }}
			>
				Người làm ra Fleazo
			</p>

			<div
				className="fz-rise mt-5 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:gap-5 sm:p-6"
				style={{ animationDelay: '460ms' }}
			>
				<FounderAvatar className="size-12" />
				<div>
					<p className="text-sm leading-6 text-fz-ink italic">
						&ldquo;Mình từng dọn phòng ký túc xá cuối kỳ và bỏ đi bao
						nhiêu thứ vẫn còn dùng tốt, chỉ vì không biết bán cho ai.
						Fleazo bắt đầu từ đúng khoảnh khắc đó.&rdquo;
					</p>
					<p className="mt-2 text-xs font-medium text-muted-foreground">
						Bùi Quốc Huy — Founder & Developer
					</p>
				</div>
			</div>

			<div
				className="fz-rise mt-12 flex flex-col items-center gap-3 text-center sm:mt-14"
				style={{ animationDelay: '520ms' }}
			>
				<p className="font-heading text-lg font-semibold text-fz-ink">
					Có đồ không dùng nữa?
				</p>
				<p className="max-w-sm text-sm text-muted-foreground">
					Đăng tin miễn phí trong vài phút, hoặc xem thử mọi người đang
					bán gì quanh bạn.
				</p>
				<div className="mt-2 flex flex-wrap items-center justify-center gap-3">
					<Button asChild size="lg" className="h-11 px-6">
						<Link href="/dang-tin">Đăng tin ngay</Link>
					</Button>
					<Button asChild variant="outline" size="lg" className="h-11 px-6">
						<Link href="/">Khám phá sản phẩm</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
