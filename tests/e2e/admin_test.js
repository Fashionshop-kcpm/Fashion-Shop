// Admin panel chạy trên http://localhost:5174
const ADMIN_URL = 'http://localhost:5174';
const ADMIN_EMAIL = 'admin@fashionshop.vn';
const ADMIN_PASSWORD = 'Admin123456';

Feature('Admin Panel @e2e @admin');

// Helper login nội bộ trong file này
async function adminLogin(I) {
  I.amOnPage(`${ADMIN_URL}/login`);
  I.waitForElement('[name="email"]', 8);
  I.fillField('[name="email"]', ADMIN_EMAIL);
  I.fillField('[name="password"]', ADMIN_PASSWORD);
  I.click('button[type="submit"]');
  I.waitForURL(`${ADMIN_URL}/`, 10);
}

// ─── ADMIN LOGIN ─────────────────────────────────────────────────

Scenario('Trang admin login hiển thị form đăng nhập', async ({ I }) => {
  I.amOnPage(`${ADMIN_URL}/login`);
  I.waitForElement('[name="email"]', 8);

  I.see('FashionShop Admin');
  I.seeElement('[name="email"]');
  I.seeElement('[name="password"]');
  I.seeElement('button[type="submit"]');
});

Scenario('Admin đăng nhập thành công và chuyển đến dashboard', async ({ I }) => {
  await adminLogin(I);

  I.seeInCurrentUrl(ADMIN_URL);
  I.waitForElement('h1', 8);
  I.see('Dashboard');
});

Scenario('Admin đăng nhập thất bại - sai mật khẩu', async ({ I }) => {
  I.amOnPage(`${ADMIN_URL}/login`);
  I.waitForElement('[name="email"]', 8);

  I.fillField('[name="email"]', ADMIN_EMAIL);
  I.fillField('[name="password"]', 'wrongpassword');
  I.click('button[type="submit"]');

  I.waitForText('thất bại', 5);
  I.seeInCurrentUrl('/login');
});

Scenario('Admin đăng nhập thất bại - email không hợp lệ', async ({ I }) => {
  I.amOnPage(`${ADMIN_URL}/login`);
  I.waitForElement('[name="email"]', 8);

  I.fillField('[name="email"]', 'notvalidemail');
  I.fillField('[name="password"]', ADMIN_PASSWORD);
  I.click('button[type="submit"]');

  I.waitForElement('p.text-red-500', 5);
  I.seeInCurrentUrl('/login');
});

// ─── DASHBOARD ───────────────────────────────────────────────────

Scenario('Dashboard hiển thị thống kê Doanh Thu, Đơn Hàng, Người Dùng, Sản Phẩm', async ({ I }) => {
  await adminLogin(I);

  I.amOnPage(`${ADMIN_URL}/`);
  I.waitForElement('h1', 8);
  I.see('Dashboard');
  I.see('Doanh Thu');
  I.see('Đơn Hàng');
  I.see('Người Dùng');
  I.see('Sản Phẩm');
});

// ─── PRODUCTS ────────────────────────────────────────────────────

Scenario('Admin xem danh sách sản phẩm', async ({ I }) => {
  await adminLogin(I);

  I.amOnPage(`${ADMIN_URL}/products`);
  I.waitForElement('h1', 8);
  I.seeElement('table, .grid');
});

// ─── ORDERS ──────────────────────────────────────────────────────

Scenario('Admin xem danh sách đơn hàng', async ({ I }) => {
  await adminLogin(I);

  I.amOnPage(`${ADMIN_URL}/orders`);
  I.waitForElement('h1', 8);
  I.see('Đơn Hàng');
  I.seeElement('table');
});

Scenario('Admin lọc đơn hàng theo trạng thái', async ({ I }) => {
  await adminLogin(I);

  I.amOnPage(`${ADMIN_URL}/orders`);
  I.waitForElement('select', 8);

  // Chọn lọc theo trạng thái
  I.selectOption('select', 'pending');
  I.waitForElement('table', 5);
  I.seeInCurrentUrl(`${ADMIN_URL}/orders`);
});

Scenario('Admin tìm kiếm đơn hàng theo từ khóa', async ({ I }) => {
  await adminLogin(I);

  I.amOnPage(`${ADMIN_URL}/orders`);
  I.waitForElement('input[placeholder*="Tìm"]', 8);

  I.fillField('input[placeholder*="Tìm"]', '1');
  I.pressKey('Enter');
  I.waitForElement('table', 5);
});

Scenario('Admin xem chi tiết đơn hàng', async ({ I }) => {
  await adminLogin(I);

  I.amOnPage(`${ADMIN_URL}/orders`);
  I.waitForElement('table', 10);

  // Bấm vào link chi tiết đơn hàng đầu tiên
  const eyeLink = locate('a[href*="/orders/"]').first();
  I.waitForElement(eyeLink, 8);
  I.click(eyeLink);

  I.waitForNavigation();
  I.seeInCurrentUrl('/orders/');
  I.waitForElement('h1, .text-2xl', 8);
});

// ─── REVIEWS ─────────────────────────────────────────────────────

Scenario('Admin xem danh sách đánh giá', async ({ I }) => {
  await adminLogin(I);

  I.amOnPage(`${ADMIN_URL}/reviews`);
  I.waitForElement('h1, table, .space-y', 8);
  I.seeInCurrentUrl('/reviews');
});

// ─── CONTACTS ────────────────────────────────────────────────────

Scenario('Admin xem danh sách liên hệ', async ({ I }) => {
  await adminLogin(I);

  I.amOnPage(`${ADMIN_URL}/contacts`);
  I.waitForElement('h1, table, .space-y', 8);
  I.seeInCurrentUrl('/contacts');
});

// ─── USERS ───────────────────────────────────────────────────────

Scenario('Admin xem danh sách người dùng', async ({ I }) => {
  await adminLogin(I);

  I.amOnPage(`${ADMIN_URL}/users`);
  I.waitForElement('h1, table', 8);
  I.seeInCurrentUrl('/users');
});
