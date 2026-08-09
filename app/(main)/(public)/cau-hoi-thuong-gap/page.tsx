import type { Metadata } from 'next';
import { HelpCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { FaqList } from './_components/faq-list';

export const metadata: Metadata = {
	title: 'Câu hỏi thường gặp — Fleazo',
	description:
		'Giải đáp nhanh về đăng tin, kiểm duyệt, giao dịch và gói thành viên trên Fleazo.',
};

// Every answer here maps to real, current behaviour — huong-dan-dang-tin's
// STEPS/precondition callout and goi-thanh-vien's pitch — not invented
// policy. Keep both in sync if either page's actual behaviour changes.
const FAQ_ITEMS = [
	{
		question: 'Đăng tin trên Fleazo có mất phí không?',
		answer:
			'Đăng tin cơ bản hoàn toàn miễn phí. Muốn có nhiều tin đang hoạt động cùng lúc hơn, tin hiển thị lâu hơn hoặc nhiều ảnh hơn mỗi tin thì có gói thành viên trả phí — xem chi tiết ở trang Gói thành viên.',
	},
	{
		question: 'Vì sao tin của mình chưa hiển thị công khai?',
		answer:
			'Tin mới đăng ở trạng thái "Chờ duyệt" cho tới khi quản trị viên xem xét. Nếu bị từ chối, lý do cụ thể nằm trong "Quản lý tin" — sửa nội dung và đăng một tin mới, vì tin bị từ chối không gửi duyệt lại được.',
	},
	{
		question: 'Cần điều kiện gì để tin được duyệt công khai?',
		answer:
			'Hồ sơ cần có số điện thoại, khu vực và mật khẩu đã thiết lập đầy đủ. Nếu chỉ lưu nháp để hoàn thiện sau thì chưa cần ngay.',
	},
	{
		question: 'Fleazo có giữ tiền hoặc đứng ra thu hộ khi giao dịch không?',
		answer:
			'Không. Fleazo chỉ giúp người mua và người bán kết nối qua tin nhắn trực tiếp — việc thanh toán, kiểm tra hàng và giao nhận do hai bên tự thoả thuận, không qua trung gian.',
	},
	{
		question: 'Ai có thể dùng Fleazo?',
		answer:
			'Fleazo dành cho sinh viên mua bán đồ cũ quanh khu vực trường mình — chỉ cần tạo tài khoản là tìm và đăng tin được ngay.',
	},
	{
		question: 'Trợ lý AI (chatbot) trên Fleazo giúp được gì?',
		answer:
			'Biểu tượng chat ở góc màn hình có thể giúp tìm sản phẩm theo giá, khu vực, tình trạng, hướng dẫn cách đăng tin và giải thích về các gói thành viên.',
	},
];

export default function CauHoiThuongGapPage() {
	return (
		<div className="mx-auto max-w-3xl px-4 pt-24 pb-20 sm:px-6 sm:pt-28 sm:pb-24">
			<PageHeader
				icon={HelpCircle}
				kicker="Hỏi & đáp"
				title="Câu hỏi thường gặp"
				description="Giải đáp nhanh những thắc mắc phổ biến nhất về đăng tin, kiểm duyệt và giao dịch trên Fleazo."
			/>

			<FaqList items={FAQ_ITEMS} />
		</div>
	);
}
