def validate_danh_gia(rating: int, comment: int) -> bool:
    """
    Kiểm tra tính hợp lệ của một đánh giá sản phẩm Fashion Shop.

    Tham số:
        rating  (int): Số sao đánh giá (1–5).
        comment (int): Số ký tự của nội dung nhận xét.

    Trả về:
        True  nếu tất cả đầu vào hợp lệ.
        False nếu có ít nhất một đầu vào không hợp lệ.
    """
    return (
        1 <= rating <= 5 and
        5 <= comment <= 500
    )