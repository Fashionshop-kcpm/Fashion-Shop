export default function Pagination({ meta, onPage }) {
  if (!meta || meta.last_page <= 1) return null;
  const pages = Array.from({ length: meta.last_page }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
            p === meta.current_page
              ? "bg-blue-600 text-white"
              : "bg-white border hover:bg-gray-50 text-gray-600"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
