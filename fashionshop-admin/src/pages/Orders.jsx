import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Eye, Search } from "lucide-react";
import { getOrders } from "../api/orderApi";
import { formatCurrency } from "../utils/formatCurrency";
import { ORDER_STATUS } from "../utils/constants";
import { OrderBadge } from "../components/ui/StatusBadge";
import Spinner from "../components/ui/Spinner";
import Pagination from "../components/ui/Pagination";

export default function Orders() {
  const [page, setPage]       = useState(1);
  const [status, setStatus]   = useState("");
  const [keyword, setKeyword] = useState("");
  const [search, setSearch]   = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", page, status, search],
    queryFn: () => getOrders({ page, status: status || undefined, keyword: search || undefined }),
  });

  const orders = data?.data?.data || [];
  const meta   = data?.data;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Đơn Hàng</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="flex items-center border bg-white rounded-lg px-3 gap-2">
          <Search size={15} className="text-gray-400" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setSearch(keyword); setPage(1); } }}
            placeholder="Tìm theo tên / ID..."
            className="py-2 text-sm outline-none w-44"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="border bg-white rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(ORDER_STATUS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <button onClick={() => { setSearch(keyword); setPage(1); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          Tìm
        </button>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">ID</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Khách Hàng</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Địa Chỉ</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Tổng Tiền</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Trạng Thái</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Ngày</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">#{o.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{o.fullname}</p>
                    <p className="text-xs text-gray-400">{o.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-36 truncate">{o.address}</td>
                  <td className="px-4 py-3 font-semibold text-blue-600">{formatCurrency(o.total)}</td>
                  <td className="px-4 py-3"><OrderBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(o.created_at).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/orders/${o.id}`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors inline-block">
                      <Eye size={15} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="text-center py-10 text-gray-400">Không có đơn hàng</p>}
        </div>
      )}

      <Pagination meta={meta} onPage={setPage} />
    </div>
  );
}
