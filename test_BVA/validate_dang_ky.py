def validate_dang_ky(fullname: int, phone: int, password: int) -> bool:
    """
    Kiểm tra tính hợp lệ của một yêu cầu đăng ký tài khoản Fashion Shop.

    Tham số:
        fullname (int): Số ký tự của họ tên.
        phone    (int): Số lượng chữ số của số điện thoại.
        password (int): Số ký tự của mật khẩu.

    Trả về:
        True  nếu tất cả đầu vào hợp lệ.
        False nếu có ít nhất một đầu vào không hợp lệ.
    """
    return (
        2 <= fullname <= 255 and
        9 <= phone <= 11 and
        6 <= password <= 50
    )