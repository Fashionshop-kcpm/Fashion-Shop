import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { getProducts, getCategories } from "../api/productApi";
import { addToCart } from "../api/cartApi";
import useAuthStore from "../stores/authStore";
import useCartStore from "../stores/cartStore";
import ProductCard from "../components/ui/ProductCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

export default function Category() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { count, setCount } = useCartStore();
  const [page, setPage] = useState(1);

  const categoryId = searchParams.get("category_id") || "";
  const gioi_tinh = searchParams.get("gioi_tinh") || "";

  useEffect(() => { setPage(1); }, [categoryId, gioi_tinh]);

  const { data: productsRes, isLoading } = useQuery({
    queryKey: ["products", "category", categoryId, gioi_tinh, page],
    queryFn: () => getProducts({
      category_id: categoryId || undefined,
      gioi_tinh: gioi_tinh !== "" ? gioi_tinh : undefined,
      page,
      per_page: 12,
    }),
  });

  const { data: catsRes } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Backend: paginate => { current_page, data: [...], total, last_page }
  const products = productsRes?.data?.data || [];
  const lastPage = productsRes?.data?.last_page || 1;
  const total = productsRes?.data?.total || 0;

  // Categories: direct array
  const categories = catsRes?.data || [];

  const setFilter = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val === "") next.delete(key);
    else next.set(key, val);
    setSearchParams(next);
  };

  const handleAddToCart = async (product) => {
    if (!token) {
      toast.error("Vui lòng đăng nhập");
      navigate("/login");
      return;
    }
    try {
      await addToCart({ product_id: product.id, quantity: 1, size: "M" });
      setCount(count + 1);
      toast.success("Đã thêm vào giỏ!");
    } catch {
      toast.error("Không thể thêm vào giỏ");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="md:w-52 shrink-0">
          <div className="bg-white rounded-xl border p-4 sticky top-20">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal size={16} className="text-gray-500" />
              <span className="font-semibold text-gray-700 text-sm">Bộ Lọc</span>
            </div>

            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Giới Tính</p>
              {[
                { val: "", label: "Tất cả" },
                { val: "1", label: "Nam" },
                { val: "0", label: "Nữ" },
              ].map((g) => (
                <label key={g.val} className="flex items-center gap-2 py-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={gioi_tinh === g.val}
                    onChange={() => setFilter("gioi_tinh", g.val)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-gray-700">{g.label}</span>
                </label>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Danh Mục</p>
              <label className="flex items-center gap-2 py-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  checked={categoryId === ""}
                  onChange={() => setFilter("category_id", "")}
                  className="accent-blue-600"
                />
                <span className="text-sm text-gray-700">Tất cả</span>
              </label>
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-2 py-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={categoryId === String(c.id)}
                    onChange={() => setFilter("category_id", String(c.id))}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-gray-700">{c.ten_danh_muc}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800">
              {gioi_tinh === "1" ? "Thời Trang Nam" : gioi_tinh === "0" ? "Thời Trang Nữ" : "Tất Cả Sản Phẩm"}
            </h1>
            {total > 0 && <span className="text-sm text-gray-500">{total} sản phẩm</span>}
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">Không có sản phẩm nào</div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
                ))}
              </div>
              {lastPage > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        page === p ? "bg-blue-600 text-white" : "bg-white border hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
