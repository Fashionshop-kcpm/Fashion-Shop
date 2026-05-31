Feature('Trang Đăng Nhập @e2e');

// Tài khoản đã tồn tại trong DB (tạo thủ công hoặc seed trước)
const VALID_EMAIL = 'test@example.com';
const VALID_PASSWORD = '123456';

Scenario('Đăng nhập thành công và chuyển về trang chủ', async ({ I }) => {
  I.amOnPage('/login');
  I.see('Đăng Nhập');

  I.fillField('[name="email"]', VALID_EMAIL);
  I.fillField('[name="password"]', VALID_PASSWORD);

  I.click('button[type="submit"]');

  I.waitForNavigation();
  I.seeCurrentUrlEquals('http://localhost:5173/');
});

Scenario('Đăng nhập thất bại - sai mật khẩu', async ({ I }) => {
  I.amOnPage('/login');

  I.fillField('[name="email"]', VALID_EMAIL);
  I.fillField('[name="password"]', 'wrongpassword');

  I.click('button[type="submit"]');

  I.waitForText('Email hoặc mật khẩu không chính xác', 5);
  I.seeCurrentUrlEquals('http://localhost:5173/login');
});

Scenario('Đăng nhập thất bại - email không hợp lệ', async ({ I }) => {
  I.amOnPage('/login');

  I.fillField('[name="email"]', 'not-valid');
  I.fillField('[name="password"]', '123456');

  I.click('button[type="submit"]');

  I.see('Email không hợp lệ');
});
