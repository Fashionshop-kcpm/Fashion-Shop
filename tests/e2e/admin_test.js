// Admin panel chay tren http://localhost:5174
const ADMIN_URL = "http://localhost:5174";
const ADMIN_EMAIL = "admin@fashionshop.vn";
const ADMIN_PASSWORD = "Admin123456";

Feature("Admin Panel @e2e @admin");

Scenario("Trang admin login hien thi form dang nhap", async ({ I }) => {
  I.amOnPage(`${ADMIN_URL}/login`);
  I.waitForElement('h1, [name="email"]', 8);
  I.seeElement('[name="email"]');
  I.seeElement('[name="password"]');
  I.seeElement('button[type="submit"]');
});

Scenario(
  "Admin dang nhap thanh cong va chuyen den dashboard",
  async ({ I }) => {
    I.amOnPage(`${ADMIN_URL}/login`);
    I.waitForElement('[name="email"]', 8);

    I.fillField('[name="email"]', ADMIN_EMAIL);
    I.fillField('[name="password"]', ADMIN_PASSWORD);
    I.click('button[type="submit"]');

    I.waitForNavigation();
    I.seeInCurrentUrl(ADMIN_URL);
    // Dashboard hien thi
    I.waitForElement("h1, main", 8);
  },
);

Scenario("Admin dang nhap that bai voi sai mat khau", async ({ I }) => {
  I.amOnPage(`${ADMIN_URL}/login`);
  I.waitForElement('[name="email"]', 8);

  I.fillField('[name="email"]', ADMIN_EMAIL);
  I.fillField('[name="password"]', "wrongpassword");
  I.click('button[type="submit"]');

  // Toast loi hien ra, van o trang login
  I.waitForText("Dang nhap that bai", 5);
  I.seeInCurrentUrl("/login");
});

Scenario("Admin dang nhap that bai voi email khong hop le", async ({ I }) => {
  I.amOnPage(`${ADMIN_URL}/login`);
  I.waitForElement('[name="email"]', 8);

  I.fillField('[name="email"]', "notvalidemail");
  I.fillField('[name="password"]', ADMIN_PASSWORD);
  I.click('button[type="submit"]');

  // Validation error
  I.waitForElement("p.text-red-500, span.text-red-500", 5);
  I.seeInCurrentUrl("/login");
});

Scenario("Admin xem trang san pham", async ({ I }) => {
  I.amOnPage(`${ADMIN_URL}/login`);
  I.waitForElement('[name="email"]', 8);
  I.fillField('[name="email"]', ADMIN_EMAIL);
  I.fillField('[name="password"]', ADMIN_PASSWORD);
  I.click('button[type="submit"]');
  I.waitForNavigation();

  // Chuyen sang trang products
  I.amOnPage(`${ADMIN_URL}/products`);
  I.waitForElement("h1, table, .grid", 8);
});

Scenario("Admin xem trang don hang", async ({ I }) => {
  I.amOnPage(`${ADMIN_URL}/login`);
  I.waitForElement('[name="email"]', 8);
  I.fillField('[name="email"]', ADMIN_EMAIL);
  I.fillField('[name="password"]', ADMIN_PASSWORD);
  I.click('button[type="submit"]');
  I.waitForNavigation();

  I.amOnPage(`${ADMIN_URL}/orders`);
  I.waitForElement("h1, table, .space-y", 8);
});

Scenario("Admin xem trang danh gia", async ({ I }) => {
  I.amOnPage(`${ADMIN_URL}/login`);
  I.waitForElement('[name="email"]', 8);
  I.fillField('[name="email"]', ADMIN_EMAIL);
  I.fillField('[name="password"]', ADMIN_PASSWORD);
  I.click('button[type="submit"]');
  I.waitForNavigation();

  I.amOnPage(`${ADMIN_URL}/reviews`);
  I.waitForElement("h1, table, .space-y", 8);
});
