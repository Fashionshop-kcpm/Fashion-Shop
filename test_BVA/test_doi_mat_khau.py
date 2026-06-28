"""
BVA Test: Đổi mật khẩu — PUT /api/v1/profile/password

PHP validation thực tế:
  old_password : required          (KHÔNG có min:1/max:50 — chỉ bắt buộc nhập;
                                    sau đó PHP kiểm tra hash với DB → sai thì 400)
  new_password : required|min:6|confirmed  (KHÔNG có max:50 — khác BVA doc)

Yêu cầu: Bearer token.
Lưu ý: Sau khi đổi mật khẩu thành công, token hiện tại BỊ HỦY.
        Mỗi test hợp lệ dùng fixture 'fresh_user' để tạo user mới.
"""
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"


def change_password(old_pw, new_pw, auth_headers):
    return requests.put(
        f"{BASE_URL}/profile/password",
        json={
            "old_password": old_pw,
            "new_password": new_pw,
            "new_password_confirmation": new_pw,
        },
        headers=auth_headers,
    )


class TestHopLeTaiBien:
    """new_password hợp lệ (>=6 ký tự) + old_password đúng — API trả 200."""

    def test_tc01_nominal(self, fresh_user):
        """TC01: old=Password123 (đúng), new=28 ký tự."""
        resp = change_password(fresh_user["password"], "a" * 28, fresh_user["headers"])
        assert resp.status_code == 200

    def test_tc02_new_password_min(self, fresh_user):
        """TC02 — B6: new_password=6 ký tự (biên dưới hợp lệ, PHP min:6)."""
        resp = change_password(fresh_user["password"], "a" * 6, fresh_user["headers"])
        assert resp.status_code == 200

    def test_tc03_new_password_50chars(self, fresh_user):
        """TC03 — B10: new_password=50 ký tự (biên trên theo BVA) — PHP chấp nhận."""
        resp = change_password(fresh_user["password"], "a" * 50, fresh_user["headers"])
        assert resp.status_code == 200

    def test_tc04_minplus_new(self, fresh_user):
        """TC04 — B7: new_password=7 ký tự (biên dưới + 1)."""
        resp = change_password(fresh_user["password"], "a" * 7, fresh_user["headers"])
        assert resp.status_code == 200


class TestKhongHopLe:
    """new_password quá ngắn, old_password sai/rỗng — API trả 422 hoặc 400."""

    def test_tc05_new_password_5chars(self, fresh_user):
        """TC05 — X3: new_password=5 ký tự (dưới biên dưới, PHP min:6) — 422."""
        resp = change_password(fresh_user["password"], "a" * 5, fresh_user["headers"])
        assert resp.status_code == 422

    def test_tc06_new_password_1char(self, fresh_user):
        """TC06 — X3: new_password=1 ký tự — 422."""
        resp = change_password(fresh_user["password"], "a", fresh_user["headers"])
        assert resp.status_code == 422

    def test_tc07_wrong_old_password(self, fresh_user):
        """TC07: old_password sai — PHP kiểm tra hash → 400."""
        resp = change_password("SaiMatKhau!", "newpass123", fresh_user["headers"])
        assert resp.status_code == 400

    def test_tc08_empty_old_password(self, fresh_user):
        """TC08 — X1: old_password rỗng (PHP required) — 422."""
        resp = change_password("", "newpass123", fresh_user["headers"])
        assert resp.status_code == 422

    def test_tc09_old_and_new_both_invalid(self, fresh_user):
        """TC09 — X1, X3: old rỗng + new=5 ký tự — 422."""
        resp = change_password("", "a" * 5, fresh_user["headers"])
        assert resp.status_code == 422


class TestDiscrepancyPHPvsZod:
    """
    Trường hợp BVA doc nói KHÔNG hợp lệ nhưng API thực tế CHẤP NHẬN.
    PHP không có max:50 cho new_password.
    """

    def test_new_password_51chars_passes_api(self, fresh_user):
        """
        BVA doc: new_password=51 ký tự → Không hợp lệ (vi phạm Zod max:50).
        Thực tế API: PHP chỉ có min:6, không có max → 200.
        """
        resp = change_password(fresh_user["password"], "a" * 51, fresh_user["headers"])
        assert resp.status_code == 200
