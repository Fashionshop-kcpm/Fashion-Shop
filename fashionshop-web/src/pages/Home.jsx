import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Truck, RotateCcw, Headphones } from "lucide-react";
import { getProducts } from "../api/productApi";
import { addToCart } from "../api/cartApi";
import useAuthStore from "../stores/authStore";
import useCartStore from "../stores/cartStore";
import ProductCard from "../components/ui/ProductCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

const TABS = [
  { key: "featured", label: "Nổi Bật" },
  { key: "bestseller", label: "Bán Chạy" },
  { key: "sale", label: "Khuyến Mãi" },
];

const SERVICES = [
  { icon: Truck, title: "Miễn Phí Giao Hàng", desc: "Đơn từ 500.000đ" },
  { icon: Headphones, title: "Hỗ Trợ 24/7", desc: "Tư vấn mọi lúc" },
  { icon: ShieldCheck, title: "Bảo Hành Chính Hãng", desc: "Cam kết chất lượng" },
  { icon: RotateCcw, title: "Hoàn Trả Dễ Dàng", desc: "Trong vòng 7 ngày" },
];

export default function Home() {
  const [tab, setTab] = useState("featured");
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { count, setCount } = useCartStore();

  const { data: productsRes, isLoading } = useQuery({
    queryKey: ["products", tab],
    queryFn: () => getProducts({ tab, per_page: 8 }),
  });

  // Backend trả về standard Laravel paginate: { current_page, data: [...], total }
  const products = productsRes?.data?.data || [];

  const handleAddToCart = async (product) => {
    if (!token) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ");
      navigate("/login");
      return;
    }
    try {
      await addToCart({ product_id: product.id, quantity: 1, size: "M" });
      setCount(count + 1);
      toast.success("Đã thêm vào giỏ hàng!");
    } catch {
      toast.error("Không thể thêm vào giỏ");
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Thời Trang Hiện Đại<br />Phong Cách Của Bạn
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-xl">
            Khám phá bộ sưu tập thời trang nam &amp; nữ mới nhất, chất lượng cao với giá tốt nhất
          </p>
          <Link
            to="/category"
            className="bg-white text-blue-700 font-bold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors"
          >
            Khám Phá Ngay
          </Link>
        </div>
      </section>

      {/* Services */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {SERVICES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3 p-3">
              <div className="bg-blue-100 rounded-full p-2.5 shrink-0">
                <Icon size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gender categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Danh Mục Nổi Bật</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/category?gioi_tinh=1"
            className="bg-blue-600 rounded-2xl h-48 flex items-center justify-center hover:bg-blue-700 transition-colors"
          >
            <div className="text-center text-white">
              <p className="text-3xl font-bold mb-2">Thời Trang Nam</p>
              <p className="text-blue-200 text-sm">Quần Tây, Jean, Polo, Sơ Mi...</p>
            </div>
          </Link>
          <Link
            to="/category?gioi_tinh=0"
            className="bg-pink-500 rounded-2xl h-48 flex items-center justify-center hover:bg-pink-600 transition-colors"
          >
            <div className="text-center text-white">
              <p className="text-3xl font-bold mb-2">Thời Trang Nữ</p>
              <p className="text-pink-100 text-sm">Váy, Áo, Quần thời trang...</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Products tabs */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Sản Phẩm</h2>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  tab === t.key ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <p className="text-center text-gray-400 py-16">Không có sản phẩm nào</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
