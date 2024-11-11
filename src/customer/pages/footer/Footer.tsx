import React from 'react';
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-50 mt-10">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold">SHOP TANH VIP PRO</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <MapPin size={18} />
                                <p className="text-sm">123 Đường ABC, HANOI ,HANOI</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={18} />
                                <p className="text-sm">0123.456.789</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail size={18} />
                                <p className="text-sm">contact@company.com</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold">Liên kết nhanh</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-blue-500 transition">Trang chủ</a></li>
                            <li><a href="#" className="hover:text-blue-500 transition">Sản phẩm</a></li>
                            <li><a href="#" className="hover:text-blue-500 transition">Về chúng tôi</a></li>
                            <li><a href="#" className="hover:text-blue-500 transition">Liên hệ</a></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold">Dịch vụ</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-blue-500 transition">Tư vấn</a></li>
                            <li><a href="#" className="hover:text-blue-500 transition">Bảo hành</a></li>
                            <li><a href="#" className="hover:text-blue-500 transition">Hỗ trợ</a></li>
                            <li><a href="#" className="hover:text-blue-500 transition">FAQs</a></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold">Kết nối với chúng tôi</h3>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-blue-500 transition">
                                <Facebook size={24} />
                            </a>
                            <a href="#" className="hover:text-blue-500 transition">
                                <Instagram size={24} />
                            </a>
                        </div>
                        <div className="mt-4">
                            <a href="http://online.gov.vn" target="_blank" rel="noopener noreferrer">
                                <img
                                    src="https://webmedia.com.vn/images/2021/09/logo-da-dang-ky-bo-cong-thuong-mau-do.jpg"
                                    alt="Đã đăng ký Bộ Công Thương"
                                    className="max-w-[150px]"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-gray-800">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <p className="text-sm text-center">
                        © {new Date().getFullYear()} SHOP TANH VIP PRO. Tất cả quyền được bảo lưu.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;