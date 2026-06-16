def validate_san_pham(ten_sp: int, gia: int, so_luong: int) -> bool:
    """
    Kiểm tra tính hợp lệ của thông tin sản phẩm trong Fashion Shop Admin.

    Tham số:
        ten_sp   (int): Số ký tự của tên sản phẩm.
        gia      (int): Giá bán sản phẩm (VNĐ), phải >= 0.
        so_luong (int): Số lượng tồn kho, phải >= 0.

    Trả về:
        True  nếu tất cả đầu vào hợp lệ.
        False nếu có ít nhất một đầu vào không hợp lệ.
    """
    return (
        1 <= ten_sp <= 255 and
        0 <= gia <= 999_999_999 and
        0 <= so_luong <= 10_000
    )