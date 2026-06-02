Feature('Trang Sản Phẩm @e2e');

Scenario('Trang chủ hiển thị danh sách sản phẩm và tabs', async ({ I }) => {
  I.amOnPage('/');
  await I.waitForElement('h3', 10);

  I.see('Nổi Bật');
  I.see('Bán Chạy');
  I.see('Khuyến Mãi');
  I.seeElement('h3');
});

Scenario('Trang chủ - tab Bán Chạy hiển thị sản phẩm', async ({ I }) => {
  I.amOnPage('/');
  await I.waitForText('Bán Chạy', 8);

  I.click('Bán Chạy');
  await I.waitForElement('h3', 8);
  I.seeElement('h3');
});

Scenario('Trang category hiển thị danh sách sản phẩm', async ({ I }) => {
  I.amOnPage('/category');
  await I.waitForElement('h3', 10);

  I.seeElement('h3');
});

Scenario('Bấm vào sản phẩm mở trang chi tiết', async ({ I }) => {
  I.amOnPage('/category');
  await I.waitForElement('h3', 10);

  // Click link bên trong h3 (không dùng waitForNavigation vì SPA)
  I.click(locate('a').inside('h3').first());
  await I.waitForURL('**/products/**', 8);
  I.seeInCurrentUrl('/products/');
});

Scenario('Trang chi tiết sản phẩm hiển thị thông tin', async ({ I }) => {
  I.amOnPage('/category');
  await I.waitForElement('h3', 10);

  I.click(locate('a').inside('h3').first());
  await I.waitForURL('**/products/**', 8);
  await I.waitForElement('h1', 8);
  I.seeInCurrentUrl('/products/');
  I.seeElement('button');
});

Scenario('Trang search hiển thị kết quả theo keyword', async ({ I }) => {
  I.amOnPage('/search?keyword=ao');
  await I.waitForElement('body', 5);

  I.seeInCurrentUrl('/search');
});

Scenario('Bấm Thêm Giỏ khi chưa đăng nhập → chuyển đến /login', async ({ I }) => {
  I.amOnPage('/');
  // Chờ product cards load xong
  await I.waitForElement('h3', 10);
  // Chờ cụ thể nút Thêm Giỏ xuất hiện
  const addBtn = locate('button').withText('Thêm Giỏ').first();
  await I.waitForElement(addBtn, 10);
  I.click(addBtn);
  await I.waitForURL('http://localhost:5173/login', 5);
});
