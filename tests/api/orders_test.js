const { expect } = require('chai');

Feature('Orders API @api');

let token = '';
let productId = null;

const orderPayload = {
  fullname: 'Nguyen Van A',
  phone: '0901234567',
  address: '123 Duong Le Loi, P.1, Q.1, TP.HCM',
  payment: 'COD',
};

Before(async ({ I }) => {
  ({ token } = await I.registerApiUser('order'));
  productId = await I.getFirstProductId();
});

// ─── ĐẶT HÀNG ────────────────────────────────────────────────────

Scenario('POST /orders - Status 200 OK', async ({ I }) => {
  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'M' },
    { Authorization: `Bearer ${token}` }
  );

  const res = await I.sendPostRequest('/orders', orderPayload, {
    Authorization: `Bearer ${token}`,
  });

  expect(res.status).to.equal(200);
});

Scenario('POST /orders - Phản hồi trả về JSON', async ({ I }) => {
  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'L' },
    { Authorization: `Bearer ${token}` }
  );

  const res = await I.sendPostRequest('/orders', orderPayload, {
    Authorization: `Bearer ${token}`,
  });

  expect(res.data).to.be.an('object');
});

Scenario('POST /orders - Response chứa danh sách sản phẩm của đơn hàng', async ({ I }) => {
  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'S' },
    { Authorization: `Bearer ${token}` }
  );

  const res = await I.sendPostRequest('/orders', orderPayload, {
    Authorization: `Bearer ${token}`,
  });

  expect(res.data.order).to.have.property('details');
});

Scenario('POST /orders - Lỗi 400 khi giỏ hàng rỗng', async ({ I }) => {
  const res = await I.sendPostRequest('/orders', orderPayload, {
    Authorization: `Bearer ${token}`,
  });

  expect(res.status).to.equal(400);
});

Scenario('POST /orders - Lỗi 422 khi thiếu thông tin giao hàng', async ({ I }) => {
  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'L' },
    { Authorization: `Bearer ${token}` }
  );

  const res = await I.sendPostRequest('/orders',
    { payment: 'COD' },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.status).to.equal(422);
});

Scenario('POST /orders - Lỗi 401 khi không có token', async ({ I }) => {
  const res = await I.sendPostRequest('/orders', orderPayload);

  expect(res.status).to.equal(401);
});

// ─── HỦY ĐƠN HÀNG ────────────────────────────────────────────────

Scenario('PATCH /orders/:id/cancel - Hủy đơn hàng thành công', async ({ I }) => {
  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'M' },
    { Authorization: `Bearer ${token}` }
  );
  const orderRes = await I.sendPostRequest('/orders', orderPayload, {
    Authorization: `Bearer ${token}`,
  });
  const id = orderRes.data.order?.id || orderRes.data.id;

  const res = await I.sendPatchRequest(`/orders/${id}/cancel`, {}, {
    Authorization: `Bearer ${token}`,
  });

  expect(res.status).to.equal(200);
});

Scenario('PATCH /orders/:id/cancel - Message hủy đơn thành công', async ({ I }) => {
  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'S' },
    { Authorization: `Bearer ${token}` }
  );
  const orderRes = await I.sendPostRequest('/orders', orderPayload, {
    Authorization: `Bearer ${token}`,
  });
  const id = orderRes.data.order?.id || orderRes.data.id;

  const res = await I.sendPatchRequest(`/orders/${id}/cancel`, {}, {
    Authorization: `Bearer ${token}`,
  });

  expect(res.data.message).to.equal('Đã hủy đơn hàng');
});

Scenario('[BUG] PATCH /orders/:id/cancel - Phải trả về status khi hủy đơn hàng', async ({ I }) => {
  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'XL' },
    { Authorization: `Bearer ${token}` }
  );
  const orderRes = await I.sendPostRequest('/orders', orderPayload, {
    Authorization: `Bearer ${token}`,
  });
  const id = orderRes.data.order?.id || orderRes.data.id;

  const res = await I.sendPatchRequest(`/orders/${id}/cancel`, {}, {
    Authorization: `Bearer ${token}`,
  });

  // ❌ controller không trả về field 'status'
  expect(res.data).to.have.property('status');
});

// ─── XEM DANH SÁCH ĐƠN HÀNG ──────────────────────────────────────

Scenario('GET /orders - Status 200 OK', async ({ I }) => {
  const res = await I.sendGetRequest('/orders', {
    Authorization: `Bearer ${token}`,
  });

  expect(res.status).to.equal(200);
});

Scenario('GET /orders - Có dữ liệu đơn hàng', async ({ I }) => {
  // Tạo 1 đơn hàng trước
  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'M' },
    { Authorization: `Bearer ${token}` }
  );
  await I.sendPostRequest('/orders', orderPayload, {
    Authorization: `Bearer ${token}`,
  });

  const res = await I.sendGetRequest('/orders', {
    Authorization: `Bearer ${token}`,
  });

  const count = res.data.length || (res.data.data && res.data.data.length) || 0;
  expect(count).to.be.above(0);
});

Scenario('[BUG] GET /orders - Đơn hàng phải có tổng số lượng', async ({ I }) => {
  const res = await I.sendGetRequest('/orders', {
    Authorization: `Bearer ${token}`,
  });

  const orders = Array.isArray(res.data) ? res.data : res.data.data;
  if (orders && orders.length > 0) {
    // ❌ controller không trả về field 'total_quantity'
    expect(orders[0]).to.have.property('total_quantity');
  }
});

// ─── XEM CHI TIẾT ĐƠN HÀNG ───────────────────────────────────────

Scenario('GET /orders/:id - Status 200 OK', async ({ I }) => {
  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'M' },
    { Authorization: `Bearer ${token}` }
  );
  const orderRes = await I.sendPostRequest('/orders', orderPayload, {
    Authorization: `Bearer ${token}`,
  });
  const id = orderRes.data.order?.id || orderRes.data.id;

  const res = await I.sendGetRequest(`/orders/${id}`, {
    Authorization: `Bearer ${token}`,
  });

  expect(res.status).to.equal(200);
});

Scenario('GET /orders/:id - Order có details với product', async ({ I }) => {
  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'L' },
    { Authorization: `Bearer ${token}` }
  );
  const orderRes = await I.sendPostRequest('/orders', orderPayload, {
    Authorization: `Bearer ${token}`,
  });
  const id = orderRes.data.order?.id || orderRes.data.id;

  const res = await I.sendGetRequest(`/orders/${id}`, {
    Authorization: `Bearer ${token}`,
  });

  expect(res.data).to.have.property('details');
  expect(res.data.details).to.be.an('array');
  if (res.data.details.length > 0) {
    expect(res.data.details[0]).to.have.property('product');
  }
});

Scenario('[BUG] GET /orders/:id - Có size bên trong product', async ({ I }) => {
  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'S' },
    { Authorization: `Bearer ${token}` }
  );
  const orderRes = await I.sendPostRequest('/orders', orderPayload, {
    Authorization: `Bearer ${token}`,
  });
  const id = orderRes.data.order?.id || orderRes.data.id;

  const res = await I.sendGetRequest(`/orders/${id}`, {
    Authorization: `Bearer ${token}`,
  });

  if (res.data.details && res.data.details.length > 0) {
    // ❌ size nằm ở order detail, không phải bên trong product
    expect(res.data.details[0].product).to.have.property('size');
  }
});

Scenario('GET /orders/:id - Lỗi 404 khi ID không tồn tại', async ({ I }) => {
  const res = await I.sendGetRequest('/orders/999999', {
    Authorization: `Bearer ${token}`,
  });

  expect(res.status).to.equal(404);
});
