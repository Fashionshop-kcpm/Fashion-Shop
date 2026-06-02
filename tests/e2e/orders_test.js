Feature('Trang Don Hang @e2e');

let testToken = '';

Before(async ({ I }) => {
  const creds = await I.loginNewUser();
  testToken = creds.token;
});

After(async ({ I }) => {
  await I.clearAuth();
});

Scenario('Chuyen den /login khi truy cap /orders chua dang nhap', async ({ I }) => {
  await I.clearAuth();
  I.amOnPage('/orders');
  I.waitForNavigation();
  I.seeCurrentUrlEquals('http://localhost:5173/login');
});

Scenario('Trang don hang hien thi khi chua co don', async ({ I }) => {
  I.amOnPage('/orders');
  I.waitForElement('h1', 8);
  I.see('Lich Su Don Hang');
});

Scenario('Trang checkout hien thi form dat hang', async ({ I }) => {
  // Can them san pham vao gio truoc
  const listRes = await I.sendGetRequest('/products');
  const productId = listRes.data.data[0].id;
  const token = await I.executeScript(() => localStorage.getItem('token'));

  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'M' },
    { Authorization: `Bearer ${token}` }
  );

  I.amOnPage('/checkout');
  I.waitForElement('h1, form', 8);
  I.seeElement('[name="fullname"]');
  I.seeElement('[name="phone"]');
  I.seeElement('[name="address"]');
  I.seeElement('button[type="submit"]');
});

Scenario('Dat hang thanh cong va chuyen trang order-success', async ({ I }) => {
  // Them san pham vao gio qua API
  const listRes = await I.sendGetRequest('/products');
  const productId = listRes.data.data[0].id;
  const token = await I.executeScript(() => localStorage.getItem('token'));

  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'M' },
    { Authorization: `Bearer ${token}` }
  );

  I.amOnPage('/checkout');
  I.waitForElement('[name="fullname"]', 8);

  I.fillField('[name="fullname"]', 'Nguyen Van Test');
  I.fillField('[name="phone"]', '0901234567');
  I.fillField('[name="address"]', '123 Duong Le Loi, Quan 1, TP.HCM');

  I.click('button[type="submit"]');

  I.waitForNavigation();
  I.seeInCurrentUrl('/order-success/');
});

Scenario('Dat hang loi 422 khi de trong dia chi', async ({ I }) => {
  const listRes = await I.sendGetRequest('/products');
  const productId = listRes.data.data[0].id;
  const token = await I.executeScript(() => localStorage.getItem('token'));

  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'L' },
    { Authorization: `Bearer ${token}` }
  );

  I.amOnPage('/checkout');
  I.waitForElement('[name="fullname"]', 8);

  I.fillField('[name="fullname"]', 'Test User');
  I.fillField('[name="phone"]', '0901234567');
  // Bo trong address

  I.click('button[type="submit"]');

  // Form validation khong cho submit
  I.waitForElement('p.text-red-500, span.text-red-500', 5);
  I.seeCurrentUrlEquals('http://localhost:5173/checkout');
});

Scenario('Xem danh sach don hang sau khi dat', async ({ I }) => {
  // Tao 1 don hang qua API
  const listRes = await I.sendGetRequest('/products');
  const productId = listRes.data.data[0].id;
  const token = await I.executeScript(() => localStorage.getItem('token'));

  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'S' },
    { Authorization: `Bearer ${token}` }
  );
  await I.sendPostRequest('/orders',
    { fullname: 'Test User', phone: '0901234567', address: '123 ABC', payment: 'COD' },
    { Authorization: `Bearer ${token}` }
  );

  I.amOnPage('/orders');
  I.waitForElement('h1', 8);
  I.see('Lich Su Don Hang');
  // Co it nhat 1 don hang
  I.waitForElement('a[href*="/orders/"]', 8);
});
