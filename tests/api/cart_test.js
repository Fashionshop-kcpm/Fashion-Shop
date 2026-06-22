const { expect } = require('chai');

Feature('Cart API @api');

let token = '';
let productId = null;

Before(async ({ I }) => {
  ({ token } = await I.registerApiUser('cart'));
  productId = await I.getFirstProductId();
});

// ─── VIEW CART ─────────────────────────────────────────────────

Scenario('GET /cart - Status 200 OK', async ({ I }) => {
  const res = await I.sendGetRequest('/cart', {
    Authorization: `Bearer ${token}`,
  });

  expect(res.status).to.equal(200);
});

Scenario('GET /cart - Mỗi cart item có thông tin product', async ({ I }) => {
  // Thêm 1 item trước để có data
  await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'M' },
    { Authorization: `Bearer ${token}` }
  );

  const res = await I.sendGetRequest('/cart', {
    Authorization: `Bearer ${token}`,
  });

  const items = res.data.data;
  expect(items).to.be.an('array');
  if (items.length > 0) {
    expect(items[0]).to.have.property('product');
    expect(items[0]).to.have.property('quantity');
    expect(items[0]).to.have.property('size');
  }
});

Scenario('[BUG] GET /cart - Phản hồi chứa total_price tổng tiền', async ({ I }) => {
  const res = await I.sendGetRequest('/cart', {
    Authorization: `Bearer ${token}`,
  });

  // ❌ API không trả về total_price
  expect(res.data).to.have.property('total_price');
});

Scenario('GET /cart - Lỗi 401 khi không có token', async ({ I }) => {
  const res = await I.sendGetRequest('/cart');

  expect(res.status).to.equal(401);
});

// ─── ADD CART ──────────────────────────────────────────────────

Scenario('POST /cart (XXL) - Trạng thái phản hồi là 200 OK', async ({ I }) => {
  const res = await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 2, size: 'XXL' },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.status).to.equal(200);
});

Scenario('POST /cart (XXL) - Phản hồi trả về JSON', async ({ I }) => {
  const res = await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 2, size: 'XXL' },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.data).to.be.an('object');
});

Scenario('POST /cart (XXL) - Size không hợp lệ', async ({ I }) => {
  const res = await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 2, size: 'XXL' },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.data.message).to.equal('Size không hợp lệ');
  expect(res.data.errors).to.have.property('size');
});

Scenario('[BUG] POST /cart (XL) - Size không hợp lệ', async ({ I }) => {
  const res = await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 2, size: 'XL' },
    { Authorization: `Bearer ${token}` }
  );

  // ❌ XL là size hợp lệ → API trả thành công, không phải "Size không hợp lệ"
  expect(res.data.message).to.equal('Size không hợp lệ');
  expect(res.data.errors).to.have.property('size');
});

Scenario('POST /cart - Thêm vào giỏ hàng với size hợp lệ', async ({ I }) => {
  const res = await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 2, size: 'XL' },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.status).to.equal(200);
  expect(res.data.message).to.equal('Đã thêm vào giỏ hàng');
});

Scenario('POST /cart - Lỗi 401 khi không có token', async ({ I }) => {
  const res = await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 2, size: 'M' }
  );

  expect(res.status).to.equal(401);
});

// ─── UPDATE CART ─────────────────────────────────────────────────

Scenario('PATCH /cart/:id - Mã trạng thái phải là 200', async ({ I }) => {
  const addRes = await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'M' },
    { Authorization: `Bearer ${token}` }
  );
  const cartId = addRes.data.cart.id;

  const res = await I.sendPatchRequest(`/cart/${cartId}`,
    { quantity: 1 },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.status).to.equal(200);
});

Scenario('PATCH /cart/:id - Phản hồi trả về JSON', async ({ I }) => {
  const addRes = await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'L' },
    { Authorization: `Bearer ${token}` }
  );
  const cartId = addRes.data.cart.id;

  const res = await I.sendPatchRequest(`/cart/${cartId}`,
    { quantity: 2 },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.data).to.be.an('object');
});

Scenario('PATCH /cart/:id - Cập nhật sản phẩm giỏ hàng thành công', async ({ I }) => {
  const addRes = await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'S' },
    { Authorization: `Bearer ${token}` }
  );
  const cartId = addRes.data.cart.id;

  const res = await I.sendPatchRequest(`/cart/${cartId}`,
    { quantity: 3 },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.data).to.have.property('cart');
});

Scenario('PATCH /cart/:id - Lỗi 401 khi không có token', async ({ I }) => {
  const res = await I.sendPatchRequest('/cart/1', { quantity: 1 });

  expect(res.status).to.equal(401);
});

// ─── DELETE CART ─────────────────────────────────────────────────

Scenario('DELETE /cart/:id - Status 200 OK', async ({ I }) => {
  const addRes = await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'M' },
    { Authorization: `Bearer ${token}` }
  );
  const cartId = addRes.data.cart.id;

  const res = await I.sendDeleteRequest(`/cart/${cartId}`, {
    Authorization: `Bearer ${token}`,
  });

  expect(res.status).to.equal(200);
});

Scenario('DELETE /cart/:id - Message xóa giỏ hàng đúng', async ({ I }) => {
  const addRes = await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'L' },
    { Authorization: `Bearer ${token}` }
  );
  const cartId = addRes.data.cart.id;

  const res = await I.sendDeleteRequest(`/cart/${cartId}`, {
    Authorization: `Bearer ${token}`,
  });

  expect(res.data.message).to.equal('Đã xóa sản phẩm khỏi giỏ hàng');
});

Scenario('[BUG] DELETE /cart/:id - Thông báo lỗi khi ID không tồn tại', async ({ I }) => {
  const res = await I.sendDeleteRequest('/cart/999', {
    Authorization: `Bearer ${token}`,
  });

  // ❌ controller không kiểm tra ID → luôn trả success, không có "ID không hợp lệ"
  expect(res.data.message).to.equal('ID không hợp lệ');
});

Scenario('DELETE /cart/:id - Lỗi 401 khi không có token', async ({ I }) => {
  const res = await I.sendDeleteRequest('/cart/1');

  expect(res.status).to.equal(401);
});
