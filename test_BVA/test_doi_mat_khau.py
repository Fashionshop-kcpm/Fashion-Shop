import pytest
from validate_doi_mat_khau import validate_doi_mat_khau


class TestHopLeTaiBien:

    def test_tc01_nominal(self):
        """TC01: Giá trị đại diện — hợp lệ."""
        assert validate_doi_mat_khau(25, 28) is True

    def test_tc02_old_min(self):
        """TC02 — B1: old_password = 1 ký tự (biên dưới hợp lệ)."""
        assert validate_doi_mat_khau(1, 28) is True

    def test_tc03_old_max(self):
        """TC03 — B5: old_password = 50 ký tự (biên trên hợp lệ)."""
        assert validate_doi_mat_khau(50, 28) is True

    def test_tc04_new_min(self):
        """TC04 — B6: new_password = 6 ký tự (biên dưới hợp lệ)."""
        assert validate_doi_mat_khau(25, 6) is True

    def test_tc05_new_max(self):
        """TC05 — B10: new_password = 50 ký tự (biên trên hợp lệ)."""
        assert validate_doi_mat_khau(25, 50) is True

    def test_tc06_ca_hai_bien_min(self):
        """TC06: old = 1 (min), new = 6 (min) — tất cả tại biên dưới."""
        assert validate_doi_mat_khau(1, 6) is True

    def test_tc07_ca_hai_bien_max(self):
        """TC07: old = 50 (max), new = 50 (max) — tất cả tại biên trên."""
        assert validate_doi_mat_khau(50, 50) is True

    def test_tc08_minplus(self):
        """TC08 — B2, B7: old = 2, new = 7 (ngay trên biên dưới)."""
        assert validate_doi_mat_khau(2, 7) is True


class TestKhongHopLe:

    def test_tc09_old_rong(self):
        """TC09 — X1: old_password = 0 (rỗng, dưới biên dưới)."""
        assert validate_doi_mat_khau(0, 28) is False

    def test_tc10_old_tren_max(self):
        """TC10 — X2: old_password = 51 (trên biên trên)."""
        assert validate_doi_mat_khau(51, 28) is False

    def test_tc11_new_qua_ngan(self):
        """TC11 — X3: new_password = 5 ký tự (dưới biên dưới)."""
        assert validate_doi_mat_khau(25, 5) is False

    def test_tc12_new_mot_ky_tu(self):
        """TC12 — X3: new_password = 1 ký tự (quá ngắn)."""
        assert validate_doi_mat_khau(25, 1) is False

    def test_tc13_new_tren_max(self):
        """TC13 — X4: new_password = 51 ký tự (trên biên trên)."""
        assert validate_doi_mat_khau(25, 51) is False

    def test_tc14_ca_hai_sai(self):
        """TC14 — X1, X3: old rỗng, new quá ngắn."""
        assert validate_doi_mat_khau(0, 5) is False

    def test_tc15_new_am(self):
        """TC15 — X3: new_password = -1 (giá trị âm)."""
        assert validate_doi_mat_khau(25, -1) is False