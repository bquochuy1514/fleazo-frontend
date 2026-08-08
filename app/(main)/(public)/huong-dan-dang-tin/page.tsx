import type { Metadata } from 'next';
import Link from 'next/link';
import {
	ArrowRight,
	CheckCircle2,
	Crown,
	ImagePlus,
	Send,
	Sparkles,
	UserRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
	title: 'Hướng dẫn đăng tin — Fleazo',
	description: 'Các bước đăng tin bán đồ cũ trên Fleazo, từ hoàn thiện hồ sơ tới khi tin được duyệt.',
};

// Split out of the numbered flow on purpose — this is a precondition
// (gates PENDING, per assertSellerProfileComplete), not step 1 of "doing"
// something. Folding it into the timeline as an equal-weight box was what
// made every step look interchangeable.
const STEPS = [
	{
		icon: ImagePlus,
		label: 'Ảnh & thông tin',
		title: 'Vào trang "Đăng tin", thêm ảnh và thông tin',
		body: 'Tải ảnh sản phẩm (số lượng ảnh tối đa tuỳ theo gói thành viên bạn đang dùng), rồi điền tiêu đề, mô tả, giá, tình trạng, danh mục và khu vực. Ảnh đầu tiên trong danh sách sẽ là ảnh bìa hiển thị trong kết quả tìm kiếm.',
	},
	{
		icon: Sparkles,
		label: 'Tuỳ chọn',
		title: 'Nhờ AI gợi ý nội dung',
		body: 'Sau khi tải ảnh lên, bấm "Nhờ AI gợi ý" để tự động điền tiêu đề, mô tả và danh mục dựa trên ảnh. Vẫn nên đọc lại trước khi đăng — AI chỉ mô tả những gì thấy được từ ảnh, không đoán tình trạng bên trong (ví dụ pin, lỗi ẩn).',
	},
	{
		icon: Send,
		label: 'Xuất bản',
		title: 'Lưu nháp hoặc gửi duyệt',
		body: 'Chọn "Lưu nháp" nếu muốn hoàn thiện sau — tin nháp không bắt buộc có ảnh. Chọn "Đăng tin" để gửi duyệt ngay — lúc này cần ít nhất 1 ảnh và hồ sơ đã hoàn thiện (mục bên trên).',
	},
	{
		icon: CheckCircle2,
		label: 'Kiểm duyệt',
		title: 'Chờ duyệt',
		body: 'Tin ở trạng thái "Chờ duyệt" cho tới khi quản trị viên xem xét. Được duyệt thì tin hiển thị công khai và bắt đầu tính thời hạn hiển thị. Bị từ chối thì có lý do cụ thể trong "Quản lý tin" — sửa nội dung và đăng một tin mới, tin bị từ chối không gửi duyệt lại được.',
	},
];

export default function HuongDanDangTinPage() {
	return (
		<div className="mx-auto max-w-3xl px-4 pt-24 pb-20 sm:px-6 sm:pt-28 sm:pb-24">
			<div className="fz-rise">
				<p className="text-xs font-semibold tracking-[0.16em] text-fz-muted uppercase">
					HƯỚNG DẪN
				</p>
				<h1 className="mt-2 font-heading text-3xl leading-none font-bold tracking-tight text-fz-ink sm:text-4xl">
					Cách đăng tin trên Fleazo
				</h1>
				<p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
					Đồ bạn không dùng nữa, biết đâu là thứ ai đó đang tìm — 4 bước
					để món đồ đó tới tay người cần.
				</p>
			</div>

			{/* Precondition, not step 1 — styled as a distinct callout so it
			    doesn't read as an equal-weight item in the numbered flow below. */}
			<div
				className="fz-rise mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:p-6"
				style={{ animationDelay: '60ms' }}
			>
				<div className="flex items-start gap-3">
					<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-fz-ink">
						<UserRound aria-hidden className="size-4.5" />
					</span>
					<div>
						<p className="text-sm font-semibold text-fz-ink">
							Trước khi bắt đầu: hoàn thiện hồ sơ
						</p>
						<p className="mt-0.5 text-xs leading-5 text-muted-foreground">
							Số điện thoại, khu vực và mật khẩu — bắt buộc để tin được
							duyệt công khai. Lưu nháp thì chưa cần ngay.
						</p>
					</div>
				</div>
				<Button
					asChild
					variant="ghost"
					size="sm"
					className="shrink-0 self-start sm:self-auto"
				>
					<Link href="/ca-nhan">
						Cập nhật hồ sơ
						<ArrowRight aria-hidden data-icon="inline-end" />
					</Link>
				</Button>
			</div>

			<p
				className="fz-rise mt-10 text-xs font-semibold tracking-[0.16em] text-fz-muted uppercase sm:mt-12"
				style={{ animationDelay: '100ms' }}
			>
				Các bước đăng tin
			</p>

			<div className="relative mt-5">
				<div
					aria-hidden
					className="absolute top-[18px] bottom-[18px] left-[18px] w-px bg-border sm:top-[22px] sm:bottom-[22px] sm:left-[22px]"
				/>
				<ol className="flex flex-col gap-9 sm:gap-10">
					{STEPS.map(({ icon: Icon, label, title, body }, index) => (
						<li
							key={title}
							className="fz-rise relative flex gap-4 sm:gap-5"
							style={{ animationDelay: `${140 + index * 60}ms` }}
						>
							<span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-fz-ink bg-fz-paper font-heading text-sm font-bold text-fz-ink sm:size-11 sm:text-base">
								{index + 1}
							</span>
							<div className="min-w-0 pt-1">
								<div className="flex items-center gap-1.5 text-fz-accent">
									<Icon aria-hidden className="size-3.5" />
									<span className="text-[11px] font-semibold tracking-[0.08em] uppercase">
										{label}
									</span>
								</div>
								<h2 className="mt-1 font-heading text-lg font-semibold text-fz-ink sm:text-xl">
									{title}
								</h2>
								<p className="mt-1.5 text-sm leading-6 text-muted-foreground sm:text-base">
									{body}
								</p>
							</div>
						</li>
					))}
				</ol>
			</div>

			<div
				className="fz-rise mt-10 flex flex-col items-start gap-3 rounded-2xl border border-fz-accent/30 bg-fz-accent-soft/40 p-5 sm:mt-12 sm:flex-row sm:items-center sm:justify-between"
				style={{ animationDelay: '380ms' }}
			>
				<div className="flex items-start gap-3">
					<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-fz-accent-soft text-fz-accent">
						<Crown aria-hidden className="size-4.5" />
					</span>
					<div>
						<p className="text-sm font-semibold text-fz-ink">
							Muốn đăng nhiều tin hơn?
						</p>
						<p className="mt-0.5 text-xs text-muted-foreground">
							Gói thành viên trả phí cho phép nhiều tin đang hoạt động cùng
							lúc hơn, tin hiển thị lâu hơn và nhiều ảnh hơn mỗi tin.
						</p>
					</div>
				</div>
				<Button asChild variant="outline" className="w-full shrink-0 sm:w-auto">
					<Link href="/goi-thanh-vien">Xem các gói</Link>
				</Button>
			</div>

			<div className="mt-8 flex justify-center">
				<Button asChild size="lg" className="h-11 px-6">
					<Link href="/dang-tin">Đăng tin ngay</Link>
				</Button>
			</div>
		</div>
	);
}
