import pytest
from validate_danh_gia import validate_danh_gia


class TestHopLeTaiBien:

    def test_tc01_nominal(self):
        """TC01: Giá trị đại diện — hợp lệ."""
        assert validate_danh_gia(3, 252) is True

    def test_tc02_rating_min(self):
        """TC02 — B1: rating = 1 sao (biên dưới hợp lệ)."""
        assert validate_danh_gia(1, 252) is True

    def test_tc03_rating_max(self):
        """TC03 — B5: rating = 5 sao (biên trên hợp lệ)."""
        assert validate_danh_gia(5, 252) is True

    def test_tc04_comment_min(self):
        """TC04 — B6: comment = 5 ký tự (biên dưới hợp lệ)."""
        assert validate_danh_gia(3, 5) is True

    def test_tc05_comment_max(self):
        """TC05 — B10: comment = 500 ký tự (biên trên hợp lệ)."""
        assert validate_danh_gia(3, 500) is True

    def test_tc06_ca_hai_bien_min(self):
        """TC06: Cả hai biến tại min hợp lệ."""
        assert validate_danh_gia(1, 5) is True

    def test_tc07_ca_hai_bien_max(self):
        """TC07: Cả hai biến tại max hợp lệ."""
        assert validate_danh_gia(5, 500) is True

    def test_tc08_rating_minplus_comment_minplus(self):
        """TC08 — B2, B7: rating = 2, comment = 6 (ngay trên biên dưới)."""
        assert validate_danh_gia(2, 6) is True


class TestKhongHopLe:

    def test_tc09_rating_bang_khong(self):
        """TC09 — X1: rating = 0 (dưới biên dưới)."""
        assert validate_danh_gia(0, 252) is False

    def test_tc10_rating_am(self):
        """TC10 — X1: rating = -1 (số âm)."""
        assert validate_danh_gia(-1, 252) is False

    def test_tc11_rating_tren_max(self):
        """TC11 — X2: rating = 6 (trên biên trên)."""
        assert validate_danh_gia(6, 252) is False

    def test_tc12_comment_duoi_min(self):
        """TC12 — X3: comment = 4 ký tự (dưới biên dưới)."""
        assert validate_danh_gia(3, 4) is False

    def test_tc13_comment_tren_max(self):
        """TC13 — X4: comment = 501 ký tự (trên biên trên)."""
        assert validate_danh_gia(3, 501) is False

    def test_tc14_ca_hai_bien_sai(self):
        """TC14 — X1, X3: rating và comment đều vi phạm."""
        assert validate_danh_gia(0, 4) is False

    def test_tc15_rating_hop_le_comment_sai(self):
        """TC15 — X4: rating hợp lệ nhưng comment vượt giới hạn."""
        assert validate_danh_gia(5, 501) is False