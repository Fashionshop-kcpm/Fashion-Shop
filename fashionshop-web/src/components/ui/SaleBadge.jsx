export default function SaleBadge({ price, originalPrice }) {
  if (!originalPrice || originalPrice <= price) return null;
  const pct = Math.round(((originalPrice - price) / originalPrice) * 100);
  return (
    <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
      -{pct}%
    </span>
  );
}
