const ADMIN_URL = 'http://localhost:5174';

Feature('Admin Panel @e2e @admin');

Before(async ({ I }) => {
  // Vào admin trước (đúng origin) rồi inject token qua API
  I.amOnPage(`${ADMIN_URL}/login`);
  await I.waitForElement('[name="email"]', 8);
  await I.adminLoginByApi();
  I.amOnPage(`${ADMIN_URL}/`);
  await I.waitForElement('h1', 10);
});

After(async ({ I }) => {
  await I.clearAdminAuth();
});

// ─── LOGIN ───────────────────────────────────────────────────────

Scenario('Trang admin login hiển thị form đăng nhập', async ({ I }) => {
  await I.clearAdminAuth();
  I.amOnPage(`${ADMIN_URL}/login`);
  await I.waitForElement('[name="email"]', 8);

  I.see('FashionShop Admin');
  I.seeElement('[name="email"]');
  I.seeElement('[name="password"]');
  I.seeElement('button[type="submit"]');
});

Scenario('Admin đăng nhập thất bại - sai mật khẩu hiện toast lỗi', async ({ I }) => {
  await I.clearAdminAuth();
  I.amOnPage(`${ADMIN_URL}/login`);
  await I.waitForElement('[name="email"]', 8);

  I.fillField('[name="email"]', 'admin@fashionshop.vn');
  I.fillField('[name="password"]', 'wrongpassword');
  I.click('button[type="submit"]');

  // BE trả về: "Email hoặc mật khẩu không đúng"
  await I.waitForText('không đúng', 6);
  I.seeInCurrentUrl('/login');
});

Scenario('Admin đăng nhập thất bại - email không hợp lệ hiện lỗi validation', async ({ I }) => {
  await I.clearAdminAuth();
  I.amOnPage(`${ADMIN_URL}/login`);
  await I.waitForElement('form', 8);

  await I.disableNativeValidation();

  I.fillField('[name="email"]', 'notvalidemail');
  I.fillField('[name="password"]', 'Admin123456');
  I.click('button[type="submit"]');

  await I.waitForText('Email không hợp lệ', 5);
  I.seeInCurrentUrl('/login');
});

// ─── DASHBOARD ───────────────────────────────────────────────────

Scenario('Dashboard hiển thị tiêu đề và các thống kê', async ({ I }) => {
  I.see('Dashboard');
  I.see('Doanh Thu');
  I.see('Đơn Hàng');
  I.see('Người Dùng');
  I.see('Sản Phẩm');
});

Scenario('Truy cập admin khi chưa login → redirect về /login', async ({ I }) => {
  await I.clearAdminAuth();
  I.amOnPage(`${ADMIN_URL}/`);
  await I.waitForURL(`${ADMIN_URL}/login`, 5);
  I.seeInCurrentUrl('/login');
});

// ─── PRODUCTS ────────────────────────────────────────────────────

Scenario('Admin xem danh sách sản phẩm', async ({ I }) => {
  I.amOnPage(`${ADMIN_URL}/products`);
  await I.waitForElement('h1', 8);
  // Chờ data load xong (spinner → table)
  await I.waitForElement('table', 10);
  I.seeElement('table');
});

// ─── ORDERS ──────────────────────────────────────────────────────

Scenario('Admin xem danh sách đơn hàng', async ({ I }) => {
  I.amOnPage(`${ADMIN_URL}/orders`);
  await I.waitForElement('h1', 8);
  I.see('Đơn Hàng');
  await I.waitForElement('table', 10);
  I.seeElement('table');
});

Scenario('Admin lọc đơn hàng theo trạng thái', async ({ I }) => {
  I.amOnPage(`${ADMIN_URL}/orders`);
  await I.waitForElement('select', 8);

  I.selectOption('select', 'pending');
  await I.waitForElement('table', 8);
  I.seeInCurrentUrl('/orders');
});

Scenario('Admin vào chi tiết đơn hàng và hiển thị dữ liệu', async ({ I }) => {
  I.amOnPage(`${ADMIN_URL}/orders`);
  I.waitForElement('table', 10);
  I.click(locate('a[href*="/orders/"]').first());
  I.waitForURL('**/orders/**', 10);
  I.waitForElement('h1', 10);
  I.see('Chi tiết');
});

Scenario('Admin xem chi tiết đơn hàng đầu tiên (nếu có)', async ({ I }) => {
  I.amOnPage(`${ADMIN_URL}/orders`);
  await I.waitForElement('table', 10);

  const count = await I.grabNumberOfVisibleElements('a[href*="/orders/"]');
  if (count === 0) {
    console.log('Không có đơn hàng, bỏ qua');
    return;
  }

  I.click(locate('a[href*="/orders/"]').first());
  // Dùng waitForURL thay waitForNavigation (SPA React Router)
  await I.waitForURL('**/orders/**', 8);
  I.seeInCurrentUrl('/orders/');
  await I.waitForElement('h1, .text-2xl', 8);
});

// ─── REVIEWS ─────────────────────────────────────────────────────

Scenario('Admin xem danh sách đánh giá', async ({ I }) => {
  I.amOnPage(`${ADMIN_URL}/reviews`);
  await I.waitForElement('h1', 8);
  I.seeInCurrentUrl('/reviews');
});

// ─── CONTACTS ────────────────────────────────────────────────────

Scenario('Admin xem danh sách liên hệ', async ({ I }) => {
  I.amOnPage(`${ADMIN_URL}/contacts`);
  await I.waitForElement('h1', 8);
  I.seeInCurrentUrl('/contacts');
});

// ─── USERS ───────────────────────────────────────────────────────

Scenario('Admin xem danh sách người dùng', async ({ I }) => {
  I.amOnPage(`${ADMIN_URL}/users`);
  await I.waitForElement('h1', 8);
  I.seeInCurrentUrl('/users');
});
