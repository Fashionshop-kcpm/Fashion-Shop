Feature('Trang Lien He @e2e');

Scenario('Trang lien he hien thi form gui tin nhan', async ({ I }) => {
  I.amOnPage('/contact');
  I.waitForElement('h1', 5);
  I.seeElement('[name="fullname"]');
  I.seeElement('[name="email"]');
  I.seeElement('[name="message"]');
  I.seeElement('button[type="submit"]');
});

Scenario('Gui lien he thanh cong', async ({ I }) => {
  I.amOnPage('/contact');
  I.waitForElement('[name="fullname"]', 5);

  I.fillField('[name="fullname"]', 'Nguyen Van A');
  I.fillField('[name="email"]', 'contact@test.com');
  I.fillField('[name="message"]', 'Toi muon hoi ve san pham ao thun nam co o cua hang khong?');

  I.click('button[type="submit"]');

  // Toast success hien ra
  I.waitForText('Gui lien he thanh cong', 8);
});

Scenario('Loi khi de trong fullname', async ({ I }) => {
  I.amOnPage('/contact');
  I.waitForElement('[name="email"]', 5);

  I.fillField('[name="email"]', 'test@gmail.com');
  I.fillField('[name="message"]', 'Noi dung tin nhan day du hon 10 ky tu');

  I.click('button[type="submit"]');

  // Validation error cho ten
  I.waitForElement('p.text-red-500, span.text-red-500', 5);
});

Scenario('Loi khi email khong hop le', async ({ I }) => {
  I.amOnPage('/contact');
  I.waitForElement('[name="fullname"]', 5);

  I.fillField('[name="fullname"]', 'Test User');
  I.fillField('[name="email"]', 'not-an-email');
  I.fillField('[name="message"]', 'Noi dung tin nhan day du hon 10 ky tu');

  I.click('button[type="submit"]');

  I.waitForElement('p.text-red-500, span.text-red-500', 5);
});

Scenario('Loi khi noi dung qua ngan (duoi 10 ky tu)', async ({ I }) => {
  I.amOnPage('/contact');
  I.waitForElement('[name="fullname"]', 5);

  I.fillField('[name="fullname"]', 'Test User');
  I.fillField('[name="email"]', 'test@gmail.com');
  I.fillField('[name="message"]', 'Ngan');

  I.click('button[type="submit"]');

  I.waitForElement('p.text-red-500, span.text-red-500', 5);
});
