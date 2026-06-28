"""BVA Test: Gửi liên hệ — POST /api/v1/contacts
Theo kịch bản Câu 3 BVA_LienHe_FashionShop.md (TC01-TC15)
"""
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"


def post_contact(fullname_chars, message_chars):
    return requests.post(f"{BASE_URL}/contacts", json={
        "fullname": "A" * fullname_chars,
        "email": "test@example.com",
        "message": "A" * message_chars,
    })


class TestHopLeTaiBien:

    def test_tc01_tat_ca_hop_le_gia_tri_dai_dien(self):
        """TC01 — V1, V2, B3, B8: fullname=128, message=505"""
        assert post_contact(128, 505).status_code == 201

    def test_tc02_fullname_tai_bien_duoi_min_2(self):
        """TC02 — V1, V2, B1: fullname=2 (biên dưới)"""
        assert post_contact(2, 505).status_code == 201

    def test_tc03_fullname_tai_bien_tren_max_255(self):
        """TC03 — V1, V2, B5: fullname=255 (biên trên)"""
        assert post_contact(255, 505).status_code == 201

    def test_tc04_message_tai_bien_duoi_min_10(self):
        """TC04 — V1, V2, B6: message=10 (biên dưới)"""
        assert post_contact(128, 10).status_code == 201

    def test_tc05_message_tai_bien_tren_max_1000(self):
        """TC05 — V1, V2, B10: message=1000 (biên trên)"""
        assert post_contact(128, 1000).status_code == 201

    def test_tc06_fullname_minplus_message_minplus(self):
        """TC06 — V1, V2, B2, B7: fullname=3 (min+), message=11 (min+)"""
        assert post_contact(3, 11).status_code == 201

    def test_tc07_fullname_maxminus_message_maxminus(self):
        """TC07 — V1, V2, B4, B9: fullname=254 (max-), message=999 (max-)"""
        assert post_contact(254, 999).status_code == 201

    def test_tc08_tat_ca_tai_bien_duoi_min(self):
        """TC08 — V1, V2, B1, B6: fullname=2, message=10 (tất cả tại min)"""
        assert post_contact(2, 10).status_code == 201


class TestKhongHopLe:

    def test_tc09_fullname_qua_ngan_1_ky_tu(self):
        """TC09 — X1: fullname=1 ký tự (dưới biên dưới)"""
        assert post_contact(1, 505).status_code == 422

    def test_tc10_fullname_qua_dai_256_ky_tu(self):
        """TC10 — X2: fullname=256 ký tự (trên biên trên)"""
        assert post_contact(256, 505).status_code == 422

    def test_tc11_message_qua_ngan_9_ky_tu(self):
        """TC11 — X3: message=9 ký tự (dưới biên dưới)"""
        assert post_contact(128, 9).status_code == 422

    def test_tc12_message_rong_0_ky_tu(self):
        """TC12 — X3: message=0 ký tự (rỗng)"""
        assert post_contact(128, 0).status_code == 422

    def test_tc13_message_qua_dai_1001_ky_tu(self):
        """TC13 — X4: message=1001 ký tự (trên biên trên)"""
        assert post_contact(128, 1001).status_code == 422

    def test_tc14_ca_hai_bien_sai(self):
        """TC14 — X1, X3: fullname=1, message=9 (cả hai vi phạm)"""
        assert post_contact(1, 9).status_code == 422

    def test_tc15_fullname_hop_le_toi_da_message_sai(self):
        """TC15 — X4: fullname=255, message=1001 (chỉ message vi phạm)"""
        assert post_contact(255, 1001).status_code == 422
