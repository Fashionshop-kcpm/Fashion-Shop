"""
BVA Test: Đánh giá sản phẩm — POST /api/v1/products/{id}/reviews

PHP validation thực tế:
  rating  : required|integer|min:1|max:5
  comment : required|string              (KHÔNG có min:5/max:500 — khác BVA doc)

Yêu cầu: Bearer token (đăng nhập user).
"""
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"


def post_review(product_id, rating, comment, auth_headers):
    return requests.post(
        f"{BASE_URL}/products/{product_id}/reviews",
        json={"rating": rating, "comment": comment},
        headers=auth_headers,
    )


class TestHopLeTaiBien:
    """rating trong [1,5] và comment không rỗng — API trả 201 Created."""

    def test_tc01_nominal(self, first_product_id, auth_headers):
        """TC01: rating=3 (nominal), comment=252 ký tự."""
        resp = post_review(first_product_id, 3, "A" * 252, auth_headers)
        assert resp.status_code == 201

    def test_tc02_rating_min(self, first_product_id, auth_headers):
        """TC02 — B1: rating=1 (biên dưới hợp lệ, PHP min:1)."""
        resp = post_review(first_product_id, 1, "A" * 50, auth_headers)
        assert resp.status_code == 201

    def test_tc03_rating_max(self, first_product_id, auth_headers):
        """TC03 — B5: rating=5 (biên trên hợp lệ, PHP max:5)."""
        resp = post_review(first_product_id, 5, "A" * 50, auth_headers)
        assert resp.status_code == 201

    def test_tc04_rating_2_comment_6(self, first_product_id, auth_headers):
        """TC04 — B2, B7: rating=2 (min+), comment=6 ký tự."""
        resp = post_review(first_product_id, 2, "A" * 6, auth_headers)
        assert resp.status_code == 201

    def test_tc05_rating_4_comment_499(self, first_product_id, auth_headers):
        """TC05 — B4, B9: rating=4 (max-), comment=499 ký tự."""
        resp = post_review(first_product_id, 4, "A" * 499, auth_headers)
        assert resp.status_code == 201

    def test_tc06_all_at_min(self, first_product_id, auth_headers):
        """TC06: rating=1, comment=1 ký tự — tất cả tại biên dưới hợp lệ theo PHP."""
        resp = post_review(first_product_id, 1, "A", auth_headers)
        assert resp.status_code == 201


class TestKhongHopLe:
    """rating ngoài [1,5] hoặc comment rỗng — API trả 422."""

    def test_tc07_rating_zero(self, first_product_id, auth_headers):
        """TC07 — X1: rating=0 (dưới biên dưới, PHP min:1)."""
        resp = post_review(first_product_id, 0, "A" * 50, auth_headers)
        assert resp.status_code == 422

    def test_tc08_rating_negative(self, first_product_id, auth_headers):
        """TC08 — X1: rating=-1 (số âm)."""
        resp = post_review(first_product_id, -1, "A" * 50, auth_headers)
        assert resp.status_code == 422

    def test_tc09_rating_six(self, first_product_id, auth_headers):
        """TC09 — X2: rating=6 (trên biên trên, PHP max:5)."""
        resp = post_review(first_product_id, 6, "A" * 50, auth_headers)
        assert resp.status_code == 422

    def test_tc10_comment_empty(self, first_product_id, auth_headers):
        """TC10 — X3: comment rỗng (PHP required)."""
        resp = post_review(first_product_id, 3, "", auth_headers)
        assert resp.status_code == 422

    def test_tc11_all_invalid(self, first_product_id, auth_headers):
        """TC11 — X1, X3: rating=0 và comment rỗng — cả hai vi phạm."""
        resp = post_review(first_product_id, 0, "", auth_headers)
        assert resp.status_code == 422


class TestDiscrepancyPHPvsZod:
    """
    Các trường hợp BVA doc nói KHÔNG hợp lệ nhưng API thực tế CHẤP NHẬN.
    PHP chỉ validate required|string cho comment — không có min:5/max:500.
    """

    def test_comment_4chars_passes_api(self, first_product_id, auth_headers):
        """
        BVA doc: comment=4 ký tự → Không hợp lệ (vi phạm Zod min:5).
        Thực tế API: PHP chỉ required|string → 201.
        """
        resp = post_review(first_product_id, 3, "ABCD", auth_headers)
        assert resp.status_code == 201

    def test_comment_501chars_passes_api(self, first_product_id, auth_headers):
        """
        BVA doc: comment=501 ký tự → Không hợp lệ (vi phạm Zod max:500).
        Thực tế API: PHP không có max → 201.
        """
        resp = post_review(first_product_id, 3, "A" * 501, auth_headers)
        assert resp.status_code == 201
