Feature('Trang Gio Hang @e2e');

Before(async ({ I }) => {
  // Tao user moi va set auth vao localStorage
  await I.loginNewUser();
});

After(async ({ I }) => {
  await I.clearAuth();
});

Scenario('Chuyen den /login khi truy cap /cart chua dang nhap', async ({ I }) => {
  // Clear auth truoc
  await I.clearAuth();
  I.amOnPage('/cart');
  I.waitForNavigation();
  I.seeCurrentUrlEquals('http://localhost:5173/login');
});

Scenario('Gio hang trong sau khi dang nhap lan dau', async ({ I }) => {
  I.amOnPage('/cart');
  I.waitForElement('h1', 8);
  I.see('Gio Hang');
  // Gio hang moi tao se trong
  I.waitForElement('body', 3);
});

Scenario('Them san pham vao gio tu trang chi tiet', async ({ I }) => {
  // Vao trang category lay san pham dau tien
  I.amOnPage('/category');
  I.waitForElement('h3', 10);
  I.click(locate('h3').first());
  I.waitForNavigation();
  I.seeInCurrentUrl('/products/');

  // Bam nut Them Vao Gio
  I.waitForElement('button', 5);
  const addBtn = locate('button').withText('Them Vao Gio');
  I.waitForElement(addBtn, 5);
  I.click(addBtn);

  // Toast thanh cong
  I.waitForText('Da them vao gio hang', 5);
});

Scenario('Xem gio hang sau khi them san pham', async ({ I }) => {
  // Them san pham qua API truoc
  const listRes = await I.sendGetRequest('/products');
  const productId = listRes.data.data[0].id;

  const loginRes = await I.sendPostRequest('/login', {
    email: `verify_cart_${Date.now()}@test.com`,
    password: 'Chi123',
  });

  // Dung user hien tai (da duoc set boi loginNewUser)
  // Them san pham vao gio
  const token = await I.executeScript(() => localStorage.getItem('token'));
  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'M' },
    { Authorization: `Bearer ${token}` }
  );

  I.amOnPage('/cart');
  I.waitForElement('h1', 8);
  I.see('Gio Hang');
  // Co it nhat 1 san pham trong gio
  I.waitForElement('img.object-cover, .flex.items-center', 8);
});

Scenario('Cap nhat so luong san pham trong gio', async ({ I }) => {
  // Them san pham qua API
  const listRes = await I.sendGetRequest('/products');
  const productId = listRes.data.data[0].id;
  const token = await I.executeScript(() => localStorage.getItem('token'));

  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'L' },
    { Authorization: `Bearer ${token}` }
  );

  I.amOnPage('/cart');
  I.waitForElement('button', 8);

  // Bam nut tang so luong (+)
  I.waitForElement(locate('button').withText('+').first(), 5);
  I.click(locate('button').withText('+').first());
  I.waitForText('2', 3);
});
