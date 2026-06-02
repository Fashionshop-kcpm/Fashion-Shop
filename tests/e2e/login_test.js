Feature('Trang Dang Nhap @e2e');

// User da duoc seed trong DB (khop voi Postman collection)
const VALID_EMAIL = 'test12@gmail.com';
const VALID_PASSWORD = '123456';

Scenario('Dang nhap thanh cong va chuyen ve trang chu', async ({ I }) => {
  I.amOnPage('/login');
  I.see('Dang Nhap');

  I.fillField('[name="email"]', VALID_EMAIL);
  I.fillField('[name="password"]', VALID_PASSWORD);
  I.click('button[type="submit"]');

  I.waitForNavigation();
  I.seeCurrentUrlEquals('http://localhost:5173/');
});

Scenario('Dang nhap that bai - sai mat khau', async ({ I }) => {
  I.amOnPage('/login');

  I.fillField('[name="email"]', VALID_EMAIL);
  I.fillField('[name="password"]', 'wrongpassword');
  I.click('button[type="submit"]');

  I.waitForText('Dang nhap that bai', 5);
  I.seeCurrentUrlEquals('http://localhost:5173/login');
});

Scenario('Dang nhap that bai - email khong hop le', async ({ I }) => {
  I.amOnPage('/login');

  I.fillField('[name="email"]', 'not-valid');
  I.fillField('[name="password"]', '123456');
  I.click('button[type="submit"]');

  I.see('Email khong hop le');
  I.seeCurrentUrlEquals('http://localhost:5173/login');
});

Scenario('Chuyen trang dang ky khi bam link', async ({ I }) => {
  I.amOnPage('/login');
  I.click('Dang ky ngay');
  I.seeCurrentUrlEquals('http://localhost:5173/register');
});
