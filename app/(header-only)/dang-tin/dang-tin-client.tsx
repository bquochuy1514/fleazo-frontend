'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
	Eye,
	FileText,
	ImagePlus,
	Loader2,
	MapPin,
	Sparkles,
	Tag,
	Tags,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
	ImageUploader,
	type ImageItem,
} from '@/components/listing-form/image-uploader';
import { CategoryPicker } from '@/components/listing-form/category-picker';
import {
	LocationPicker,
	type LocationValue,
} from '@/components/location/location-picker';
import { CompleteProfileModal } from '@/components/form/complete-profile-modal';
import { FieldError } from '@/components/form/field-error';
import { FieldLabel } from '@/components/form/field-label';
import { SectionHeader } from '@/components/form/section-header';
import { ListingCard } from '@/components/listings/listing-card';
import { useAuth } from '@/hooks/use-auth';
import { parseApiError } from '@/lib/api';
import type { ProvinceWithWards } from '@/lib/locations';
import { suggestListing } from '@/lib/products-ai';
import {
	createDraft,
	createProduct,
	getEditProductCache,
	updateProduct,
	type ProductImageOrderItem,
	type ProductField,
} from '@/lib/products';
import { getMissingSellerFields } from '@/lib/seller-profile';
import { getMyMembership } from '@/lib/membership';
import { cn } from '@/lib/utils';
import type { ApiErrorResponse } from '@/types/api.types';
import {
	PRODUCT_CONDITION_LABELS,
	type Product,
	type ProductCondition,
} from '@/types/product.types';

const CONDITIONS = Object.keys(PRODUCT_CONDITION_LABELS) as ProductCondition[];

const EMPTY_LOCATION: LocationValue = {
	provinceCode: null,
	provinceName: '',
	wardCode: null,
	wardName: '',
};

// p-6 vs secondary's p-4: size step signals hierarchy (primary tier first).
const CARD_PRIMARY =
	'rounded-2xl border border-border bg-card p-6 shadow-sm shadow-fz-ink/5';
const CARD_SECONDARY =
	'rounded-2xl border border-border bg-card p-4 shadow-sm shadow-fz-ink/5';

// useSearchParams needs a Suspense boundary (Next build requirement) — same
// pattern as /dang-nhap.
export function DangTinPageClient({
	provinces,
}: {
	provinces: ProvinceWithWards[];
}) {
	return (
		<Suspense fallback={null}>
			<DangTinRoute provinces={provinces} />
		</Suspense>
	);
}

function DangTinRoute({ provinces }: { provinces: ProvinceWithWards[] }) {
	const searchParams = useSearchParams();
	const editId = searchParams.get('edit');

	// Remounts on editId change to avoid carrying over stale form state.
	return (
		<DangTinForm
			key={editId ?? 'create'}
			editId={editId}
			provinces={provinces}
		/>
	);
}

function DangTinForm({
	editId,
	provinces,
}: {
	editId: string | null;
	provinces: ProvinceWithWards[];
}) {
	const router = useRouter();
	const { user } = useAuth();

	// Edit mode: ?edit=<id> + getEditProductCache (sessionStorage) hands off
	// product data without a second fetch.
	const isEditMode = editId !== null;
	const [editProduct, setEditProduct] = useState<Product | null>(null);
	const [isLoadingEdit, setIsLoadingEdit] = useState(isEditMode);
	const [deleteImageIds, setDeleteImageIds] = useState<number[]>([]);

	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [price, setPrice] = useState('');
	const [condition, setCondition] = useState<ProductCondition | ''>('');
	const [images, setImages] = useState<ImageItem[]>([]);
	const [imagesOrder, setImagesOrder] = useState<ProductImageOrderItem[]>([]);
	const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | undefined>();
	const [categoryId, setCategoryId] = useState<number | null>(null);
	const [categoryLabel, setCategoryLabel] = useState('');
	const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION);
	const [addressDetail, setAddressDetail] = useState('');
	const [isSuggesting, setIsSuggesting] = useState(false);
	const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
	const [isPublishing, setIsPublishing] = useState(false);
	const [isSavingDraft, setIsSavingDraft] = useState(false);
	const [isSavingEdit, setIsSavingEdit] = useState(false);
	const [errors, setErrors] = useState<ApiErrorResponse<ProductField>>({});
	// Infinity ("not known yet") until the membership fetch below resolves —
	// see ImageUploader's maxImages prop comment for why a guessed finite
	// default is unsafe here (it can wrongly trim a seller's own existing
	// images in edit mode).
	const [maxImages, setMaxImages] = useState(Infinity);

	const locationLabel =
		location.wardName && location.provinceName
			? `${location.wardName}, ${location.provinceName}`
			: location.provinceName || '';

	// Live preview cover: new uploads take priority, falling back to the
	// listing's first remaining existing image in edit mode.
	const remainingExistingImages = editProduct
		? [...editProduct.images]
				.filter((img) => !deleteImageIds.includes(img.id))
				.sort((a, b) => a.order - b.order)
		: [];
	const previewImageUrl =
		coverPreviewUrl ??
		remainingExistingImages[0]?.url ??
		images[0]?.previewUrl;

	// Load the edited product once from the sessionStorage handoff, on mount.
	useEffect(() => {
		if (!isEditMode) return;
		const id = Number(editId);
		const cached = getEditProductCache(id);
		if (!cached) {
			toast.error(
				'Không tìm thấy tin để sửa, vui lòng thử lại từ Quản lý tin.',
			);
			router.replace('/quan-ly-tin');
			return;
		}
		queueMicrotask(() => {
			setEditProduct(cached);
			setTitle(cached.title);
			setDescription(cached.description);
			setPrice(String(cached.price));
			setCondition(cached.condition);
			setCategoryId(cached.categoryId);
			setCategoryLabel(cached.category.name);
			setLocation({
				provinceCode: cached.provinceCode,
				provinceName: cached.provinceName,
				wardCode: cached.wardCode,
				wardName: cached.wardName,
			});
			setAddressDetail(cached.addressDetail ?? '');
			setIsLoadingEdit(false);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (isEditMode || !user?.addressDetail || addressDetail) return;
		const addressDetailValue = user.addressDetail;
		// queueMicrotask avoids react-hooks/set-state-in-effect
		queueMicrotask(() => setAddressDetail(addressDetailValue));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	// Drives the ImageUploader's cap — silently keeps the Free default above
	// on failure rather than blocking the whole form over one extra call.
	useEffect(() => {
		getMyMembership()
			.then((membership) => setMaxImages(membership.plan.maxImagesPerListing))
			.catch(() => {});
	}, []);

	const handleSuggest = async () => {
		if (images.length === 0) return;
		setIsSuggesting(true);
		try {
			const suggestion = await suggestListing(
				images.map((item) => item.file),
			);
			setTitle(suggestion.title);
			setDescription(suggestion.description);
			setCategoryId(suggestion.categoryId);
			toast.success(
				'AI đã gợi ý xong, kiểm tra lại nội dung trước khi đăng.',
			);
		} catch (err) {
			const { message } = parseApiError(err);
			toast.error(message);
		} finally {
			setIsSuggesting(false);
		}
	};

	const submit = async (kind: 'publish' | 'draft') => {
		const setLoading =
			kind === 'publish' ? setIsPublishing : setIsSavingDraft;
		setLoading(true);

		try {
			const payload = {
				title,
				description,
				price: price ? Number(price) : undefined,
				condition: condition || undefined,
				categoryId: categoryId ?? undefined,
				provinceCode: location.provinceCode ?? undefined,
				provinceName: location.provinceName || undefined,
				wardCode: location.wardCode ?? undefined,
				wardName: location.wardName || undefined,
				addressDetail: addressDetail || undefined,
			};
			const files = images.map((item) => item.file);

			if (kind === 'publish') {
				await createProduct(payload, files);
				toast.success(
					'Đã đăng tin, chờ admin duyệt trước khi hiển thị công khai.',
				);
			} else {
				await createDraft(payload, files);
				toast.success('Đã lưu nháp.');
			}

			router.push('/quan-ly-tin');
		} catch (err) {
			const parsed = parseApiError<ProductField>(err);
			setErrors(parsed);

			if (parsed.errors && Object.keys(parsed.errors).length > 0) {
				toast.error(
					kind === 'publish'
						? 'Vui lòng điền đầy đủ các trường có dấu * trước khi đăng tin.'
						: 'Vui lòng điền đầy đủ các trường có dấu * trước khi lưu nháp.',
				);
			} else if (parsed.errorCode === 'INCOMPLETE_SELLER_PROFILE') {
				setIsProfileModalOpen(true);
			} else if (parsed.errorCode === 'LISTING_LIMIT_REACHED') {
				toast.error(
					parsed.message ??
						'Bạn đã đạt giới hạn tin đang hoạt động của gói hiện tại.',
					{
						action: {
							label: 'Nâng cấp gói',
							onClick: () => router.push('/goi-thanh-vien'),
						},
					},
				);
			} else if (parsed.message) {
				toast.error(parsed.message);
			}
		} finally {
			setLoading(false);
		}
	};

	const handlePublishClick = () => {
		if (user && getMissingSellerFields(user).length > 0) {
			setIsProfileModalOpen(true);
			return;
		}
		void submit('publish');
	};

	// Plain text/image edit — never changes status, so no publish/draft split
	// and no seller-profile gate here.
	const handleSaveEdit = async () => {
		if (!editProduct) return;
		setIsSavingEdit(true);
		try {
			const payload = {
				title,
				description,
				price: price ? Number(price) : undefined,
				condition: condition || undefined,
				categoryId: categoryId ?? undefined,
				provinceCode: location.provinceCode ?? undefined,
				provinceName: location.provinceName || undefined,
				wardCode: location.wardCode ?? undefined,
				wardName: location.wardName || undefined,
				addressDetail: addressDetail || undefined,
			};
			const files = images.map((item) => item.file);

			await updateProduct(
				editProduct.id,
				payload,
				files,
				deleteImageIds,
				imagesOrder,
			);
			toast.success('Đã lưu thay đổi.');
			router.push('/quan-ly-tin');
		} catch (err) {
			const parsed = parseApiError<ProductField>(err);
			setErrors(parsed);

			if (parsed.errors && Object.keys(parsed.errors).length > 0) {
				toast.error(
					'Vui lòng điền đầy đủ các trường có dấu * trước khi lưu.',
				);
			} else if (parsed.message) {
				toast.error(parsed.message);
			}
		} finally {
			setIsSavingEdit(false);
		}
	};

	const isBusy = isPublishing || isSavingDraft || isSavingEdit;

	if (isEditMode && isLoadingEdit) {
		return (
			<div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-24 text-sm text-muted-foreground">
				<Loader2 className="mr-2 size-4 animate-spin" />
				Đang tải tin đăng...
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-6xl px-4 pt-8 pb-28 sm:pt-10">
			<h1 className="fz-rise font-heading text-2xl font-bold text-fz-ink sm:text-3xl">
				{isEditMode ? 'Chỉnh sửa tin đăng' : 'Đăng tin bán'}
			</h1>
			<p
				style={{ animationDelay: '40ms' }}
				className="fz-rise mt-1.5 text-[15px] text-muted-foreground"
			>
				{isEditMode
					? 'Cập nhật lại thông tin tin đăng của bạn'
					: 'Đồ bạn không dùng nữa, biết đâu là thứ khoá sau đang tìm'}
			</p>

			<form className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
				{/* fz-rise per column, not per card, to avoid an "AOS-fade-up" look. */}
				<div
					style={{ animationDelay: '80ms' }}
					className="fz-rise space-y-10 lg:col-span-2"
				>
					{/* Primary tier: photo, AI assist, title/description read as one flow. */}
					<div className="space-y-4">
						<section className={CARD_PRIMARY}>
							<SectionHeader
								icon={ImagePlus}
								title="Hình ảnh sản phẩm"
								required
							/>
							<ImageUploader
								maxImages={maxImages}
								onChange={setImages}
								onOrderChange={(order, coverUrl) => {
									setImagesOrder(order);
									setCoverPreviewUrl(coverUrl);
								}}
								initialImages={
									editProduct
										? [...editProduct.images]
												.sort(
													(a, b) => a.order - b.order,
												)
												.map((img) => ({
													id: img.id,
													url: img.url,
												}))
										: undefined
								}
								onExistingImagesChange={(remainingIds) => {
									if (!editProduct) return;
									setDeleteImageIds(
										editProduct.images
											.filter(
												(img) =>
													!remainingIds.includes(
														img.id,
													),
											)
											.map((img) => img.id),
									);
								}}
							/>
							<FieldError message={errors.message} />
						</section>

						{/* Hidden in edit mode to avoid overwriting reviewed content. */}
						{!isEditMode && (
							<section className="flex flex-col items-start gap-3 rounded-2xl border border-fz-accent/30 bg-fz-accent-soft/40 p-5 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex items-start gap-3">
									<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-fz-accent-soft text-fz-accent">
										<Sparkles className="size-4.5" />
									</span>
									<div>
										<p className="text-sm font-semibold text-fz-ink">
											Để AI điền giúp bạn
										</p>
										<p className="mt-0.5 text-xs text-muted-foreground">
											AI gợi ý luôn Tiêu đề, Mô tả và Danh
											mục dựa trên ảnh bạn vừa tải lên.
											{images.length === 0 &&
												' Tải ảnh lên trước để dùng tính năng này.'}
										</p>
									</div>
								</div>
								<Button
									type="button"
									variant="default"
									className="w-full shrink-0 sm:w-auto"
									disabled={
										images.length === 0 || isSuggesting
									}
									onClick={handleSuggest}
									size="lg"
								>
									{isSuggesting ? (
										<Loader2 className="size-4 animate-spin" />
									) : (
										<Sparkles className="size-4" />
									)}
									{isSuggesting
										? 'Đang phân tích...'
										: 'Nhờ AI gợi ý'}
								</Button>
							</section>
						)}

						<section className={cn(CARD_PRIMARY, 'space-y-4')}>
							<SectionHeader
								icon={FileText}
								title="Thông tin chi tiết"
							/>

							<div>
								<FieldLabel htmlFor="title" required>
									Tiêu đề
								</FieldLabel>
								<Input
									id="title"
									name="title"
									placeholder="VD: Giáo trình Kinh tế vi mô, còn mới 90%"
									className="mt-1.5 h-11"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									disabled={isSuggesting}
								/>
								<FieldError message={errors.errors?.title} />
							</div>

							<div>
								<FieldLabel htmlFor="description" required>
									Mô tả
								</FieldLabel>
								<Textarea
									id="description"
									name="description"
									rows={5}
									placeholder="Mô tả tình trạng, lý do bán, thông tin thêm... hoặc dùng tính năng AI gợi ý phía trên sau khi tải ảnh lên"
									className="mt-1.5"
									value={description}
									onChange={(e) =>
										setDescription(e.target.value)
									}
									disabled={isSuggesting}
								/>
								<FieldError
									message={errors.errors?.description}
								/>
							</div>
						</section>
					</div>

					{/* Secondary tier: metadata, smaller cards, separated by space-y-10 above. */}
					<div className="space-y-4">
						<section className={CARD_SECONDARY}>
							<SectionHeader
								icon={Tag}
								title="Giá & tình trạng"
							/>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div>
									<FieldLabel htmlFor="price" required>
										Giá bán (VNĐ)
									</FieldLabel>
									<Input
										id="price"
										name="price"
										type="text"
										inputMode="numeric"
										placeholder="0"
										className="mt-1.5 h-11 tabular-nums"
										value={
											price
												? new Intl.NumberFormat(
														'vi-VN',
													).format(Number(price))
												: ''
										}
										onChange={(e) =>
											setPrice(
												e.target.value.replace(
													/\D/g,
													'',
												),
											)
										}
									/>
									<FieldError
										message={errors.errors?.price}
									/>
								</div>

								<div>
									<FieldLabel required>Tình trạng</FieldLabel>
									<div className="mt-1.5 flex flex-wrap gap-2">
										{CONDITIONS.map((c) => (
											<button
												key={c}
												type="button"
												onClick={() => setCondition(c)}
												aria-pressed={condition === c}
												className={cn(
													'h-9 rounded-full border px-3.5 text-sm font-medium transition-colors',
													condition === c
														? 'border-transparent bg-primary text-primary-foreground'
														: 'border-border bg-card text-fz-ink hover:bg-muted',
												)}
											>
												{PRODUCT_CONDITION_LABELS[c]}
											</button>
										))}
									</div>
									<FieldError
										message={errors.errors?.condition}
									/>
								</div>
							</div>
						</section>

						<section className={CARD_SECONDARY}>
							<SectionHeader
								icon={Tags}
								title="Danh mục"
								required
							/>
							<CategoryPicker
								value={categoryId}
								onChange={(value) => {
									setCategoryId(value.categoryId);
									setCategoryLabel(value.categoryName);
								}}
								error={errors.errors?.categoryId}
								disabled={isSuggesting}
							/>
						</section>
					</div>
				</div>

				<div
					style={{ animationDelay: '140ms' }}
					className="fz-rise space-y-6 lg:sticky lg:top-30"
				>
					<section className={cn(CARD_SECONDARY, 'space-y-4')}>
						<SectionHeader icon={MapPin} title="Khu vực" />

						<div>
							<FieldLabel required>
								Tỉnh/thành phố, phường/xã
							</FieldLabel>
							<div className="mt-1.5">
								<LocationPicker
									provinces={provinces}
									onChange={setLocation}
									value={
										editProduct
											? {
													provinceCode:
														editProduct.provinceCode,
													wardCode:
														editProduct.wardCode,
												}
											: user
												? {
														provinceCode:
															user.provinceCode,
														wardCode: user.wardCode,
													}
												: undefined
									}
								/>
							</div>
							<FieldError
								message={
									errors.errors?.provinceCode ??
									errors.errors?.wardCode
								}
							/>
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
								value={addressDetail}
								onChange={(e) =>
									setAddressDetail(e.target.value)
								}
							/>
						</div>
					</section>

					{/* Renders the actual ListingCard, not a mockup. CARD_PRIMARY: payoff card. */}
					<section className={CARD_PRIMARY}>
						<SectionHeader icon={Eye} title="Xem trước" />
						<div className="mx-auto max-w-56">
							<ListingCard
								title={title || 'Tên sản phẩm của bạn'}
								price={price || 0}
								imageUrl={previewImageUrl}
								condition={condition || undefined}
								categoryLabel={categoryLabel || undefined}
								locationLabel={locationLabel || undefined}
							/>
						</div>
					</section>
				</div>
			</form>

			<div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
				<div className="mx-auto max-w-3xl">
					{isEditMode ? (
						<Button
							type="button"
							variant="default"
							className="h-11 w-full"
							disabled={isBusy}
							onClick={() => void handleSaveEdit()}
						>
							{isSavingEdit ? 'Đang lưu...' : 'Lưu thay đổi'}
						</Button>
					) : (
						<div className="flex gap-3">
							<Button
								type="button"
								variant="outline"
								className="h-11 flex-1"
								disabled={isBusy}
								onClick={() => void submit('draft')}
							>
								{isSavingDraft ? 'Đang lưu...' : 'Lưu nháp'}
							</Button>
							<Button
								type="button"
								variant="default"
								className="h-11 flex-1"
								disabled={isBusy}
								onClick={handlePublishClick}
							>
								{isPublishing ? 'Đang đăng tin...' : 'Đăng tin'}
							</Button>
						</div>
					)}
				</div>
			</div>

			<CompleteProfileModal
				open={isProfileModalOpen}
				onOpenChange={setIsProfileModalOpen}
				onCompleted={() => void submit('publish')}
				provinces={provinces}
			/>
		</div>
	);
}
