import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { getUsers } from "../api/userApi";
import Spinner from "../components/ui/Spinner";
import Pagination from "../components/ui/Pagination";

export default function Users() {
  const [page, setPage]       = useState(1);
  const [keyword, setKeyword] = useState("");
  const [search, setSearch]   = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, search],
    queryFn: () => getUsers({ page, keyword: search || undefined }),
  });

  const users = data?.data?.data || [];
  const meta  = data?.data;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Người Dùng</h1>

      <div className="flex gap-2 mb-5">
        <div className="flex items-center border bg-white rounded-lg px-3 gap-2">
          <Search size={15} className="text-gray-400" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setSearch(keyword); setPage(1); } }}
            placeholder="Tìm theo tên / email..."
            className="py-2 text-sm outline-none w-52"
          />
        </div>
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
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Họ Tên</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">SĐT</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Giới Tính</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Ngày Đăng Ký</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs">#{u.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{u.fullname}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3 text-gray-500">{u.phone}</td>
                  <td className="px-4 py-3 text-gray-500">{u.gender}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(u.created_at).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="text-center py-10 text-gray-400">Không có người dùng</p>}
        </div>
      )}

      <Pagination meta={meta} onPage={setPage} />
    </div>
  );
}
