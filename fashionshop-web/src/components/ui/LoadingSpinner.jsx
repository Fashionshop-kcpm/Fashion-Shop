export default function LoadingSpinner({ className = "" }) {
  return (
    <div className={`flex justify-center items-center py-16 ${className}`}>
      <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}
