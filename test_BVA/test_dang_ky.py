"""BVA Test: Đăng ký tài khoản — POST /api/v1/register
Theo kịch bản Câu 3 BVA_DangKy_FashionShop.md (TC01-TC15)
"""
import uuid
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"


def unique_email():
    return f"dk_{uuid.uuid4().hex[:8]}@test.com"


def phone_str(n):
    return ("1234567890" * 3)[:n]


def register(fullname_chars, phone_digits, password_chars):
    pw = "a" * password_chars
    return requests.post(f"{BASE_URL}/register", json={
        "fullname": "A" * fullname_chars,
        "email": unique_email(),
        "phone": phone_str(phone_digits),
        "gender": "Nam",
        "password": pw,
        "password_confirmation": pw,
    })


class TestHopLeTaiBien:

    def test_tc01_tat_ca_hop_le_gia_tri_dai_dien(self):
        """TC01 — V1,V2,V3,B3,B7,B11: fullname=128, phone=10, password=28"""
        assert register(128, 10, 28).status_code == 201

    def test_tc02_fullname_tai_bien_duoi_min_2(self):
        """TC02 — V1,V2,V3,B1: fullname=2 (biên dưới)"""
        assert register(2, 10, 28).status_code == 201

    def test_tc03_fullname_tai_bien_tren_max_255(self):
        """TC03 — V1,V2,V3,B5: fullname=255 (biên trên)"""
        assert register(255, 10, 28).status_code == 201

    def test_tc04_phone_tai_bien_duoi_9_chu_so(self):
        """TC04 — V1,V2,V3,B6: phone=9 chữ số (biên dưới)"""
        assert register(128, 9, 28).status_code == 201

    def test_tc05_phone_tai_bien_tren_11_chu_so(self):
        """TC05 — V1,V2,V3,B8: phone=11 chữ số (biên trên)"""
        assert register(128, 11, 28).status_code == 201

    def test_tc06_password_tai_bien_duoi_min_6(self):
        """TC06 — V1,V2,V3,B9: password=6 ký tự (biên dưới)"""
        assert register(128, 10, 6).status_code == 201

    def test_tc07_password_tai_bien_tren_max_50(self):
        """TC07 — V1,V2,V3,B13: password=50 ký tự (biên trên)"""
        assert register(128, 10, 50).status_code == 201

    def test_tc08_tat_ca_tai_bien_duoi_hop_le(self):
        """TC08 — V1,V2,V3,B1,B6,B9: fullname=2, phone=9, password=6 (tất cả tại min)"""
        assert register(2, 9, 6).status_code == 201


class TestKhongHopLe:

    def test_tc09_fullname_qua_ngan_1_ky_tu(self):
        """TC09 — X1: fullname=1 ký tự"""
        assert register(1, 10, 28).status_code == 422

    def test_tc10_fullname_qua_dai_256_ky_tu(self):
        """TC10 — X2: fullname=256 ký tự"""
        assert register(256, 10, 28).status_code == 422

    def test_tc11_phone_thieu_chu_so_8(self):
        """TC11 — X3: phone=8 chữ số"""
        assert register(128, 8, 28).status_code == 422

    def test_tc12_phone_du_chu_so_12(self):
        """TC12 — X4: phone=12 chữ số"""
        assert register(128, 12, 28).status_code == 422

    def test_tc13_password_qua_ngan_5_ky_tu(self):
        """TC13 — X5: password=5 ký tự"""
        assert register(128, 10, 5).status_code == 422

    def test_tc14_password_qua_dai_51_ky_tu(self):
        """TC14 — X6: password=51 ký tự"""
        assert register(128, 10, 51).status_code == 422

    def test_tc15_nhieu_bien_sai_dong_thoi(self):
        """TC15 — X1,X3,X5: fullname=1, phone=8, password=5 (tất cả vi phạm)"""
        assert register(1, 8, 5).status_code == 422
