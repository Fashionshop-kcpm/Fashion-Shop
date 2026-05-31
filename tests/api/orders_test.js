Feature('Orders API @api');

let token = '';
let productId = null;
let orderId = null;

const orderPayload = {
  fullname: 'Nguyễn Văn A',
  phone: '0901234567',
  address: '123 Đường Lê Lợi, P.1, Q.1, TP.HCM',
  payment: 'COD',
};

Before(async ({ I }) => {
  // Tạo user mới
  const res = await I.sendPostRequest('/register', {
    fullname: 'Order User',
    email: `order_${Date.now()}@test.com`,
    phone: '0912345678',
    gender: 'Nam',
    password: '123456',
    password_confirmation: '123456',
  });
  token = res.data.token;

  // Lấy ID sản phẩm đầu tiên
  const listRes = await I.sendGetRequest('/products');
  productId = listRes.data.data[0].id;
});

// ─── ĐẶT HÀNG ───────────────────────────────────────────────────

Scenario('POST /orders - Đặt hàng thành công', async ({ I }) => {
  // Thêm sản phẩm vào giỏ trước
  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'M' },
    { Authorization: `Bearer ${token}` }
  );

  const res = await I.sendPostRequest('/orders', orderPayload, {
    Authorization: `Bearer ${token}`,
  });

  I.seeResponseCodeIs(201);

  const json = res.data;
  expect(json).to.have.property('id');
  expect(json).to.have.property('status');
  expect(json).to.have.property('total');
  orderId = json.id;
});

Scenario('POST /orders - Lỗi 400 khi giỏ hàng rỗng', async ({ I }) => {
  // Không thêm gì vào giỏ
  const res = await I.sendPostRequest('/orders', orderPayload, {
    Authorization: `Bearer ${token}`,
  });

  I.seeResponseCodeIs(400);
});

Scenario('POST /orders - Lỗi 422 khi thiếu thông tin giao hàng', async ({ I }) => {
  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'L' },
    { Authorization: `Bearer ${token}` }
  );

  const res = await I.sendPostRequest('/orders',
    { payment: 'COD' }, // thiếu fullname, phone, address
    { Authorization: `Bearer ${token}` }
  );

  I.seeResponseCodeIs(422);
});

Scenario('POST /orders - Lỗi 401 khi không có token', async ({ I }) => {
  const res = await I.sendPostRequest('/orders', orderPayload);

  I.seeResponseCodeIs(401);
});

// ─── XEM ĐƠN HÀNG ───────────────────────────────────────────────

Scenario('GET /orders - Xem danh sách đơn hàng', async ({ I }) => {
  const res = await I.sendGetRequest('/orders', {
    Authorization: `Bearer ${token}`,
  });

  I.seeResponseCodeIs(200);

  const json = res.data;
  expect(json).to.be.an('array');
});

Scenario('GET /orders/:id - Xem chi tiết đơn hàng', async ({ I }) => {
  // Tạo đơn hàng trước
  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'M' },
    { Authorization: `Bearer ${token}` }
  );
  const orderRes = await I.sendPostRequest('/orders', orderPayload, {
    Authorization: `Bearer ${token}`,
  });
  const id = orderRes.data.id;

  const res = await I.sendGetRequest(`/orders/${id}`, {
    Authorization: `Bearer ${token}`,
  });

  I.seeResponseCodeIs(200);

  const json = res.data;
  expect(json).to.have.property('id', id);
  expect(json).to.have.property('status');
  expect(json).to.have.property('total');
  expect(json).to.have.property('details').that.is.an('array');
});

Scenario('GET /orders/:id - Lỗi 404 khi ID không tồn tại', async ({ I }) => {
  const res = await I.sendGetRequest('/orders/999999', {
    Authorization: `Bearer ${token}`,
  });

  I.seeResponseCodeIs(404);
});

// ─── HỦY ĐƠN HÀNG ───────────────────────────────────────────────

Scenario('PATCH /orders/:id/cancel - Hủy đơn hàng thành công khi status = pending', async ({ I }) => {
  // Tạo đơn hàng mới
  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'S' },
    { Authorization: `Bearer ${token}` }
  );
  const orderRes = await I.sendPostRequest('/orders', orderPayload, {
    Authorization: `Bearer ${token}`,
  });
  const id = orderRes.data.id;

  const res = await I.sendPatchRequest(`/orders/${id}/cancel`, {}, {
    Authorization: `Bearer ${token}`,
  });

  I.seeResponseCodeIs(200);
});

Scenario('PATCH /orders/:id/cancel - Lỗi 403 khi hủy đơn của người khác', async ({ I }) => {
  // Tạo user khác
  const otherRes = await I.sendPostRequest('/register', {
    fullname: 'Other User',
    email: `other_${Date.now()}@test.com`,
    phone: '0901111111',
    gender: 'Nữ',
    password: '123456',
    password_confirmation: '123456',
  });
  const otherToken = otherRes.data.token;

  // Tạo đơn hàng bằng user gốc
  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'M' },
    { Authorization: `Bearer ${token}` }
  );
  const orderRes = await I.sendPostRequest('/orders', orderPayload, {
    Authorization: `Bearer ${token}`,
  });
  const id = orderRes.data.id;

  // User khác cố hủy đơn → lỗi
  const res = await I.sendPatchRequest(`/orders/${id}/cancel`, {}, {
    Authorization: `Bearer ${otherToken}`,
  });

  I.seeResponseCodeIsNot(200);
});
