Feature('Trang Liên Hệ @e2e');

Scenario('Trang liên hệ hiển thị form', async ({ I }) => {
  I.amOnPage('/contact');
  I.waitForElement('[name="fullname"]', 8);

  I.see('Liên Hệ');
  I.seeElement('[name="fullname"]');
  I.seeElement('[name="email"]');
  I.seeElement('[name="message"]');
  I.seeElement('button[type="submit"]');
});

Scenario('Gửi liên hệ thành công', async ({ I }) => {
  I.amOnPage('/contact');
  I.waitForElement('[name="fullname"]', 8);

  I.fillField('[name="fullname"]', 'Nguyễn Văn A');
  I.fillField('[name="email"]', 'contact@test.com');
  I.fillField('[name="message"]', 'Tôi muốn hỏi về sản phẩm áo thun nam có ở cửa hàng không?');

  I.click('button[type="submit"]');

  I.waitForText('Gửi liên hệ thành công', 8);
});

Scenario('Lỗi validation khi để trống tên', async ({ I }) => {
  I.amOnPage('/contact');
  I.waitForElement('[name="email"]', 8);

  I.fillField('[name="email"]', 'test@gmail.com');
  I.fillField('[name="message"]', 'Nội dung tin nhắn đầy đủ hơn 10 ký tự');

  I.click('button[type="submit"]');

  I.waitForElement('p.text-red-500', 5);
  I.see('Tên tối thiểu 2 ký tự');
});

Scenario('Lỗi validation khi email không hợp lệ', async ({ I }) => {
  I.amOnPage('/contact');
  I.waitForElement('[name="fullname"]', 8);

  I.fillField('[name="fullname"]', 'Test User');
  I.fillField('[name="email"]', 'not-an-email');
  I.fillField('[name="message"]', 'Nội dung tin nhắn đầy đủ hơn 10 ký tự');

  I.click('button[type="submit"]');

  I.waitForElement('p.text-red-500', 5);
  I.see('Email không hợp lệ');
});

Scenario('Lỗi validation khi nội dung quá ngắn (dưới 10 ký tự)', async ({ I }) => {
  I.amOnPage('/contact');
  I.waitForElement('[name="fullname"]', 8);

  I.fillField('[name="fullname"]', 'Test User');
  I.fillField('[name="email"]', 'test@gmail.com');
  I.fillField('[name="message"]', 'Ngắn');

  I.click('button[type="submit"]');

  I.waitForElement('p.text-red-500', 5);
  I.see('Nội dung tối thiểu 10 ký tự');
});
