'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type FaqItem = { question: string; answer: string };

// grid-rows-[0fr]→[1fr] instead of max-height: an arbitrary max-height has
// to guess the tallest possible answer, this doesn't — it animates to
// exactly the content's own height at any viewport width.
export function FaqList({ items }: { items: FaqItem[] }) {
	const [openIndex, setOpenIndex] = useState<number | null>(0);

	return (
		<div className="mt-10 flex flex-col gap-3 sm:mt-12">
			{items.map(({ question, answer }, index) => {
				const isOpen = openIndex === index;
				return (
					<div
						key={question}
						className="fz-rise overflow-hidden rounded-2xl border border-border bg-card"
						style={{ animationDelay: `${80 + index * 50}ms` }}
					>
						<button
							type="button"
							onClick={() => setOpenIndex(isOpen ? null : index)}
							aria-expanded={isOpen}
							className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
						>
							<span className="font-heading text-sm font-semibold text-fz-ink sm:text-base">
								{question}
							</span>
							<ChevronDown
								aria-hidden
								className={cn(
									'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
									isOpen && 'rotate-180',
								)}
							/>
						</button>
						<div
							className={cn(
								'grid transition-[grid-template-rows] duration-300 ease-out',
								isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
							)}
						>
							<div className="overflow-hidden">
								<p className="px-5 pb-4 text-sm leading-6 text-muted-foreground">
									{answer}
								</p>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
