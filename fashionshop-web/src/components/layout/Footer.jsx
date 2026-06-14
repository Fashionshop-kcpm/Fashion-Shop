import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <p className="text-white font-bold text-lg mb-3">FashionShop</p>
          <p className="text-sm leading-relaxed">
            Thời trang nam &amp; nữ chất lượng cao, phong cách hiện đại.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Liên Kết</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Trang Chủ</Link></li>
            <li><Link to="/category?gender=1" className="hover:text-white transition-colors">Thời Trang Nam</Link></li>
            <li><Link to="/category?gender=0" className="hover:text-white transition-colors">Thời Trang Nữ</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Liên Hệ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Chính Sách</h4>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer transition-colors">Miễn Phí Vận Chuyển đơn từ 500k</li>
            <li className="hover:text-white cursor-pointer transition-colors">Đổi Trả Trong 7 Ngày</li>
            <li className="hover:text-white cursor-pointer transition-colors">Hỗ Trợ 24/7</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-4 text-xs">
        © {new Date().getFullYear()} FashionShop. All rights reserved.
      </div>
    </footer>
  );
}
