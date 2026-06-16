VALID_SIZES = {"S", "M", "L", "XL"}

def validate_them_gio_hang(quantity: int, size: str, so_luong_sp: int = 50) -> bool:
    """
    Kiểm tra tính hợp lệ của yêu cầu thêm sản phẩm vào giỏ hàng Fashion Shop.

    Tham số:
        quantity     (int): Số lượng sản phẩm muốn thêm vào giỏ.
        size         (str): Kích cỡ sản phẩm được chọn (S / M / L / XL).
        so_luong_sp  (int): Tồn kho của sản phẩm (mặc định 50 cho kiểm thử).

    Trả về:
        True  nếu tất cả đầu vào hợp lệ.
        False nếu có ít nhất một đầu vào không hợp lệ.
    """
    return (
        1 <= quantity <= so_luong_sp and
        size in VALID_SIZES
    )