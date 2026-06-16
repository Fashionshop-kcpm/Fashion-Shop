def validate_doi_mat_khau(old_password: int, new_password: int) -> bool:
    """
    Kiểm tra tính hợp lệ của yêu cầu đổi mật khẩu Fashion Shop.

    Tham số:
        old_password (int): Số ký tự của mật khẩu hiện tại.
        new_password (int): Số ký tự của mật khẩu mới.

    Trả về:
        True  nếu tất cả đầu vào hợp lệ.
        False nếu có ít nhất một đầu vào không hợp lệ.
    """
    return (
        1 <= old_password <= 50 and
        6 <= new_password <= 50
    )