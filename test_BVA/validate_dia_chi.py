def validate_dia_chi(fullname: int, phone: int, address_details: int) -> bool:
    """
    Kiểm tra tính hợp lệ của thông tin địa chỉ giao hàng Fashion Shop.

    Tham số:
        fullname        (int): Số ký tự của họ tên người nhận.
        phone           (int): Số lượng chữ số của số điện thoại.
        address_details (int): Số ký tự của địa chỉ chi tiết.

    Trả về:
        True  nếu tất cả đầu vào hợp lệ.
        False nếu có ít nhất một đầu vào không hợp lệ.
    """
    return (
        2 <= fullname <= 255 and
        9 <= phone <= 11 and
        5 <= address_details <= 500
    )