import { Button } from "@/components/ui/button";

// Temporary setup sanity-check — replaced once the real homepage is built.
export default function Home() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-8 text-foreground">
			<h1 className="font-heading text-6xl font-bold tracking-tight">
				Fleazo
			</h1>
			<p className="max-w-sm text-center text-sm text-muted-foreground">
				Setup check — Space Grotesk cho tiêu đề, Hanken Grotesk cho nội
				dung, bảng màu Moss Reuse.
			</p>
			<div className="flex items-center gap-3">
				<span className="rounded-full bg-fz-accent px-4 py-2 text-sm font-bold text-white">
					299.000đ
				</span>
				<Button variant="outline">Lưu tin</Button>
				<Button>Liên hệ</Button>
			</div>
		</div>
	);
}
