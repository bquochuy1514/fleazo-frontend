import { Logo } from '@/components/logo';
import { DarkSurfaceAmbient } from '@/components/dark-surface-ambient';
import { GuestOnlyGuard } from '@/components/auth/guest-only-guard';
import { Gift, MessagesSquare, SlidersHorizontal } from 'lucide-react';

// Real Fleazo features only — each line maps to something actually built:
// Free tier (Monetization model), Chat module, Products filtering
// (QueryProductDto). No unverified stats, no "email trường" claim (Auth
// is generic email OTP, not school-domain-restricted).
const VALUE_PROPS = [
	{
		icon: Gift,
		title: 'Đăng tin miễn phí',
		desc: 'Đăng bán tin cơ bản không mất phí, thu phí chỉ với các dịch vụ nâng cao.',
	},
	{
		icon: MessagesSquare,
		title: 'Trao đổi trực tiếp',
		desc: 'Chat ngay trong ứng dụng, thoả thuận và gặp mặt trực tiếp — không qua trung gian.',
	},
	{
		icon: SlidersHorizontal,
		title: 'Lọc đúng nhu cầu',
		desc: 'Tìm theo danh mục, giá, khu vực và tình trạng — không mất công lướt qua tin không liên quan.',
	},
];

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex h-dvh flex-col md:flex-row">
			<div className="relative shrink-0 overflow-hidden bg-fz-dark-surface px-6 pt-10 pb-16 md:flex md:w-[46%] md:items-center md:px-16 md:py-12">
				<DarkSurfaceAmbient />

				<div className="relative w-full max-w-md md:mx-auto">
					<Logo className="h-14" clickable={true} />

					{/* Value props — desktop only, no room once the card overlaps on mobile. */}
					<div className="mt-12 hidden space-y-9 md:block">
						{VALUE_PROPS.map(({ icon: Icon, title, desc }) => (
							<div key={title} className="flex gap-4">
								<span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-fz-primary-soft">
									<Icon className="size-6" />
								</span>
								<div>
									<p className="font-heading text-lg font-semibold text-white">
										{title}
									</p>
									<p className="mt-1 text-base leading-relaxed text-white/60">
										{desc}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="relative z-10 -mt-8 min-h-0 flex-1 overflow-y-auto rounded-t-3xl bg-background px-4 pt-8 pb-10 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] md:mt-0 md:flex md:min-h-0 md:overflow-y-auto md:rounded-none md:px-4 md:py-12 md:shadow-none">
				<div className="mx-auto w-full max-w-md md:m-auto">
					<GuestOnlyGuard>{children}</GuestOnlyGuard>
				</div>
			</div>
		</div>
	);
}
