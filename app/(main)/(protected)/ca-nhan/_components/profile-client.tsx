'use client';

import { useRef, useState } from 'react';
import Image, { type ImageLoaderProps } from 'next/image';
import Link from 'next/link';
import {
	ArrowUpRight,
	Camera,
	ChevronDown,
	Crown,
	GraduationCap,
	Heart,
	KeyRound,
	MapPin,
	PackageOpen,
	Phone,
	UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldError } from '@/components/form/field-error';
import { FieldLabel } from '@/components/form/field-label';
import {
	LocationPicker,
	type LocationValue,
} from '@/components/location/location-picker';
import { Picker, PickerEmpty, PickerOption } from '@/components/ui/picker';
import { useAuth } from '@/hooks/use-auth';
import { api, getStoredAccessToken, parseApiError } from '@/lib/api';
import type { ProvinceWithWards } from '@/lib/locations';
import { cn } from '@/lib/utils';
import type { ApiErrorResponse } from '@/types/api.types';
import { PasswordDialog } from './password-dialog';

type University = { id: number; name: string };
type ProfileFields =
	| 'fullName'
	| 'phone'
	| 'addressDetail'
	| 'universityId'
	| 'provinceCode'
	| 'wardCode';

const norm = (value: string) =>
	value
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.replace(/đ/gi, 'd')
		.toLowerCase();

const EMPTY_LOCATION: LocationValue = {
	provinceCode: null,
	provinceName: '',
	wardCode: null,
	wardName: '',
};

// Calling Cloudinary directly avoids routing a profile image through Next's
// optimizer, which is prone to timing out on the same upstream outages as listing images.
function avatarLoader({ src, width }: ImageLoaderProps) {
	if (src.includes('res.cloudinary.com')) {
		return src.replace(
			'/upload/',
			`/upload/f_auto,q_auto,c_fill,g_face,w_${width}/`,
		);
	}
	return src;
}

function initials(name: string) {
	return name
		.trim()
		.split(/\s+/)
		.slice(-2)
		.map((part) => part[0])
		.join('')
		.toUpperCase();
}

function locationLabel(provinceName: string | null, wardName: string | null) {
	return [wardName, provinceName].filter(Boolean).join(', ') || 'Chưa cập nhật khu vực';
}

export function ProfileClient({
	provinces,
}: {
	provinces: ProvinceWithWards[];
}) {
	const { user, login } = useAuth();
	const inputRef = useRef<HTMLInputElement>(null);
	const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION);
	const [university, setUniversity] = useState<University | null>(null);
	const [universities, setUniversities] = useState<University[]>([]);
	const [isUniversitiesLoading, setIsUniversitiesLoading] = useState(false);
	const [universityOpen, setUniversityOpen] = useState(false);
	const [universityQuery, setUniversityQuery] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const [avatarFailed, setAvatarFailed] = useState(false);
	const [errors, setErrors] = useState<ApiErrorResponse<ProfileFields>>({});
	const [passwordOpen, setPasswordOpen] = useState(false);

	if (!user) return <ProfileSkeleton />;

	const selectedUniversity = university ?? user.university;
	const universityMatches = (() => {
		const query = norm(universityQuery.trim());
		if (!query) return universities;
		return universities.filter((item) => norm(item.name).includes(query));
	})();

	const handleUniversityOpen = (next: boolean) => {
		setUniversityOpen(next);
		if (!next) {
			setUniversityQuery('');
			return;
		}
		if (universities.length || isUniversitiesLoading) return;

		setIsUniversitiesLoading(true);
		api
			.get<University[]>('/universities')
			.then(({ data }) => setUniversities(data))
			.catch(() => toast.error('Chưa tải được danh sách trường. Thử lại sau nhé.'))
			.finally(() => setIsUniversitiesLoading(false));
	};

	const refreshUser = async () => {
		const token = getStoredAccessToken();
		if (token) await login(token);
	};

	const handleAvatarChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		// Allows choosing the same file again after a failed upload.
		event.target.value = '';
		if (!file) return;
		if (!file.type.startsWith('image/')) {
			toast.error('Hãy chọn một tệp ảnh.');
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			toast.error('Ảnh đại diện cần nhỏ hơn 5 MB.');
			return;
		}

		setIsUploadingAvatar(true);
		setAvatarFailed(false);
		try {
			const body = new FormData();
			body.append('avatar', file);
			await api.put('/users/me/avatar', body);
			await refreshUser();
			toast.success('Đã cập nhật ảnh đại diện.');
		} catch (error) {
			toast.error(
				parseApiError(error).message ??
					'Không thể tải ảnh đại diện. Vui lòng thử lại.',
			);
		} finally {
			setIsUploadingAvatar(false);
		}
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setErrors({});
		setIsSaving(true);
		const values = Object.fromEntries(new FormData(event.currentTarget));

		try {
			const payload: Record<string, string | number> = {
				fullName: String(values.fullName ?? '').trim(),
				phone: String(values.phone ?? '').trim(),
				addressDetail: String(values.addressDetail ?? '').trim(),
			};
			if (university && university.id !== user.universityId) {
				payload.universityId = university.id;
			}
			if (location.provinceCode) {
				payload.provinceCode = location.provinceCode;
				payload.provinceName = location.provinceName;
				if (location.wardCode) {
					payload.wardCode = location.wardCode;
					payload.wardName = location.wardName;
				}
			}

			await api.put('/users/me', payload);
			await refreshUser();
			toast.success('Đã lưu thông tin cá nhân.');
		} catch (error) {
			setErrors(parseApiError<ProfileFields>(error));
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="mx-auto w-full max-w-6xl px-4 pt-24 pb-24 sm:px-6 sm:pt-28 md:pb-20">
			<header className="max-w-2xl">
				<p className="font-heading text-xs font-semibold tracking-[0.18em] text-fz-muted uppercase">
					HỒ SƠ CÁ NHÂN
				</p>
				<h1 className="mt-3 font-heading text-3xl leading-none font-bold tracking-tight text-fz-ink sm:text-4xl">
					Thông tin của bạn
				</h1>
				<p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
					Cập nhật những thông tin giúp bạn kết nối và trao tay thuận tiện hơn.
				</p>
			</header>

			<div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-6 sm:mt-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8">
				<aside className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm shadow-fz-ink/5 sm:p-6 lg:sticky lg:top-28 lg:h-fit lg:self-start">
					<div className="flex items-center gap-4 lg:block">
						<div className="relative shrink-0">
							<div className="relative size-24 overflow-hidden rounded-[1.75rem] border border-border bg-muted sm:size-28">
								{user.avatar && !avatarFailed ? (
									<Image
										loader={avatarLoader}
										src={user.avatar}
										alt={`Ảnh đại diện của ${user.fullName}`}
										fill
										sizes="112px"
										onError={() => setAvatarFailed(true)}
										className="object-cover"
									/>
								) : (
									<div className="flex size-full items-center justify-center bg-fz-ink font-heading text-2xl font-bold text-fz-paper">
										{initials(user.fullName)}
									</div>
								)}
							</div>
							<Button
								type="button"
								variant="default"
								size="icon-lg"
								className="absolute -right-2 -bottom-2 size-11 border-2 border-fz-paper"
								onClick={() => inputRef.current?.click()}
								disabled={isUploadingAvatar}
								aria-label="Đổi ảnh đại diện"
							>
								<Camera className="size-4" />
							</Button>
							<input
								ref={inputRef}
								type="file"
								accept="image/*"
								className="sr-only"
								onChange={handleAvatarChange}
							/>
						</div>

						<div className="min-w-0 lg:mt-5">
							<p className="truncate font-heading text-xl font-bold tracking-tight text-fz-ink">
								{user.fullName}
							</p>
							<p className="mt-1 truncate text-sm text-muted-foreground">{user.email}</p>
						</div>
					</div>

					<dl className="mt-7 space-y-3 border-y border-border py-4 text-sm lg:mt-8">
						<IdentityLine icon={GraduationCap} label="Trường">
							{user.university?.name ?? 'Chưa cập nhật trường'}
						</IdentityLine>
						<IdentityLine icon={MapPin} label="Khu vực">
							{locationLabel(user.provinceName, user.wardName)}
						</IdentityLine>
					</dl>

					<nav className="mt-5 border-t border-border" aria-label="Lối tắt cá nhân">
						<Shortcut href="/quan-ly-tin" icon={PackageOpen}>
							Quản lý tin của bạn
						</Shortcut>
						<Shortcut href="/tin-da-luu" icon={Heart}>
							Tin đã lưu
						</Shortcut>
						<Shortcut href="/goi-thanh-vien" icon={Crown}>
							Gói thành viên
						</Shortcut>
					</nav>
				</aside>

				<div className="min-w-0 rounded-2xl border border-border bg-card px-5 shadow-sm shadow-fz-ink/5 sm:px-6">
					<form onSubmit={handleSubmit} className="min-w-0 divide-y divide-border">
						<section className="py-7 sm:py-8">
							<SectionHeading
								index="01"
								title="Thông tin liên hệ"
								description="Tên và số điện thoại này hiển thị trên tin đăng để người mua có thể liên hệ với bạn."
							/>
							<div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
								<div>
									<FieldLabel icon={UserRound} htmlFor="fullName" required>
										Họ và tên
									</FieldLabel>
									<Input
										id="fullName"
										name="fullName"
										defaultValue={user.fullName}
										required
										autoComplete="name"
										className="mt-1.5 h-11"
									/>
									<FieldError message={errors.errors?.fullName} />
								</div>
								<div>
									<FieldLabel icon={Phone} htmlFor="phone">
										Số điện thoại
									</FieldLabel>
									<Input
										id="phone"
										name="phone"
										type="tel"
										defaultValue={user.phone ?? ''}
										autoComplete="tel"
										placeholder="0912345678"
										className="mt-1.5 h-11"
									/>
									<FieldError message={errors.errors?.phone} />
								</div>
							</div>
							<div className="mt-4">
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input
									id="email"
									value={user.email}
									readOnly
									className="mt-1.5 h-11 cursor-default bg-muted/50 text-muted-foreground"
								/>
								<p className="mt-1.5 text-sm leading-6 text-muted-foreground">
									Email đăng nhập hiện không thể thay đổi.
								</p>
							</div>
						</section>

						<section className="py-7 sm:py-8">
							<SectionHeading
								index="02"
								title="Trường và khu vực"
								description="Thông tin này giúp ưu tiên những món đồ và người bán gần bạn hơn."
							/>
							<div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
								<div className="lg:col-span-2">
									<FieldLabel icon={GraduationCap}>Trường đại học</FieldLabel>
									<div className="mt-1.5">
										<Picker
											open={universityOpen}
											onOpenChange={handleUniversityOpen}
											trigger={
												<button
													type="button"
													className="flex h-11 w-full items-center justify-between gap-3 rounded-lg border border-input bg-transparent px-3 text-left text-base transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
													aria-label="Chọn trường đại học"
												>
													<span
														className={cn(
															'truncate',
															selectedUniversity
																? 'font-medium text-fz-ink'
																: 'text-muted-foreground',
														)}
													>
														{selectedUniversity?.name ??
															(isUniversitiesLoading
																? 'Đang tải...'
																: 'Chọn trường đại học')}
													</span>
													<ChevronDown className="size-4 shrink-0 text-muted-foreground" />
												</button>
											}
											title="Chọn trường đại học"
											popoverClassName="w-[min(30rem,90vw)]"
											search={{
												value: universityQuery,
												onChange: setUniversityQuery,
												placeholder: 'Tìm trường...',
												label: 'Tìm trường đại học',
											}}
										>
											{isUniversitiesLoading ? (
												<PickerEmpty>Đang tải danh sách trường...</PickerEmpty>
											) : universityMatches.length === 0 ? (
												<PickerEmpty>Không tìm thấy trường nào.</PickerEmpty>
											) : (
												universityMatches.map((item) => (
													<PickerOption
														key={item.id}
														label={item.name}
														selected={item.id === selectedUniversity?.id}
														onSelect={() => {
															setUniversity(item);
															setUniversityOpen(false);
														}}
													/>
												))
											)}
										</Picker>
									</div>
									<FieldError message={errors.errors?.universityId} />
								</div>
								<div className="lg:col-span-2">
									<FieldLabel icon={MapPin}>Khu vực</FieldLabel>
									<div className="mt-1.5">
										<LocationPicker
											provinces={provinces}
											value={{
												provinceCode: user.provinceCode,
												wardCode: user.wardCode,
											}}
											notifyOnInitialValue={false}
											onChange={setLocation}
										/>
									</div>
									<FieldError message={errors.errors?.provinceCode ?? errors.errors?.wardCode} />
								</div>
								<div className="lg:col-span-2">
									<FieldLabel htmlFor="addressDetail">Địa chỉ chi tiết</FieldLabel>
									<Input
										id="addressDetail"
										name="addressDetail"
										defaultValue={user.addressDetail ?? ''}
										placeholder="Số nhà, tên đường... (không bắt buộc)"
										className="mt-1.5 h-11"
									/>
									<FieldError message={errors.errors?.addressDetail} />
								</div>
							</div>
						</section>

						<section className="py-7 sm:py-8">
							<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
								<div>
									<p className="font-heading text-xs font-semibold tracking-[0.16em] text-fz-muted uppercase">
										03 — BẢO MẬT
									</p>
									<h2 className="mt-2 font-heading text-xl font-bold tracking-tight text-fz-ink">
										Mật khẩu
									</h2>
									<p className="mt-1.5 max-w-lg text-sm leading-6 text-muted-foreground">
										{user.hasPassword
											? 'Đổi mật khẩu định kỳ để giữ tài khoản của bạn an toàn.'
											: 'Bạn đang đăng nhập bằng Google. Có thể thêm mật khẩu để có thêm một cách đăng nhập.'}
									</p>
								</div>
								<Button
									type="button"
									variant="outline"
									size="lg"
									className="h-11 px-4"
									onClick={() => setPasswordOpen(true)}
								>
									<KeyRound data-icon="inline-start" />
									{user.hasPassword ? 'Đổi mật khẩu' : 'Thêm mật khẩu'}
								</Button>
							</div>
						</section>

						<div className="flex flex-col gap-3 py-6 lg:flex-row lg:items-center lg:justify-between lg:py-7">
							<FieldError message={errors.message} />
							<Button type="submit" size="lg" className="h-11 px-5" disabled={isSaving}>
								{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
							</Button>
						</div>
					</form>
				</div>
			</div>

			<PasswordDialog
				open={passwordOpen}
				onOpenChange={setPasswordOpen}
				hasPassword={user.hasPassword}
			/>
		</div>
	);
}

function SectionHeading({
	index,
	title,
	description,
}: {
	index: string;
	title: string;
	description: string;
}) {
	return (
		<div className="max-w-xl">
			<p className="font-heading text-xs font-semibold tracking-[0.16em] text-fz-muted uppercase">
				{index}
			</p>
			<h2 className="mt-2 font-heading text-xl font-bold tracking-tight text-fz-ink">
				{title}
			</h2>
			<p className="mt-1.5 text-sm leading-6 text-muted-foreground">{description}</p>
		</div>
	);
}

function IdentityLine({
	icon: Icon,
	label,
	children,
}: {
	icon: typeof MapPin;
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex gap-3">
			<Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
			<div className="min-w-0">
				<dt className="text-xs font-medium text-fz-muted">{label}</dt>
				<dd className="mt-0.5 leading-5 text-fz-ink">{children}</dd>
			</div>
		</div>
	);
}

function Shortcut({
	href,
	icon: Icon,
	children,
}: {
	href: string;
	icon: typeof PackageOpen;
	children: React.ReactNode;
}) {
	return (
		<Link
			href={href}
			className="group flex min-h-12 items-center gap-3 border-b border-border px-2 py-3 text-sm font-medium text-fz-ink transition-colors hover:text-fz-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
		>
			<Icon className="size-4 text-muted-foreground" aria-hidden />
			<span className="flex-1">{children}</span>
			<ArrowUpRight className="size-4 shrink-0 transition-colors duration-200 motion-reduce:transition-none" aria-hidden />
		</Link>
	);
}

function ProfileSkeleton() {
	return (
		<div className="mx-auto w-full max-w-6xl px-4 pt-24 pb-24 sm:px-6 sm:pt-28">
			<div className="h-3 w-28 animate-pulse rounded bg-muted" />
			<div className="mt-4 h-10 w-64 animate-pulse rounded bg-muted" />
			<div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-6 sm:mt-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8">
				<div className="h-56 animate-pulse rounded-2xl bg-muted" />
				<div className="h-96 animate-pulse rounded-2xl bg-muted" />
			</div>
		</div>
	);
}
