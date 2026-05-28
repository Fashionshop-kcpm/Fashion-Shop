import { useQuery } from "@tanstack/react-query";
import { TrendingUp, ShoppingBag, Users, Package } from "lucide-react";
import { getDashboard } from "../api/dashboardApi";
import { formatCurrency } from "../utils/formatCurrency";
import { OrderBadge } from "../components/ui/StatusBadge";
import Spinner from "../components/ui/Spinner";

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getDashboard,
  });

  const d = data?.data;

  if (isLoading) return <Spinner />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Doanh Thu"     value={formatCurrency(d?.total_revenue)}  icon={TrendingUp}  color="bg-green-500" />
        <StatCard label="Đơn Hàng"      value={d?.total_orders}                   icon={ShoppingBag} color="bg-blue-500"  />
        <StatCard label="Người Dùng"     value={d?.total_users}                    icon={Users}       color="bg-purple-500"/>
        <StatCard label="Sản Phẩm"       value={d?.total_products}                 icon={Package}     color="bg-orange-500"/>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border">
        <div className="px-5 py-4 border-b font-semibold text-gray-700">Đơn Hàng Gần Đây</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">ID</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Khách Hàng</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Tổng Tiền</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Trạng Thái</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Ngày</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(d?.recent_orders || []).map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">#{o.id}</td>
                  <td className="px-5 py-3 text-gray-600">{o.user?.fullname || o.fullname}</td>
                  <td className="px-5 py-3 font-semibold text-blue-600">{formatCurrency(o.total)}</td>
                  <td className="px-5 py-3"><OrderBadge status={o.status} /></td>
                  <td className="px-5 py-3 text-gray-400">
                    {new Date(o.created_at).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
