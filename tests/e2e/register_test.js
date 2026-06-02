Feature('Trang Đăng Ký @e2e');

Scenario('Trang register hiển thị đúng form', async ({ I }) => {
  I.amOnPage('/register');
  await I.waitForElement('[name="fullname"]', 8);

  I.see('Đăng Ký');
  I.seeElement('[name="fullname"]');
  I.seeElement('[name="email"]');
  I.seeElement('[name="phone"]');
  I.seeElement('[name="password"]');
  I.seeElement('[name="password_confirmation"]');
  I.seeElement('button[type="submit"]');
});

Scenario('Đăng ký thành công và chuyển về trang chủ', async ({ I }) => {
  const email = `test_${Date.now()}@example.com`;

  I.amOnPage('/register');
  await I.waitForElement('[name="fullname"]', 8);

  I.fillField('[name="fullname"]', 'Nguyễn Văn Test');
  I.fillField('[name="email"]', email);
  I.fillField('[name="phone"]', '0912345678');
  I.selectOption('[name="gender"]', 'Nam');
  I.fillField('[name="password"]', 'Chi123');
  I.fillField('[name="password_confirmation"]', 'Chi123');
  I.click('button[type="submit"]');

  await I.waitForURL('http://localhost:5173/', 10);
  I.seeCurrentUrlEquals('http://localhost:5173/');
});

Scenario('Đăng ký thất bại - email không hợp lệ', async ({ I }) => {
  I.amOnPage('/register');
  await I.waitForElement('form', 8);

  // Tắt HTML5 native validation để Zod xử lý
  await I.disableNativeValidation();

  I.fillField('[name="fullname"]', 'Test User');
  I.fillField('[name="email"]', 'not-an-email');
  I.fillField('[name="phone"]', '0912345678');
  I.fillField('[name="password"]', '123456');
  I.fillField('[name="password_confirmation"]', '123456');
  I.click('button[type="submit"]');

  await I.waitForText('Email không hợp lệ', 5);
  I.seeCurrentUrlEquals('http://localhost:5173/register');
});

Scenario('Đăng ký thất bại - mật khẩu không khớp', async ({ I }) => {
  const email = `mismatch_${Date.now()}@example.com`;

  I.amOnPage('/register');
  await I.waitForElement('[name="fullname"]', 8);

  I.fillField('[name="fullname"]', 'Test User');
  I.fillField('[name="email"]', email);
  I.fillField('[name="phone"]', '0912345678');
  I.fillField('[name="password"]', '123456');
  I.fillField('[name="password_confirmation"]', 'abcdef');
  I.click('button[type="submit"]');

  await I.waitForText('Mật khẩu xác nhận không khớp', 5);
});

Scenario('Chuyển sang trang đăng nhập khi bấm link', async ({ I }) => {
  I.amOnPage('/register');
  await I.waitForElement('a[href="/login"]', 5);
  I.click('a[href="/login"]');
  await I.waitForURL('http://localhost:5173/login', 5);
});
