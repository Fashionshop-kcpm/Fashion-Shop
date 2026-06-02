Feature('Trang Giỏ Hàng @e2e');

Before(async ({ I }) => {
  await I.loginNewUser();
  I.amOnPage('/');
  I.waitForElement('body', 3);
});

After(async ({ I }) => {
  await I.clearAuth();
});

Scenario('Chuyển đến /login khi truy cập /cart chưa đăng nhập', async ({ I }) => {
  await I.clearAuth();
  I.amOnPage('/cart');
  I.waitForURL('http://localhost:5173/login', 5);
  I.seeCurrentUrlEquals('http://localhost:5173/login');
});

Scenario('Trang giỏ hàng hiển thị đúng khi đã đăng nhập', async ({ I }) => {
  I.amOnPage('/cart');
  I.waitForElement('h1', 8);
  I.see('Giỏ Hàng');
});

Scenario('Giỏ hàng trống hiển thị thông báo', async ({ I }) => {
  I.amOnPage('/cart');
  I.waitForElement('h1', 8);
  I.see('Giỏ Hàng');
  // User mới tạo → giỏ hàng trống
  I.waitForText('Giỏ hàng trống', 8);
});

Scenario('Thêm sản phẩm vào giỏ từ trang chi tiết', async ({ I }) => {
  // Vào trang category, chọn sản phẩm đầu tiên
  I.amOnPage('/category');
  I.waitForElement('h3', 10);
  I.click(locate('h3').first());
  I.waitForNavigation();
  I.seeInCurrentUrl('/products/');

  // Bấm Thêm Vào Giỏ
  I.waitForText('Thêm Vào Giỏ', 8);
  I.click(locate('button').withText('Thêm Vào Giỏ').first());

  I.waitForText('Đã thêm vào giỏ hàng', 5);
});

Scenario('Xem giỏ hàng sau khi thêm sản phẩm qua API', async ({ I }) => {
  // Thêm sản phẩm qua API để test nhanh hơn
  const listRes = await I.sendGetRequest('/products');
  const productId = listRes.data.data[0].id;
  const token = await I.executeScript(() => localStorage.getItem('token'));

  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'M' },
    { Authorization: `Bearer ${token}` }
  );

  I.amOnPage('/cart');
  I.waitForElement('h1', 8);
  I.see('Giỏ Hàng');
  // Có ít nhất 1 sản phẩm trong giỏ
  I.waitForElement('img.object-cover', 8);
});

Scenario('Tăng số lượng sản phẩm trong giỏ hàng', async ({ I }) => {
  const listRes = await I.sendGetRequest('/products');
  const productId = listRes.data.data[0].id;
  const token = await I.executeScript(() => localStorage.getItem('token'));

  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'L' },
    { Authorization: `Bearer ${token}` }
  );

  I.amOnPage('/cart');
  I.waitForElement('button', 8);

  // Bấm nút tăng số lượng (+)
  I.waitForElement(locate('button').withText('+').first(), 5);
  I.click(locate('button').withText('+').first());

  // Số lượng tăng lên 2
  I.waitForText('2', 3);
});

Scenario('Nút Tiến hành thanh toán dẫn đến /checkout', async ({ I }) => {
  const listRes = await I.sendGetRequest('/products');
  const productId = listRes.data.data[0].id;
  const token = await I.executeScript(() => localStorage.getItem('token'));

  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'S' },
    { Authorization: `Bearer ${token}` }
  );

  I.amOnPage('/cart');
  I.waitForElement('a[href="/checkout"], button', 8);

  I.click(locate('a[href="/checkout"]').first());
  I.waitForURL('http://localhost:5173/checkout', 8);
});
