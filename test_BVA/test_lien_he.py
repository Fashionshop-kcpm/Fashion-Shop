import pytest
from validate_lien_he import validate_lien_he


class TestHopLeTaiBien:

    def test_tc01_nominal(self):
        """TC01: Giá trị đại diện — hợp lệ."""
        assert validate_lien_he(128, 505) is True

    def test_tc02_fullname_min(self):
        """TC02 — B1: fullname = 2 (biên dưới hợp lệ)."""
        assert validate_lien_he(2, 505) is True

    def test_tc03_fullname_max(self):
        """TC03 — B5: fullname = 255 (biên trên hợp lệ)."""
        assert validate_lien_he(255, 505) is True

    def test_tc04_message_min(self):
        """TC04 — B6: message = 10 ký tự (biên dưới hợp lệ)."""
        assert validate_lien_he(128, 10) is True

    def test_tc05_message_max(self):
        """TC05 — B10: message = 1000 ký tự (biên trên hợp lệ)."""
        assert validate_lien_he(128, 1000) is True

    def test_tc06_ca_hai_bien_min(self):
        """TC06: Cả hai biến tại min hợp lệ."""
        assert validate_lien_he(2, 10) is True

    def test_tc07_ca_hai_bien_max(self):
        """TC07: Cả hai biến tại max hợp lệ."""
        assert validate_lien_he(255, 1000) is True

    def test_tc08_minplus(self):
        """TC08 — B2, B7: ngay trên biên dưới."""
        assert validate_lien_he(3, 11) is True


class TestKhongHopLe:

    def test_tc09_fullname_duoi_min(self):
        """TC09 — X1: fullname = 1 (dưới biên dưới)."""
        assert validate_lien_he(1, 505) is False

    def test_tc10_fullname_tren_max(self):
        """TC10 — X2: fullname = 256 (trên biên trên)."""
        assert validate_lien_he(256, 505) is False

    def test_tc11_message_duoi_min(self):
        """TC11 — X3: message = 9 ký tự (dưới biên dưới)."""
        assert validate_lien_he(128, 9) is False

    def test_tc12_message_rong(self):
        """TC12 — X3: message = 0 (rỗng)."""
        assert validate_lien_he(128, 0) is False

    def test_tc13_message_tren_max(self):
        """TC13 — X4: message = 1001 ký tự (trên biên trên)."""
        assert validate_lien_he(128, 1001) is False

    def test_tc14_ca_hai_bien_sai(self):
        """TC14 — X1, X3: fullname và message đều vi phạm."""
        assert validate_lien_he(1, 9) is False

    def test_tc15_message_cuc_dai_vi_pham(self):
        """TC15 — X4: fullname hợp lệ, message vượt max."""
        assert validate_lien_he(255, 1001) is False