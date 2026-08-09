'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BookOpen, CreditCard, Search, Send, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ListingCard } from '@/components/listings/listing-card';
import { parseApiError } from '@/lib/api';
import { sendChatMessage } from '@/lib/chatbot';
import { firstImageUrl, locationLabel } from '@/lib/products';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product.types';
import type { ChatMessage } from '@/types/chatbot.types';

// Gemini writes replies in markdown (**bold**, "- " lists...) — without a
// renderer those symbols show up as literal asterisks in the bubble.
// react-markdown's default element spacing (browser default <p>/<ul>
// margins) reads too loose inside a small chat bubble, so every block-level
// tag gets a tight override here instead of the library's defaults.
const MARKDOWN_COMPONENTS: Components = {
	p: ({ children }) => <p className="[&:not(:first-child)]:mt-2">{children}</p>,
	strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
	ul: ({ children }) => (
		<ul className="mt-1.5 list-disc space-y-1 pl-4">{children}</ul>
	),
	ol: ({ children }) => (
		<ol className="mt-1.5 list-decimal space-y-1 pl-4">{children}</ol>
	),
	li: ({ children }) => <li>{children}</li>,
	a: ({ children, href }) => (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="text-fz-accent underline underline-offset-2"
		>
			{children}
		</a>
	),
	code: ({ children }) => (
		<code className="rounded bg-fz-ink/10 px-1 py-0.5 text-xs">
			{children}
		</code>
	),
};

// Shown once, up front, so a first-time user knows the scope before typing
// anything — three concrete things the bot does, not a vague "ask me
// anything". Keep in sync with chatbot_service.py's PERSONA (fleazo-ai) if
// the actual capabilities ever change.
const CAPABILITIES = [
	{
		icon: Search,
		text: 'Tìm sản phẩm đang bán theo giá, khu vực, tình trạng...',
	},
	{ icon: BookOpen, text: 'Hướng dẫn đăng tin & chính sách giao dịch' },
	{ icon: CreditCard, text: 'Thông tin các gói thành viên' },
];

// Grouped (not one flat list) so the two "modes" — tìm sản phẩm vs. hỏi
// thông tin — read as visibly separate. Tapping one sends it as the user's
// first message. Each "Hướng dẫn" prompt maps to a page that actually
// exists (huong-dan-dang-tin, goi-thanh-vien, tin-nhan messaging) — keep
// this in sync as new help content ships instead of promising pages/answers
// that aren't backed by anything yet.
const PROMPT_GROUPS = [
	{
		label: 'Tìm sản phẩm',
		prompts: ['Tìm laptop giá rẻ ở TPHCM', 'Điện thoại dưới 5 triệu còn mới'],
	},
	{
		label: 'Hướng dẫn',
		prompts: [
			'Cách đăng tin ở Fleazo',
			'Các gói thành viên khác nhau thế nào',
			'Liên hệ người bán như thế nào',
		],
	},
];

// Extends ChatMessage with UI-only data (the products found for this
// reply) — history sent back to the API strips this off again (see
// toApiHistory below), the backend never needs to know about it.
type DisplayMessage = ChatMessage & { listings?: Product[] };

function toApiHistory(messages: DisplayMessage[]): ChatMessage[] {
	return messages.map(({ role, content }) => ({ role, content }));
}

// Routes where the shopper-facing assistant doesn't belong: /tin-nhan has
// its own real human-to-human chat (a second bubble there reads as a second
// inbox, not a helper); the (auth) flows are mid-authentication and
// form-focused; /admin is an internal tool, not customer-facing; /dang-tin
// is a long multi-step form where a floating card competes with the submit
// flow. Checked by prefix so nested routes (e.g. /admin/xyz) are covered.
const HIDDEN_ROUTE_PREFIXES = [
	'/tin-nhan',
	'/dang-nhap',
	'/dang-ky',
	'/quen-mat-khau',
	'/xac-thuc-otp-quen-mat-khau',
	'/dat-lai-mat-khau',
	'/xac-thuc-tai-khoan',
	'/google-callback',
	'/admin',
	'/dang-tin',
];

function isChatbotHiddenOn(pathname: string): boolean {
	return HIDDEN_ROUTE_PREFIXES.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
	);
}

// Three dots easing up/down in sequence — the assistant-is-typing cue.
function TypingDots() {
	return (
		<div className="flex items-center gap-1 py-1" aria-hidden>
			{[0, 1, 2].map((i) => (
				<span
					key={i}
					className="fz-typing size-1.5 rounded-full bg-fz-muted"
					style={{ animationDelay: `${i * 150}ms` }}
				/>
			))}
		</div>
	);
}

// The source PNGs have padding baked in around the character (deliberate,
// so the shape never touches the canvas edge) — at avatar sizes that reads
// as "the creature is tiny inside the circle". Scaling up and letting the
// circular wrapper's overflow-hidden crop the excess padding fills the
// circle properly instead of shrinking the whole canvas down.
function MascotAvatar({
	src,
	className,
	zoomClassName = 'scale-150',
}: {
	src: string;
	className: string;
	zoomClassName?: string;
}) {
	return (
		<div
			className={cn(
				'relative shrink-0 overflow-hidden rounded-full',
				className,
			)}
		>
			<Image src={src} alt="" fill className={cn('object-contain', zoomClassName)} />
		</div>
	);
}

export function ChatbotWidget() {
	const pathname = usePathname();
	const isHidden = isChatbotHiddenOn(pathname);

	const [isOpen, setIsOpen] = useState(false);
	const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
	const [isBouncing, setIsBouncing] = useState(false);
	const [showIntroBubble, setShowIntroBubble] = useState(false);
	const [messages, setMessages] = useState<DisplayMessage[]>([]);
	const [input, setInput] = useState('');
	const [isSending, setIsSending] = useState(false);
	const listEndRef = useRef<HTMLDivElement>(null);

	// Delayed so it doesn't compete with the page's own load-in animations.
	// Stays up indefinitely after that — only the user's own close tap (or
	// opening the chat) dismisses it, no auto-hide timer.
	useEffect(() => {
		if (isHidden) return;
		const showTimer = setTimeout(() => setShowIntroBubble(true), 1500);
		return () => clearTimeout(showTimer);
	}, [isHidden]);

	useEffect(() => {
		if (!isOpen) return;
		listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, isOpen]);

	// Nudges attention toward the launcher every few seconds until the
	// visitor actually opens it once — a one-off bounce on load gets missed
	// by anyone not looking at that exact moment, a periodic one doesn't.
	useEffect(() => {
		if (hasOpenedOnce || isHidden) return;
		const interval = setInterval(() => {
			setIsBouncing(true);
			setTimeout(() => setIsBouncing(false), 800);
		}, 6000);
		return () => clearInterval(interval);
	}, [hasOpenedOnce, isHidden]);

	const toggleOpen = () => {
		setIsOpen((v) => !v);
		setHasOpenedOnce(true);
		setShowIntroBubble(false);
	};

	const handleSend = async (overrideText?: string) => {
		const text = (overrideText ?? input).trim();
		if (!text || isSending) return;

		const history = toApiHistory(messages);
		setMessages((prev) => [...prev, { role: 'user', content: text }]);
		setInput('');
		setIsSending(true);

		try {
			const res = await sendChatMessage(text, history);
			setMessages((prev) => [
				...prev,
				{ role: 'model', content: res.reply, listings: res.listings },
			]);
		} catch (err) {
			// A model turn is added even on failure (not just a toast) — the
			// next request's history needs user/model turns to alternate, and
			// a stray unanswered user message would look stuck forever.
			const message =
				parseApiError(err).message ??
				'Xin lỗi, mình đang gặp lỗi. Vui lòng thử lại.';
			toast.error(message);
			setMessages((prev) => [...prev, { role: 'model', content: message }]);
		} finally {
			setIsSending(false);
		}
	};

	if (isHidden) return null;

	return (
		<>
			{isOpen && (
				// Rendered as a sibling of the translateZ(0) launcher wrapper below,
				// not a child — a transformed ancestor becomes the containing block
				// for `fixed` descendants, which would turn `inset-0` into "fill the
				// launcher's own tiny box" instead of "fill the viewport". Because
				// they're independent siblings (not nested in one flex column like
				// before), the panel's own md:bottom offset has to clear the
				// launcher's height + gap itself (1.5rem bottom + 3.5rem button +
				// 0.75rem gap) instead of relying on document flow to stack them.
				// Below `md` this is a full-screen sheet (a capped-height corner
				// card leaves too little room once the mobile keyboard opens); at
				// `md`+ there's enough screen to go back to the anchored floating
				// card next to the launcher.
				<div className="fz-card fixed inset-0 z-[60] flex flex-col overflow-hidden bg-card md:inset-auto md:right-6 md:bottom-[5.75rem] md:h-[70dvh] md:max-h-[32rem] md:w-full md:max-w-sm md:rounded-3xl md:border md:border-border">
					<div className="flex items-center justify-between border-b border-border px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 md:pt-3">
						<div className="flex items-center gap-2.5">
							<MascotAvatar
								src="/chatbot/mascot-compact.png"
								className="size-8"
							/>
							<div>
								<p className="font-heading text-sm font-bold text-fz-ink">
									Trợ lý Fleazo
								</p>
								<p className="text-xs text-muted-foreground">
									Hỏi về sản phẩm, cách đăng tin, chính sách...
								</p>
							</div>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							aria-label="Đóng trợ lý"
							onClick={() => setIsOpen(false)}
						>
							<X aria-hidden />
						</Button>
					</div>

					<div className="flex-1 overflow-y-auto px-4 py-3">
						{messages.length === 0 ? (
							<div className="flex flex-col gap-4">
								{/* Styled like a model bubble but not part of `messages` —
								    purely a client-side intro, never sent to the backend
								    as fake history. */}
								<div className="flex items-start gap-2">
									<MascotAvatar
										src="/chatbot/mascot.png"
										className="size-10"
										zoomClassName="scale-125"
									/>
									<div className="max-w-[calc(92%-2.5rem)] rounded-2xl bg-muted px-3.5 py-3 text-sm leading-6 text-fz-ink">
										<p className="font-medium">
											Chào bạn! Mình là trợ lý AI của Fleazo, mình có thể
											giúp:
										</p>
										<ul className="mt-2 space-y-1.5">
											{CAPABILITIES.map(({ icon: Icon, text }) => (
												<li key={text} className="flex items-start gap-2">
													<Icon
														aria-hidden
														className="mt-0.5 size-3.5 shrink-0 text-fz-accent"
													/>
													<span>{text}</span>
												</li>
											))}
										</ul>
										<p className="mt-2.5 text-xs text-muted-foreground">
											Mình chỉ hỗ trợ trong phạm vi Fleazo và có thể chưa
											chính xác 100% — bạn kiểm tra lại thông tin quan trọng
											nhé.
										</p>
									</div>
								</div>

								{PROMPT_GROUPS.map((group) => (
									<div key={group.label}>
										<p className="mb-1.5 px-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
											{group.label}
										</p>
										<div className="flex flex-col gap-1.5">
											{group.prompts.map((prompt) => (
												<button
													key={prompt}
													type="button"
													onClick={() => void handleSend(prompt)}
													className="rounded-full border border-border px-3.5 py-2 text-left text-xs font-medium text-fz-ink transition-colors hover:border-fz-ink hover:bg-muted"
												>
													{prompt}
												</button>
											))}
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="flex flex-col gap-3">
								{messages.map((msg, i) => (
									<div key={i} className="flex flex-col gap-2">
										<div
											className={cn(
												'flex items-end gap-2',
												msg.role === 'user' ? 'flex-row-reverse' : 'flex-row',
											)}
										>
											{msg.role === 'model' && (
												<MascotAvatar
													src="/chatbot/mascot-compact.png"
													className="size-6"
												/>
											)}
											<div
												className={cn(
													'max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-6',
													msg.role === 'user'
														? 'bg-fz-ink text-fz-paper whitespace-pre-wrap'
														: 'bg-muted text-fz-ink',
												)}
											>
												{msg.role === 'model' ? (
													<ReactMarkdown components={MARKDOWN_COMPONENTS}>
														{msg.content}
													</ReactMarkdown>
												) : (
													msg.content
												)}
											</div>
										</div>

										{msg.listings && msg.listings.length > 0 && (
											<div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
												{msg.listings.map((product) => (
													<ListingCard
														key={product.id}
														className="w-36 shrink-0"
														id={product.id}
														sellerId={product.sellerId}
														title={product.title}
														price={product.price}
														imageUrl={firstImageUrl(product)}
														condition={product.condition}
														categoryLabel={product.category.name}
														locationLabel={locationLabel(product)}
														saveCount={product.saveCount}
														initialSaved={product.isSaved}
													/>
												))}
											</div>
										)}
									</div>
								))}
								{isSending && (
									<div className="flex items-end gap-2">
										<MascotAvatar
											src="/chatbot/mascot-compact.png"
											className="size-6"
										/>
										<div className="rounded-2xl bg-muted px-3.5">
											<TypingDots />
										</div>
									</div>
								)}
								<div ref={listEndRef} />
							</div>
						)}
					</div>

					<form
						className="flex items-center gap-2 border-t border-border p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:pb-3"
						onSubmit={(e) => {
							e.preventDefault();
							void handleSend();
						}}
					>
						<Input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Nhập câu hỏi của bạn..."
							disabled={isSending}
							className="h-10 flex-1"
						/>
						<Button
							type="submit"
							size="icon"
							aria-label="Gửi"
							disabled={isSending || !input.trim()}
						>
							<Send aria-hidden />
						</Button>
					</form>
				</div>
			)}

			<div
				// iOS Safari trap: env(safe-area-inset-bottom) is NOT constant —
				// it grows once Safari's own chrome (bottom toolbar) auto-hides on
				// scroll, since the home-indicator area then needs real padding
				// that the chrome previously covered. BottomNav already adds this
				// via pb-[env(safe-area-inset-bottom)], so its rendered height
				// grows at that exact moment; a hardcoded bottom-20 here doesn't
				// grow with it and gets overlapped. Doesn't reproduce in a desktop
				// responsive-mode emulator (still Blink, no dynamic chrome).
				// translateZ(0) is a second, unrelated fix: it also stops WebKit
				// from visually lagging this fixed element during active scroll.
				className="fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-[60] [transform:translateZ(0)] will-change-transform md:right-6 md:bottom-6"
			>
				{!isOpen && showIntroBubble && (
					<div className="fz-card animate-in fade-in slide-in-from-bottom-2 relative mb-3 ml-auto w-max max-w-[15rem] rounded-2xl border border-border bg-card px-3.5 py-2.5 text-xs leading-5 text-fz-ink shadow-lg duration-300">
						<button
							type="button"
							aria-label="Đóng gợi ý"
							onClick={() => setShowIntroBubble(false)}
							className="absolute top-1 right-1 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-fz-ink"
						>
							<X aria-hidden className="size-3" />
						</button>
						<p className="pr-4 font-medium">
							Chào bạn! Mình là trợ lý AI của Fleazo 👋
						</p>
						<p className="mt-1 text-muted-foreground">
							Hỏi mình về sản phẩm, cách đăng tin hay chính sách nhé!
						</p>
						{/* Tail: a rotated square anchored to the bubble's own bottom
						    edge so it tracks the bubble's right-aligned position
						    regardless of text length, pointing down at the FAB. */}
						<div className="absolute -bottom-1.5 right-6 size-3 rotate-45 border-r border-b border-border bg-card" />
					</div>
				)}

			<Button
				type="button"
				size="icon-lg"
				aria-label={isOpen ? 'Đóng trợ lý Fleazo' : 'Mở trợ lý Fleazo'}
				onClick={toggleOpen}
				className={cn(
					'ml-auto flex size-14 shadow-lg',
					isBouncing && 'fz-chatbot-bounce',
				)}
			>
				{isOpen ? (
					<X aria-hidden className="size-5" />
				) : (
					<MascotAvatar
						src="/chatbot/mascot-compact.png"
						className="size-11"
					/>
				)}
			</Button>
		</div>
		</>
	);
}
