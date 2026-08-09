'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Button, buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuth } from '@/hooks/use-auth';
import { createOrUpdateReview } from '@/lib/reviews';
import { parseApiError } from '@/lib/api';
import { timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';
import { StarRatingDisplay, StarRatingInput } from '@/components/reviews/star-rating';
import type { PaginatedReviews, Review } from '@/types/review.types';

export function ReviewsSection({
	sellerId,
	sellerName,
	initialReviews,
}: {
	sellerId: number;
	sellerName: string;
	initialReviews: PaginatedReviews;
}) {
	const { user } = useAuth();
	const [reviews, setReviews] = useState<Review[]>(initialReviews.data);

	const myReview = user ? reviews.find((r) => r.reviewerId === user.id) : undefined;
	const [rating, setRating] = useState(myReview?.rating ?? 0);
	const [comment, setComment] = useState(myReview?.comment ?? '');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const canReview = !!user && user.id !== sellerId;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!rating) {
			toast.error('Chọn số sao trước khi gửi đánh giá.');
			return;
		}

		setIsSubmitting(true);
		try {
			const saved = await createOrUpdateReview({
				sellerId,
				rating,
				comment: comment.trim() || undefined,
			});
			setReviews((prev) => {
				const next = prev.filter((r) => r.id !== saved.id && r.reviewerId !== saved.reviewerId);
				return [{ ...saved, reviewer: { id: user!.id, fullName: user!.fullName, avatar: user!.avatar } }, ...next];
			});
			toast.success(myReview ? 'Đã cập nhật đánh giá.' : 'Đã gửi đánh giá.');
		} catch (err) {
			toast.error(parseApiError(err).message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="mt-5 space-y-6">
			{canReview && (
				<form
					onSubmit={handleSubmit}
					className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-fz-ink/5 sm:p-5"
				>
					<p className="font-heading text-sm font-semibold text-fz-ink">
						{myReview ? 'Sửa đánh giá của bạn' : `Đánh giá ${sellerName}`}
					</p>
					<div className="mt-2">
						<StarRatingInput value={rating} onChange={setRating} />
					</div>
					<Textarea
						rows={3}
						placeholder="Trải nghiệm giao dịch của bạn thế nào? (không bắt buộc)"
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						disabled={isSubmitting}
						className="mt-3"
					/>
					<Button type="submit" size="lg" className="mt-3 h-11" disabled={isSubmitting}>
						{isSubmitting ? 'Đang gửi...' : myReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
					</Button>
				</form>
			)}

			{!user && (
				<div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm shadow-fz-ink/5">
					<p className="text-sm text-muted-foreground">
						Đăng nhập để đánh giá {sellerName}.
					</p>
					<Link
						href={`/dang-nhap?next=${encodeURIComponent(`/nguoi-dung/${sellerId}`)}`}
						className={cn(buttonVariants({ variant: 'outline' }), 'h-9 shrink-0 px-4')}
					>
						Đăng nhập
					</Link>
				</div>
			)}

			{reviews.length === 0 ? (
				<EmptyState
					icon={Star}
					title="Chưa có đánh giá"
					description={`Hãy là người đầu tiên đánh giá ${sellerName} sau khi đã trao đổi.`}
				/>
			) : (
				<ul className="space-y-4">
					{reviews.map((review) => (
						<li
							key={review.id}
							className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-fz-ink/5"
						>
							<div className="flex items-center gap-3">
								<Image
									src={review.reviewer.avatar}
									alt={review.reviewer.fullName}
									width={36}
									height={36}
									className="size-9 shrink-0 rounded-full object-cover"
								/>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium text-fz-ink">
										{review.reviewer.fullName}
									</p>
									<p className="text-xs text-muted-foreground">{timeAgo(review.createdAt)}</p>
								</div>
								<StarRatingDisplay rating={review.rating} />
							</div>
							{review.comment && (
								<p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-fz-ink">
									{review.comment}
								</p>
							)}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
