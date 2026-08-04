import { MapPin, MessageCircle, Search } from 'lucide-react';

const STEPS = [
	{
		number: '01',
		icon: Search,
		title: 'Xem tin phù hợp',
		description: 'Xem ảnh, tình trạng, giá và khu vực trước khi nhắn.',
	},
	{
		number: '02',
		icon: MessageCircle,
		title: 'Nhắn trực tiếp',
		description: 'Hỏi điều cần biết, rồi thống nhất thời gian và địa điểm.',
	},
	{
		number: '03',
		icon: MapPin,
		title: 'Gặp và kiểm tra',
		description: 'Hẹn ở nơi thuận tiện, kiểm tra món đồ rồi chốt.',
	},
] as const;

export function HandoffSteps() {
	return (
		<section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
			{/* Asymmetric: intro holds one column, the steps run as a connected
			    vertical timeline beside it — collapses to a single-column
			    timeline below lg, same markup. */}
			<div className="lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
				<div className="max-w-2xl">
					<p className="font-heading text-xs font-semibold tracking-[0.18em] text-fz-muted uppercase">
						Trao tay gọn gàng
					</p>
					<h2 className="mt-2 font-heading text-3xl leading-none font-bold tracking-tight text-fz-ink sm:text-4xl">
						Tìm được món hợp. Hẹn gặp cho chắc.
					</h2>
					<p className="mt-3 text-base leading-7 text-muted-foreground">
						Fleazo để bạn tự kết nối với người bán quanh trường —
						không qua trung gian, không tạo thêm bước rườm rà.
					</p>
				</div>

				{/* Full-width hairlines per step, not a vertical connector: every
				    other section on this page terminates hard at the container's
				    right edge, so a ragged-right column here reads as unfinished
				    rather than deliberate. */}
				<ol className="mt-10 divide-y divide-border border-y border-border lg:mt-0">
					{STEPS.map(({ number, icon: Icon, title, description }) => (
						<li key={number} className="flex gap-5 py-6">
							<span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-fz-paper">
								<Icon
									aria-hidden
									className="size-5 text-fz-ink/65"
								/>
							</span>
							<div className="pt-1.5">
								<span className="font-heading text-xs font-semibold tracking-[0.18em] text-fz-muted">
									{number}
								</span>
								<h3 className="mt-1 font-heading text-lg leading-tight font-semibold tracking-tight text-fz-ink">
									{title}
								</h3>
								<p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
									{description}
								</p>
							</div>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}
