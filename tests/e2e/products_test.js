Feature('Trang Sản Phẩm @e2e');

Scenario('Trang chủ hiển thị danh sách sản phẩm và tabs', async ({ I }) => {
  I.amOnPage('/');
  I.waitForElement('h3', 10);

  I.see('Nổi Bật');
  I.see('Bán Chạy');
  I.see('Khuyến Mãi');
  I.seeElement('h3');
});

Scenario('Trang chủ - tab Bán Chạy hiển thị sản phẩm', async ({ I }) => {
  I.amOnPage('/');
  I.waitForText('Bán Chạy', 8);

  I.click('Bán Chạy');
  I.waitForElement('h3', 8);
  I.seeElement('h3');
});

Scenario('Trang category hiển thị danh sách sản phẩm', async ({ I }) => {
  I.amOnPage('/category');
  I.waitForElement('h3', 10);

  I.seeElement('h3');
  I.seeElement('button');
});

Scenario('Bấm vào sản phẩm mở trang chi tiết', async ({ I }) => {
  I.amOnPage('/category');
  I.waitForElement('h3 a, a h3, h3', 10);

  I.click(locate('h3').first());
  I.waitForNavigation();
  I.seeInCurrentUrl('/products/');
});

Scenario('Trang chi tiết sản phẩm hiển thị thông tin', async ({ I }) => {
  I.amOnPage('/category');
  I.waitForElement('h3', 10);
  I.click(locate('h3').first());
  I.waitForNavigation();

  I.waitForElement('h1', 8);
  I.seeInCurrentUrl('/products/');
  I.seeElement('button');
});

Scenario('Trang search hiển thị kết quả theo keyword', async ({ I }) => {
  I.amOnPage('/search?keyword=ao');
  I.waitForElement('body', 5);

  I.seeInCurrentUrl('/search');
});

Scenario('Bấm Thêm Giỏ khi chưa đăng nhập → chuyển đến /login', async ({ I }) => {
  I.amOnPage('/');
  I.waitForElement('button', 10);

  I.click(locate('button').withText('Thêm Giỏ').first());
  I.waitForURL('http://localhost:5173/login', 5);
});
