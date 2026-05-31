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
  const res = await I.sendPostRequest('/register', {
    fullname: 'Order User',
    email: `order_${Date.now()}@gmail.com`,
    phone: '0938019655',
    gender: 'Nam',
    password: 'Chi123',
    password_confirmation: 'Chi123',
  });
  token = res.data.token;

  const listRes = await I.sendGetRequest('/products');
  productId = listRes.data.data[0].id;
});

Scenario('POST /orders - Dat hang thanh cong', async ({ I }) => {
  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'M' },
    { Authorization: `Bearer ${token}` }
  );

  const res = await I.sendPostRequest('/orders', orderPayload, {
    Authorization: `Bearer ${token}`,
  });

  expect(res.status).to.equal(201);
  expect(res.data).to.have.property('id');
  expect(res.data).to.have.property('status');
  expect(res.data).to.have.property('total');
});

Scenario('POST /orders - Loi 400 khi gio hang rong', async ({ I }) => {
  const res = await I.sendPostRequest('/orders', orderPayload, {
    Authorization: `Bearer ${token}`,
  });

  expect(res.status).to.equal(400);
});

Scenario('POST /orders - Loi 422 khi thieu thong tin giao hang', async ({ I }) => {
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

Scenario('POST /orders - Loi 401 khi khong co token', async ({ I }) => {
  const res = await I.sendPostRequest('/orders', orderPayload);

  expect(res.status).to.equal(401);
});

Scenario('GET /orders - Xem danh sach don hang', async ({ I }) => {
  const res = await I.sendGetRequest('/orders', {
    Authorization: `Bearer ${token}`,
  });

  expect(res.status).to.equal(200);
  expect(res.data).to.be.an('array');
});

Scenario('GET /orders/:id - Xem chi tiet don hang', async ({ I }) => {
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

  expect(res.status).to.equal(200);
  expect(res.data).to.have.property('id', id);
  expect(res.data).to.have.property('status');
  expect(res.data).to.have.property('total');
  expect(res.data).to.have.property('details').that.is.an('array');
});

Scenario('GET /orders/:id - Loi 404 khi ID khong ton tai', async ({ I }) => {
  const res = await I.sendGetRequest('/orders/999999', {
    Authorization: `Bearer ${token}`,
  });

  expect(res.status).to.equal(404);
});

Scenario('PATCH /orders/:id/cancel - Huy don hang khi status = pending', async ({ I }) => {
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

  expect(res.status).to.equal(200);
});
