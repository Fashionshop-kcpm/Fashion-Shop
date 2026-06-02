Feature('Trang Đăng Nhập @e2e');

const VALID_EMAIL = 'test12@gmail.com';
const VALID_PASSWORD = '123456';

Scenario('Trang login hiển thị đúng form', async ({ I }) => {
  I.amOnPage('/login');
  I.waitForElement('[name="email"]', 8);

  I.seeElement('[name="email"]');
  I.seeElement('[name="password"]');
  I.seeElement('button[type="submit"]');
  I.see('Đăng Nhập');
});

Scenario('Đăng nhập thành công và chuyển về trang chủ', async ({ I }) => {
  I.amOnPage('/login');
  I.waitForElement('[name="email"]', 8);

  I.fillField('[name="email"]', VALID_EMAIL);
  I.fillField('[name="password"]', VALID_PASSWORD);
  I.click('button[type="submit"]');

  I.waitForURL('http://localhost:5173/', 10);
  I.seeCurrentUrlEquals('http://localhost:5173/');
});

Scenario('Đăng nhập thất bại - sai mật khẩu', async ({ I }) => {
  I.amOnPage('/login');
  I.waitForElement('[name="email"]', 8);

  I.fillField('[name="email"]', VALID_EMAIL);
  I.fillField('[name="password"]', 'wrongpassword');
  I.click('button[type="submit"]');

  I.waitForText('thất bại', 5);
  I.seeInCurrentUrl('/login');
});

Scenario('Đăng nhập thất bại - email không hợp lệ (validation client)', async ({ I }) => {
  I.amOnPage('/login');
  I.waitForElement('[name="email"]', 8);

  I.fillField('[name="email"]', 'notvalidemail');
  I.fillField('[name="password"]', '123456');
  I.click('button[type="submit"]');

  I.waitForElement('p.text-red-500', 5);
  I.see('Email không hợp lệ');
  I.seeCurrentUrlEquals('http://localhost:5173/login');
});

Scenario('Chuyển sang trang đăng ký khi bấm link', async ({ I }) => {
  I.amOnPage('/login');
  I.waitForElement('a[href="/register"]', 5);
  I.click('a[href="/register"]');
  I.waitForURL('http://localhost:5173/register', 5);
});
