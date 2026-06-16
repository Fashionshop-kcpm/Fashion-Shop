def validate_dat_hang(fullname: int, phone: int, address: int, quantity: int) -> bool:
    """
    Kiểm tra tính hợp lệ của một yêu cầu đặt hàng trong hệ thống Fashion Shop.

    Tham số:
        fullname (int): Số ký tự của họ tên người nhận.
        phone    (int): Số lượng chữ số của số điện thoại liên hệ.
        address  (int): Số ký tự của địa chỉ giao hàng.
        quantity (int): Số lượng sản phẩm mỗi mặt hàng.

    Trả về:
        True  nếu tất cả đầu vào hợp lệ.
        False nếu có ít nhất một đầu vào không hợp lệ.
    """
    return (
        2 <= fullname <= 255 and
        9 <= phone <= 11 and
        5 <= address <= 500 and
        1 <= quantity <= 100
    )