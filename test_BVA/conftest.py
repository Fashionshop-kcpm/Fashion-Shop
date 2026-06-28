import pytest
import requests
import uuid

BASE_URL = "http://127.0.0.1:8000/api/v1"

ADMIN_EMAIL = "admin@fashionshop.vn"
ADMIN_PASSWORD = "Admin123456"

TEST_USER_EMAIL = "user@test.com"
TEST_USER_PASSWORD = "User123456"


def unique_email():
    return f"bva_{uuid.uuid4().hex[:8]}@test.com"


def phone_str(n_digits):
    return ("1234567890" * 3)[:n_digits]


@pytest.fixture(scope="session")
def user_token():
    resp = requests.post(f"{BASE_URL}/login", json={
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD,
    })
    assert resp.status_code == 200, f"Login user thất bại: {resp.text}"
    return resp.json()["token"]


@pytest.fixture(scope="session")
def auth_headers(user_token):
    return {"Authorization": f"Bearer {user_token}"}


@pytest.fixture(scope="session")
def admin_token():
    resp = requests.post(f"{BASE_URL}/admin/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD,
    })
    assert resp.status_code == 200, f"Login admin thất bại: {resp.text}"
    return resp.json()["token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="session")
def first_product_id():
    resp = requests.get(f"{BASE_URL}/products")
    assert resp.status_code == 200
    products = resp.json().get("data", [])
    assert len(products) > 0, "Không có sản phẩm nào trong DB"
    return products[0]["id"]


@pytest.fixture
def fresh_user():
    """Đăng ký user mới cho mỗi test cần trạng thái độc lập (vd: đổi mật khẩu)."""
    email = unique_email()
    password = "Password123"
    resp = requests.post(f"{BASE_URL}/register", json={
        "fullname": "BVA Test User",
        "email": email,
        "phone": "0901234567",
        "gender": "Nam",
        "password": password,
        "password_confirmation": password,
    })
    assert resp.status_code == 201, f"Đăng ký user mới thất bại: {resp.text}"
    token = resp.json()["token"]
    return {
        "email": email,
        "password": password,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }
