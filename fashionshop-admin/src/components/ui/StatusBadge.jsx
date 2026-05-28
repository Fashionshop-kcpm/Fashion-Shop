import { ORDER_STATUS, CONTACT_STATUS } from "../../utils/constants";

export function OrderBadge({ status }) {
  const s = ORDER_STATUS[status] || { label: status, color: "bg-gray-100 text-gray-600" };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>;
}

export function ContactBadge({ status }) {
  const s = CONTACT_STATUS[status] || { label: status, color: "bg-gray-100 text-gray-600" };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>;
}
