import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, User, Menu, X, LogOut, ChevronDown } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import useCartStore from "../../stores/cartStore";
import { logout as logoutApi } from "../../api/authApi";
import toast from "react-hot-toast";

const NAV_LINKS = [
  { label: "Trang Chủ", to: "/" },
  { label: "Nam", to: "/category?gioi_tinh=1" },
  { label: "Nữ", to: "/category?gioi_tinh=0" },
  { label: "Liên Hệ", to: "/contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();
  const count = useCartStore((s) => s.count);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchQ("");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch { /* ignore */ }
    logout();
    setUserMenuOpen(false);
    navigate("/");
    toast.success("Đã đăng xuất");
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-blue-600 shrink-0">
            FashionShop
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center bg-gray-100 rounded-full px-3 py-1.5 gap-2 w-56">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Tìm sản phẩm..."
              className="bg-transparent text-sm w-full outline-none"
            />
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link to={token ? "/cart" : "/login"} className="relative p-1">
              <ShoppingCart size={22} className="text-gray-700 hover:text-blue-600 transition-colors" />
              {token && count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>

            {/* Auth */}
            {token ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600 font-medium"
                >
                  <User size={18} />
                  <span className="hidden md:block max-w-24 truncate">{user?.fullname?.split(" ").pop()}</span>
                  <ChevronDown size={14} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border py-1 z-50">
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                      <User size={14} /> Hồ Sơ
                    </Link>
                    <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                      <ShoppingCart size={14} /> Đơn Hàng
                    </Link>
                    <hr className="my-1" />
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-50 w-full">
                      <LogOut size={14} /> Đăng Xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium text-blue-600 hover:underline hidden md:block">
                Đăng Nhập
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button className="md:hidden p-1" onClick={() => setMenuOpen((o) => !o)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t py-3 space-y-2">
            <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-full px-3 py-1.5 gap-2 mx-1 mb-3">
              <Search size={15} className="text-gray-400" />
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Tìm sản phẩm..."
                className="bg-transparent text-sm w-full outline-none"
              />
            </form>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className="block px-2 py-1.5 text-sm text-gray-700 hover:text-blue-600 font-medium"
              >
                {l.label}
              </Link>
            ))}
            {!token && (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-2 py-1.5 text-sm text-blue-600 font-medium">
                Đăng Nhập / Đăng Ký
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
