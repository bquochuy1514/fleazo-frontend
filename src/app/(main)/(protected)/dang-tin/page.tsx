'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { ImageUploader } from '@/components/products/image-uploader';
import { CategoryPicker } from '@/components/products/category-picker';
import { LocationPicker } from '@/components/products/location-picker';

const CONDITIONS = [
	{ value: 'NEW', label: 'Mới' },
	{ value: 'LIKE_NEW', label: 'Như mới' },
	{ value: 'GOOD', label: 'Tốt' },
	{ value: 'FAIR', label: 'Khá' },
	{ value: 'POOR', label: 'Cũ' },
];

export default function DangTinPage() {
	return (
		<div className="mx-auto max-w-2xl px-4 py-8">
			<h1 className="font-heading text-2xl font-semibold text-fz-ink sm:text-3xl">
				Đăng tin bán
			</h1>
			<p className="mt-1.5 text-sm text-muted-foreground">
				Điền thông tin sản phẩm để đăng bán trên Fleazo
			</p>

			<form className="mt-6 space-y-6">
				<section>
					<label className="text-sm font-medium text-fz-ink">
						Hình ảnh sản phẩm
					</label>
					<div className="mt-2">
						<ImageUploader />
					</div>
				</section>

				<section className="space-y-4">
					<div>
						<label
							htmlFor="title"
							className="text-sm font-medium text-fz-ink"
						>
							Tiêu đề
						</label>
						<Input
							id="title"
							name="title"
							placeholder="VD: Giáo trình Kinh tế vi mô, còn mới 90%"
							className="mt-1.5 h-11 text-sm"
						/>
					</div>

					<div>
						<label
							htmlFor="description"
							className="text-sm font-medium text-fz-ink"
						>
							Mô tả
						</label>
						<Textarea
							id="description"
							name="description"
							rows={5}
							placeholder="Mô tả tình trạng, lý do bán, thông tin thêm..."
							className="mt-1.5 text-sm field-sizing-fixed"
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label
								htmlFor="price"
								className="text-sm font-medium text-fz-ink"
							>
								Giá bán (VNĐ)
							</label>
							<Input
								id="price"
								name="price"
								type="number"
								min={1}
								placeholder="0"
								className="mt-1.5 h-11 text-sm tabular-nums"
							/>
						</div>

						<div>
							<label
								htmlFor="condition"
								className="text-sm font-medium text-fz-ink"
							>
								Tình trạng
							</label>
							<Select name="condition">
								<SelectTrigger
									id="condition"
									className="mt-1.5 w-full !h-11"
								>
									<SelectValue placeholder="Chọn tình trạng" />
								</SelectTrigger>
								<SelectContent>
									{CONDITIONS.map((c) => (
										<SelectItem
											key={c.value}
											value={c.value}
										>
											{c.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</section>

				<section>
					<label className="text-sm font-medium text-fz-ink">
						Danh mục
					</label>
					<div className="mt-2">
						<CategoryPicker />
					</div>
				</section>

				<section>
					<label className="text-sm font-medium text-fz-ink">
						Khu vực
					</label>
					<div className="mt-2 space-y-3">
						<LocationPicker />
						<Input
							name="addressDetail"
							placeholder="Địa chỉ chi tiết (số nhà, tên đường...)"
							className="h-11 text-sm"
						/>
					</div>
				</section>

				<div className="flex gap-3 pt-2">
					<Button
						type="button"
						variant="outline"
						className="h-11 flex-1 text-sm"
					>
						Lưu nháp
					</Button>
					<Button
						type="button"
						variant="default"
						className="h-11 flex-1 text-sm"
					>
						Đăng tin
					</Button>
				</div>
			</form>
		</div>
	);
}
