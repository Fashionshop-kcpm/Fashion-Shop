import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getContacts, updateContactStatus } from "../api/contactApi";
import { CONTACT_STATUS } from "../utils/constants";
import { ContactBadge } from "../components/ui/StatusBadge";
import Spinner from "../components/ui/Spinner";
import Pagination from "../components/ui/Pagination";

export default function Contacts() {
  const qc        = useQueryClient();
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-contacts", page],
    queryFn: () => getContacts({ page }),
  });

  const contacts = data?.data?.data || [];
  const meta     = data?.data;

  const handleStatus = async (id, status) => {
    try {
      await updateContactStatus(id, status);
      toast.success("Đã cập nhật trạng thái");
      qc.invalidateQueries({ queryKey: ["admin-contacts"] });
    } catch {
      toast.error("Cập nhật thất bại");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Liên Hệ</h1>

      {isLoading ? <Spinner /> : (
        <div className="space-y-3">
          {contacts.map((c) => (
            <div key={c.id} className="bg-white border rounded-xl overflow-hidden">
              <div
                className="flex items-center gap-4 px-4 py-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-gray-800 text-sm">{c.name}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-500">{c.email}</span>
                    {c.phone && <><span className="text-gray-300">•</span><span className="text-sm text-gray-500">{c.phone}</span></>}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">{c.subject}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <ContactBadge status={c.status} />
                  <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString("vi-VN")}</span>
                </div>
              </div>

              {expanded === c.id && (
                <div className="px-4 pb-4 border-t pt-3">
                  <p className="text-sm text-gray-700 mb-4 whitespace-pre-line">{c.message}</p>
                  <div className="flex gap-2">
                    {Object.entries(CONTACT_STATUS).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => handleStatus(c.id, key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                          c.status === key
                            ? "border-blue-500 text-blue-600 bg-blue-50"
                            : "border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {val.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {contacts.length === 0 && <p className="text-center py-10 text-gray-400">Không có liên hệ nào</p>}
        </div>
      )}

      <Pagination meta={meta} onPage={setPage} />
    </div>
  );
}
