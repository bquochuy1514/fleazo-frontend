'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function Home() {
	return (
		<>
			<div className="min-h-[1000px]">
				<h1>Hello world</h1>
				<Button
					variant="default"
					onClick={() =>
						toast.success('Đã lưu nháp tin đăng thành công')
					}
				>
					Test
				</Button>
				<Button
					variant="outline"
					onClick={() =>
						toast.error('Không lưu nháp tin đăng thành công')
					}
				>
					Test
				</Button>
			</div>
		</>
	);
}
