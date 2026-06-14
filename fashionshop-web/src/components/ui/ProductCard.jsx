import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";
import SaleBadge from "./SaleBadge";
import StarRating from "./StarRating";

const IMG_BASE = "http://127.0.0.1:8000/storage/";

export default function ProductCard({ product, onAddToCart }) {
  const imgSrc = product.hinh_anh
    ? `${IMG_BASE}${product.hinh_anh}`
    : "https://placehold.co/300x380?text=No+Image";

  const reviews = product.reviews || [];
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
      <Link to={`/products/${product.id}`} className="block relative overflow-hidden">
        <img
          src={imgSrc}
          alt={product.ten_sp}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <SaleBadge price={product.gia} originalPrice={product.gia_cu} />
        </div>
      </Link>

      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
          <Link to={`/products/${product.id}`} className="hover:text-blue-600">
            {product.ten_sp}
          </Link>
        </h3>

        {avgRating > 0 && (
          <div className="mb-1">
            <StarRating rating={avgRating} size={12} />
          </div>
        )}

        <div className="flex items-center gap-2 mb-2">
          <span className="text-blue-600 font-bold text-sm">{formatCurrency(product.gia)}</span>
          {product.gia_cu > product.gia && (
            <span className="text-gray-400 line-through text-xs">
              {formatCurrency(product.gia_cu)}
            </span>
          )}
        </div>

        <button
          onClick={() => onAddToCart?.(product)}
          className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 rounded-lg transition-colors"
        >
          <ShoppingCart size={14} />
          Thêm Giỏ
        </button>
      </div>
    </div>
  );
}
