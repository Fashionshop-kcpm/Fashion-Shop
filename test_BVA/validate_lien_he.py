def validate_lien_he(fullname: int, message: int) -> bool:
    """
    Kiểm tra tính hợp lệ của một yêu cầu liên hệ Fashion Shop.

    Tham số:
        fullname (int): Số ký tự của họ tên người gửi.
        message  (int): Số ký tự của nội dung tin nhắn.

    Trả về:
        True  nếu tất cả đầu vào hợp lệ.
        False nếu có ít nhất một đầu vào không hợp lệ.
    """
    return (
        2 <= fullname <= 255 and
        10 <= message <= 1000
    )