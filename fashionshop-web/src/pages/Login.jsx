import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { login } from "../api/authApi";
import { getCart } from "../api/cartApi";
import useAuthStore from "../stores/authStore";
import useCartStore from "../stores/cartStore";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const { setCount } = useCartStore();
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });
  //react-hook-form tự thu thập data thành email và password
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await login(data);
      // Backend trả về: { message, user, token }
      const { user, token } = res.data;
      setAuth(user, token);
      try {
        const cartRes = await getCart();
        setCount(cartRes.data?.length || 0);
      } catch {
        /* ignore */
      }
      toast.success("Đăng nhập thành công!");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Đăng Nhập</h1>
        <p className="text-sm text-gray-500 mb-6">
          Chào mừng bạn trở lại FashionShop
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="email@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật Khẩu
            </label>
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-medium hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
