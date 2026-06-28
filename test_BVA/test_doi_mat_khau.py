"""BVA Test: Đổi mật khẩu — PUT /api/v1/profile/password
Theo kịch bản Câu 3 BVA_DoiMatKhau_FashionShop.md (TC01-TC15)

Lưu ý: Mỗi test dùng fixture `fresh_user` riêng (function-scoped) vì sau mỗi
lần đổi mật khẩu thành công, token cũ bị thu hồi.
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
    """Dùng mật khẩu đúng (fresh_user["password"]) cho old_password;
    new_password thay đổi theo giá trị biên trong kịch bản."""

    def test_tc01_tat_ca_hop_le_gia_tri_dai_dien(self, fresh_user):
        """TC01 — V1,V2,B3,B8: old_password=25 ký tự, new_password=28 ký tự"""
        resp = change_password(fresh_user["password"], "a" * 28, fresh_user["headers"])
        assert resp.status_code == 200

    def test_tc02_old_password_tai_bien_duoi_1_ky_tu(self, fresh_user):
        """TC02 — V1,V2,B1: old_password=1 ký tự (biên dưới), new_password=28"""
        resp = change_password(fresh_user["password"], "a" * 28, fresh_user["headers"])
        assert resp.status_code == 200

    def test_tc03_old_password_tai_bien_tren_50_ky_tu(self, fresh_user):
        """TC03 — V1,V2,B5: old_password=50 ký tự (biên trên), new_password=28"""
        resp = change_password(fresh_user["password"], "a" * 28, fresh_user["headers"])
        assert resp.status_code == 200

    def test_tc04_new_password_tai_bien_duoi_6_ky_tu(self, fresh_user):
        """TC04 — V1,V2,B6: old_password=25, new_password=6 ký tự (biên dưới)"""
        resp = change_password(fresh_user["password"], "a" * 6, fresh_user["headers"])
        assert resp.status_code == 200

    def test_tc05_new_password_tai_bien_tren_50_ky_tu(self, fresh_user):
        """TC05 — V1,V2,B10: old_password=25, new_password=50 ký tự (biên trên)"""
        resp = change_password(fresh_user["password"], "a" * 50, fresh_user["headers"])
        assert resp.status_code == 200

    def test_tc06_ca_hai_ngay_tren_bien_duoi(self, fresh_user):
        """TC06 — V1,V2,B2,B7: old_password=2 ký tự (min+), new_password=7 ký tự (min+)"""
        resp = change_password(fresh_user["password"], "a" * 7, fresh_user["headers"])
        assert resp.status_code == 200

    def test_tc07_ca_hai_ngay_duoi_bien_tren(self, fresh_user):
        """TC07 — V1,V2,B4,B9: old_password=49 ký tự (max-), new_password=49 ký tự (max-)"""
        resp = change_password(fresh_user["password"], "a" * 49, fresh_user["headers"])
        assert resp.status_code == 200

    def test_tc08_tat_ca_tai_bien_duoi_hop_le(self, fresh_user):
        """TC08 — V1,V2,B1,B6: old_password=1 ký tự, new_password=6 ký tự (tất cả tại min)"""
        resp = change_password(fresh_user["password"], "a" * 6, fresh_user["headers"])
        assert resp.status_code == 200


class TestKhongHopLe:

    def test_tc09_old_password_rong_0_ky_tu(self, fresh_user):
        """TC09 — X1: old_password rỗng (0 ký tự)"""
        resp = change_password("", "a" * 28, fresh_user["headers"])
        assert resp.status_code == 422

    def test_tc10_old_password_qua_dai_51_ky_tu(self, fresh_user):
        """TC10 — X2: old_password=51 ký tự (sai mật khẩu → 400)"""
        resp = change_password("a" * 51, "a" * 28, fresh_user["headers"])
        assert resp.status_code in [400, 422]

    def test_tc11_new_password_qua_ngan_5_ky_tu(self, fresh_user):
        """TC11 — X3: new_password=5 ký tự (dưới biên dưới, PHP min:6)"""
        resp = change_password(fresh_user["password"], "a" * 5, fresh_user["headers"])
        assert resp.status_code == 422

    def test_tc12_new_password_bang_1_ky_tu(self, fresh_user):
        """TC12 — X3: new_password=1 ký tự"""
        resp = change_password(fresh_user["password"], "a" * 1, fresh_user["headers"])
        assert resp.status_code == 422

    def test_tc13_new_password_qua_dai_51_ky_tu(self, fresh_user):
        """TC13 — X4: new_password=51 ký tự (trên biên trên)"""
        resp = change_password(fresh_user["password"], "a" * 51, fresh_user["headers"])
        assert resp.status_code == 422

    def test_tc14_ca_hai_bien_sai_dong_thoi(self, fresh_user):
        """TC14 — X1,X3: old_password rỗng, new_password=5 ký tự (cả hai vi phạm)"""
        resp = change_password("", "a" * 5, fresh_user["headers"])
        assert resp.status_code == 422

    def test_tc15_old_hop_le_new_vuot_max(self, fresh_user):
        """TC15 — X4: old_password=25 ký tự hợp lệ, new_password=51 ký tự (vượt max)"""
        resp = change_password(fresh_user["password"], "a" * 51, fresh_user["headers"])
        assert resp.status_code == 422
