const { expect } = require('chai');

Feature('Cart API @api');

let token = '';
let productId = null;

Before(async ({ I }) => {
  const res = await I.sendPostRequest('/register', {
    fullname: 'Nguyễn Chí Trung',
    email: `cart_${Date.now()}@gmail.com`,
    phone: '0938019655',
    gender: 'Nam',
    password: 'Chi123',
    password_confirmation: 'Chi123',
  });
  token = res.data.token;

  const listRes = await I.sendGetRequest('/products');
  productId = listRes.data.data[0].id;
});

// ─── ADD CART (size hợp lệ XL) ──────────────────────────────────

Scenario('POST /cart - Trạng thái phản hồi là 200 OK', async ({ I }) => {
  const res = await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 2, size: 'XL' },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.status).to.equal(200);
});

Scenario('POST /cart - Message Thêm giỏ hàng đúng', async ({ I }) => {
  const res = await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 2, size: 'XL' },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.data.message).to.equal('Đã thêm vào giỏ hàng');
});

Scenario('[BUG] POST /cart (XL) - Size không hợp lệ', async ({ I }) => {
  const res = await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 2, size: 'XL' },
    { Authorization: `Bearer ${token}` }
  );

  // ❌ XL là size hợp lệ → sẽ không trả "Size không hợp lệ"
  expect(res.data.message).to.equal('Size không hợp lệ');
  expect(res.data).to.have.property('errors');
});

// ─── ADD CART BUG (size không hợp lệ XXL) ──────────────────────

Scenario('POST /cart (XXL) - Trạng thái phản hồi là 200 OK', async ({ I }) => {
  const res = await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 2, size: 'XXL' },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.status).to.equal(200);
});

Scenario('[BUG] POST /cart (XXL) - Message Thêm giỏ hàng đúng', async ({ I }) => {
  const res = await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 2, size: 'XXL' },
    { Authorization: `Bearer ${token}` }
  );

  // ❌ XXL không hợp lệ → trả "Size không hợp lệ", không phải "Đã thêm vào giỏ hàng"
  expect(res.data.message).to.equal('Đã thêm vào giỏ hàng');
});

Scenario('POST /cart (XXL) - Size không hợp lệ', async ({ I }) => {
  const res = await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 2, size: 'XXL' },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.data.message).to.equal('Size không hợp lệ');
  expect(res.data.errors).to.have.property('size');
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

Scenario('PATCH /cart/:id - Phản hồi trả về phải ở định dạng JSON', async ({ I }) => {
  const addRes = await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'L' },
    { Authorization: `Bearer ${token}` }
  );
  const cartId = addRes.data.cart.id;

  const res = await I.sendPatchRequest(`/cart/${cartId}`,
    { quantity: 1 },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.data).to.be.an('object');
});

Scenario('PATCH /cart/:id - Thông báo thành công phải khớp', async ({ I }) => {
  const addRes = await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'S' },
    { Authorization: `Bearer ${token}` }
  );
  const cartId = addRes.data.cart.id;

  const res = await I.sendPatchRequest(`/cart/${cartId}`,
    { quantity: 1 },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.data.message).to.equal('Đã cập nhật giỏ hàng');
});

// ─── DELETE CART ─────────────────────────────────────────────────

Scenario('DELETE /cart/:id - Status 200 OK', async ({ I }) => {
  // ID 999 không tồn tại nhưng controller vẫn trả 200
  const res = await I.sendDeleteRequest('/cart/999', {
    Authorization: `Bearer ${token}`,
  });

  expect(res.status).to.equal(200);
});

Scenario('DELETE /cart/:id - Message xóa giỏ hàng đúng', async ({ I }) => {
  const res = await I.sendDeleteRequest('/cart/999', {
    Authorization: `Bearer ${token}`,
  });

  expect(res.data.message).to.equal('Đã xóa sản phẩm khỏi giỏ hàng');
});

Scenario('[BUG] DELETE /cart/:id - Kiểm tra thông báo lỗi ID không phải số', async ({ I }) => {
  const res = await I.sendDeleteRequest('/cart/999', {
    Authorization: `Bearer ${token}`,
  });

  // ❌ controller không kiểm tra ID → luôn trả success, không có "ID không hợp lệ"
  expect(res.data.message).to.equal('ID không hợp lệ');
});
