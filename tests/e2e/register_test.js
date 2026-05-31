Feature('Trang Đăng Ký @e2e');

const timestamp = Date.now();

Scenario('Đăng ký thành công và chuyển về trang chủ', async ({ I }) => {
  I.amOnPage('/register');
  I.seeElement('h1');
  I.see('Đăng Ký');

  I.fillField('[name="fullname"]', 'Nguyễn Văn Test');
  I.fillField('[name="email"]', `test_${timestamp}@example.com`);
  I.fillField('[name="phone"]', '0912345678');
  I.selectOption('[name="gender"]', 'Nam');
  I.fillField('[name="password"]', '123456');
  I.fillField('[name="password_confirmation"]', '123456');

  I.click('button[type="submit"]');

  I.waitForNavigation();
  I.seeCurrentUrlEquals('http://localhost:5173/');
});

Scenario('Đăng ký thất bại - email không hợp lệ', async ({ I }) => {
  I.amOnPage('/register');

  I.fillField('[name="fullname"]', 'Test User');
  I.fillField('[name="email"]', 'not-an-email');
  I.fillField('[name="phone"]', '0912345678');
  I.fillField('[name="password"]', '123456');
  I.fillField('[name="password_confirmation"]', '123456');

  I.click('button[type="submit"]');

  I.see('Email không hợp lệ');
  I.seeCurrentUrlEquals('http://localhost:5173/register');
});

Scenario('Đăng ký thất bại - mật khẩu không khớp', async ({ I }) => {
  I.amOnPage('/register');

  I.fillField('[name="fullname"]', 'Test User');
  I.fillField('[name="email"]', `mismatch_${timestamp}@example.com`);
  I.fillField('[name="phone"]', '0912345678');
  I.fillField('[name="password"]', '123456');
  I.fillField('[name="password_confirmation"]', 'abcdef');

  I.click('button[type="submit"]');

  I.see('Mật khẩu xác nhận không khớp');
});
