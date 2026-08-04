'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ChevronDown, GraduationCap, Lock, MapPin, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { api, getStoredAccessToken, parseApiError } from '@/lib/api';
import {
	getMissingSellerFields,
	type MissingSellerField,
} from '@/lib/seller-profile';
import {
	LocationPicker,
	type LocationValue,
} from '@/components/location/location-picker';
import type { ProvinceWithWards } from '@/lib/locations';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Picker, PickerEmpty, PickerOption } from '@/components/ui/picker';
import { PasswordInput } from '@/components/form/password-input';
import { FieldError } from '@/components/form/field-error';
import { FieldLabel } from '@/components/form/field-label';
import { cn } from '@/lib/utils';
import type { ApiErrorResponse } from '@/types/api.types';

type University = { id: number; name: string };

const norm = (s: string) =>
	s
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

type ProfileFields = 'phone' | 'addressDetail' | 'password' | 'confirmPassword';

export function CompleteProfileModal({
	open,
	onOpenChange,
	onCompleted,
	provinces,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	// Fires after profile save succeeds; caller decides what happens next.
	onCompleted?: () => void;
	// Server-fetched/cached — see lib/locations.ts getProvincesWithWards.
	provinces: ProvinceWithWards[];
}) {
	const { user, login } = useAuth();

	const missing = user ? getMissingSellerFields(user) : [];
	const needs = (field: MissingSellerField) => missing.includes(field);

	// University is never required to sell — offered whenever unset.
	const showUniversity = !!user && !user.universityId;

	const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION);
	const [university, setUniversity] = useState<University | null>(null);
	const [universities, setUniversities] = useState<University[]>([]);
	const [universitiesLoading, setUniversitiesLoading] = useState(false);
	const [universityOpen, setUniversityOpen] = useState(false);
	const [universityQuery, setUniversityQuery] = useState('');

	const [errors, setErrors] = useState<ApiErrorResponse<ProfileFields>>({});
	const [submitting, setSubmitting] = useState(false);

	// Fetch the university list only once actually needed.
	useEffect(() => {
		if (!open || !showUniversity || universities.length > 0) return;
		// queueMicrotask avoids react-hooks/set-state-in-effect
		queueMicrotask(() => setUniversitiesLoading(true));
		api.get<University[]>('/universities')
			.then(({ data }) => setUniversities(data))
			.finally(() => setUniversitiesLoading(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	const universityMatches = (() => {
		const q = norm(universityQuery.trim());
		if (!q) return universities;
		return universities.filter((u) => norm(u.name).includes(q));
	})();

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrors({});
		setSubmitting(true);

		const values = Object.fromEntries(new FormData(e.currentTarget));

		try {
			const profileFields: Record<string, string | number> = {};
			if (needs('phone'))
				profileFields.phone = String(values.phone ?? '');
			if (needs('address')) {
				if (location.provinceCode) {
					profileFields.provinceCode = location.provinceCode;
					profileFields.provinceName = location.provinceName;
				}
				if (location.wardCode) {
					profileFields.wardCode = location.wardCode;
					profileFields.wardName = location.wardName;
				}
				const addressDetail = String(values.addressDetail ?? '').trim();
				if (addressDetail) profileFields.addressDetail = addressDetail;
			}
			// Optional — included whenever picked, not gated on `needs()`.
			if (university) profileFields.universityId = university.id;

			if (Object.keys(profileFields).length > 0) {
				await api.put('/users/me', profileFields);
			}

			if (needs('password')) {
				await api.post('/auth/set-initial-password', {
					password: values.password,
					confirmPassword: values.confirmPassword,
				});
			}

			// Refresh AuthContext's user so future gate checks see the update.
			const token = getStoredAccessToken();
			if (token) await login(token);
			toast.success('Hoàn thiện hồ sơ thành công!');
			onOpenChange(false);
			onCompleted?.();
		} catch (err) {
			const parsed = parseApiError<ProfileFields>(err);
			setErrors(parsed);
		} finally {
			setSubmitting(false);
		}
	};

	if (!user) return null;

	// Phone and university sit side by side when both render, else full row.
	const showPhoneUniversityRow = needs('phone') && showUniversity;

	// Hairlines below only render between two groups that are both showing.
	const showContactGroup = needs('phone') || showUniversity;
	const showAddressGroup = needs('address');
	const showPasswordGroup = needs('password');

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[calc(100svh-1.5rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
				<DialogHeader className="shrink-0 border-b border-border px-5 pt-6 pb-5 pr-12 sm:px-7 sm:pt-7 sm:pb-6">
					<p className="text-[0.68rem] font-semibold tracking-[0.18em] text-fz-muted">
						HOÀN TẤT HỒ SƠ
					</p>
					<DialogTitle className="font-heading text-xl tracking-tight sm:text-2xl">
						Hoàn thiện hồ sơ
					</DialogTitle>
					<DialogDescription className="max-w-lg leading-6">
						Bổ sung thông tin cần thiết để bạn có thể đăng tin và kết nối với người mua quanh trường.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
					<div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 sm:space-y-6 sm:px-7 sm:py-6">
					{(needs('phone') || showUniversity) && (
						<div>
							<div className="mb-4 flex items-baseline justify-between gap-4">
								<h3 className="text-xs font-semibold tracking-[0.14em] text-fz-muted">
									LIÊN HỆ & TRƯỜNG
								</h3>
								<p className="text-xs text-muted-foreground">Mục có * là bắt buộc</p>
							</div>
							<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
							{needs('phone') && (
								<div
									className={cn(
										!showPhoneUniversityRow &&
											'sm:col-span-2',
									)}
								>
									<FieldLabel
										icon={Phone}
										htmlFor="phone"
										required
									>
										Số điện thoại
									</FieldLabel>
									<Input
										id="phone"
										name="phone"
										type="tel"
										required
										placeholder="0912345678"
										className="mt-1.5 h-11"
									/>
									<FieldError
										message={errors.errors?.phone}
									/>
								</div>
							)}

							{showUniversity && (
								<div
									className={cn(
										!showPhoneUniversityRow &&
											'sm:col-span-2',
									)}
								>
									<FieldLabel icon={GraduationCap}>
										Trường đại học
									</FieldLabel>
									<div className="mt-1.5">
										<Picker
											open={universityOpen}
											onOpenChange={(next) => {
												setUniversityOpen(next);
												if (!next)
													setUniversityQuery('');
											}}
											trigger={
												<button
													type="button"
													disabled={
														universitiesLoading
													}
											className="flex h-11 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-4 text-left text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
												>
													<span
														className={cn(
															'truncate',
															university
																? 'text-fz-ink'
																: 'text-muted-foreground',
														)}
													>
														{university
															? university.name
															: universitiesLoading
																? 'Đang tải...'
																: 'Chọn trường (không bắt buộc)'}
													</span>
													<ChevronDown className="size-4 shrink-0 text-muted-foreground" />
												</button>
											}
											title="Chọn trường đại học"
											popoverClassName="w-[min(28rem,90vw)]"
											search={{
												value: universityQuery,
												onChange: setUniversityQuery,
												placeholder: 'Tìm trường…',
												label: 'Tìm trường',
											}}
										>
											{universityMatches.length === 0 ? (
												<PickerEmpty>
													Không tìm thấy trường nào.
												</PickerEmpty>
											) : (
												universityMatches.map((u) => (
													<PickerOption
														key={u.id}
														label={u.name}
														selected={
															u.id ===
															university?.id
														}
														onSelect={() => {
															setUniversity(u);
															setUniversityOpen(
																false,
															);
														}}
													/>
												))
											)}
										</Picker>
									</div>
								</div>
							)}
							</div>
						</div>
					)}

					{showAddressGroup && showContactGroup && (
						<div aria-hidden className="h-px bg-border" />
					)}

					{needs('address') && (
						<div className="space-y-3">
							<h3 className="text-xs font-semibold tracking-[0.14em] text-fz-muted">
								KHU VỰC GIAO DỊCH
							</h3>
							<div>
								<FieldLabel icon={MapPin}>Khu vực</FieldLabel>
								<div className="mt-2">
									<FieldLabel required>
										Tỉnh/thành phố, phường/xã
									</FieldLabel>
									<div className="mt-1.5">
										<LocationPicker
											provinces={provinces}
											onChange={setLocation}
										/>
									</div>
								</div>
							</div>
							<div>
								<FieldLabel htmlFor="addressDetail">
									Địa chỉ chi tiết
								</FieldLabel>
								<Input
									id="addressDetail"
									name="addressDetail"
									placeholder="Số nhà, tên đường... (không bắt buộc)"
									className="mt-1.5 h-11"
								/>
								<FieldError
									message={errors.errors?.addressDetail}
								/>
							</div>
						</div>
					)}

					{showPasswordGroup && (showContactGroup || showAddressGroup) && (
						<div aria-hidden className="h-px bg-border" />
					)}

					{needs('password') && (
						<div>
							<h3 className="mb-4 text-xs font-semibold tracking-[0.14em] text-fz-muted">
								BẢO MẬT TÀI KHOẢN
							</h3>
							<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
							<div>
								<FieldLabel
									icon={Lock}
									htmlFor="password"
									required
								>
									Thêm một mật khẩu
								</FieldLabel>
								<PasswordInput
									id="password"
									name="password"
									required
									placeholder="••••••••"
									wrapperClassName="mt-1.5"
									className="h-11"
								/>
								<FieldError message={errors.errors?.password} />
							</div>
							<div>
								<FieldLabel
									icon={Lock}
									htmlFor="confirmPassword"
									required
								>
									Xác nhận mật khẩu
								</FieldLabel>
								<PasswordInput
									id="confirmPassword"
									name="confirmPassword"
									required
									placeholder="••••••••"
									wrapperClassName="mt-1.5"
									className="h-11"
								/>
								<FieldError
									message={errors.errors?.confirmPassword}
								/>
							</div>
							</div>
						</div>
					)}
					</div>

					<div className="shrink-0 border-t border-border bg-muted/35 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-7">
						<FieldError message={errors.message} />
						<Button
							type="submit"
							variant="default"
							className="min-h-11 w-full text-sm"
							disabled={submitting}
						>
							{submitting ? 'Đang lưu...' : 'Lưu và tiếp tục'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
