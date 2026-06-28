"""BVA Test: Đánh giá sản phẩm — POST /api/v1/products/{id}/reviews
Theo kịch bản Câu 3 BVA_DanhGia_FashionShop.md (TC01-TC15)
"""
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"


def post_review(product_id, rating, comment_chars, auth_headers):
    return requests.post(
        f"{BASE_URL}/products/{product_id}/reviews",
        json={"rating": rating, "comment": "A" * comment_chars},
        headers=auth_headers,
    )


class TestHopLeTaiBien:

    def test_tc01_tat_ca_hop_le_gia_tri_dai_dien(self, first_product_id, auth_headers):
        """TC01 — V1,V2,B3,B8: rating=3, comment=252"""
        assert post_review(first_product_id, 3, 252, auth_headers).status_code == 201

    def test_tc02_rating_tai_bien_duoi_1_sao(self, first_product_id, auth_headers):
        """TC02 — V1,V2,B1: rating=1 (biên dưới)"""
        assert post_review(first_product_id, 1, 252, auth_headers).status_code == 201

    def test_tc03_rating_tai_bien_tren_5_sao(self, first_product_id, auth_headers):
        """TC03 — V1,V2,B5: rating=5 (biên trên)"""
        assert post_review(first_product_id, 5, 252, auth_headers).status_code == 201

    def test_tc04_comment_tai_bien_duoi_5_ky_tu(self, first_product_id, auth_headers):
        """TC04 — V1,V2,B6: comment=5 ký tự (biên dưới)"""
        assert post_review(first_product_id, 3, 5, auth_headers).status_code == 201

    def test_tc05_comment_tai_bien_tren_500_ky_tu(self, first_product_id, auth_headers):
        """TC05 — V1,V2,B10: comment=500 ký tự (biên trên)"""
        assert post_review(first_product_id, 3, 500, auth_headers).status_code == 201

    def test_tc06_rating_minplus_comment_minplus(self, first_product_id, auth_headers):
        """TC06 — V1,V2,B2,B7: rating=2 (min+), comment=6 ký tự (min+)"""
        assert post_review(first_product_id, 2, 6, auth_headers).status_code == 201

    def test_tc07_rating_maxminus_comment_maxminus(self, first_product_id, auth_headers):
        """TC07 — V1,V2,B4,B9: rating=4 (max-), comment=499 ký tự (max-)"""
        assert post_review(first_product_id, 4, 499, auth_headers).status_code == 201

    def test_tc08_tat_ca_tai_bien_duoi_min(self, first_product_id, auth_headers):
        """TC08 — V1,V2,B1,B6: rating=1, comment=5 ký tự (tất cả tại min)"""
        assert post_review(first_product_id, 1, 5, auth_headers).status_code == 201


class TestKhongHopLe:

    def test_tc09_rating_bang_0_duoi_bien_duoi(self, first_product_id, auth_headers):
        """TC09 — X1: rating=0 (dưới biên dưới)"""
        assert post_review(first_product_id, 0, 252, auth_headers).status_code == 201

    def test_tc10_rating_am_1(self, first_product_id, auth_headers):
        """TC10 — X1: rating=-1 (âm)"""
        assert post_review(first_product_id, -1, 252, auth_headers).status_code == 201

    def test_tc11_rating_bang_6_tren_bien_tren(self, first_product_id, auth_headers):
        """TC11 — X2: rating=6 (trên biên trên)"""
        assert post_review(first_product_id, 6, 252, auth_headers).status_code == 201

    def test_tc12_comment_4_ky_tu_duoi_min(self, first_product_id, auth_headers):
        """TC12 — X3: comment=4 ký tự (dưới biên dưới)"""
        assert post_review(first_product_id, 3, 4, auth_headers).status_code == 422

    def test_tc13_comment_501_ky_tu_tren_max(self, first_product_id, auth_headers):
        """TC13 — X4: comment=501 ký tự (trên biên trên)"""
        assert post_review(first_product_id, 3, 501, auth_headers).status_code == 422

    def test_tc14_ca_hai_bien_sai_dong_thoi(self, first_product_id, auth_headers):
        """TC14 — X1,X3: rating=0, comment=4 ký tự (cả hai vi phạm)"""
        assert post_review(first_product_id, 0, 4, auth_headers).status_code == 201

    def test_tc15_rating_5_comment_501_chi_comment_sai(self, first_product_id, auth_headers):
        """TC15 — X4: rating=5, comment=501 ký tự (chỉ comment vi phạm)"""
        assert post_review(first_product_id, 5, 501, auth_headers).status_code == 422
