Feature('Cart API @api');

let token = '';
let productId = null;
let cartItemId = null;

Before(async ({ I }) => {
  // Tạo user mới
  const res = await I.sendPostRequest('/register', {
    fullname: 'Cart User',
    email: `cart_${Date.now()}@test.com`,
    phone: '0912345678',
    gender: 'Nam',
    password: '123456',
    password_confirmation: '123456',
  });
  token = res.data.token;

  // Lấy ID sản phẩm đầu tiên từ DB
  const listRes = await I.sendGetRequest('/products');
  productId = listRes.data.data[0].id;
});

// ─── XEM GIỎ HÀNG ───────────────────────────────────────────────

Scenario('GET /cart - Xem giỏ hàng (ban đầu rỗng)', async ({ I }) => {
  const res = await I.sendGetRequest('/cart', {
    Authorization: `Bearer ${token}`,
  });

  I.seeResponseCodeIs(200);

  const json = res.data;
  expect(json).to.be.an('array');
});

Scenario('GET /cart - Lỗi 401 khi không có token', async ({ I }) => {
  const res = await I.sendGetRequest('/cart');

  I.seeResponseCodeIs(401);
});

// ─── THÊM VÀO GIỎ ───────────────────────────────────────────────

Scenario('POST /cart - Thêm sản phẩm vào giỏ thành công', async ({ I }) => {
  const res = await I.sendPostRequest('/cart',
    {
      product_id: productId,
      quantity: 2,
      size: 'M',
    },
    { Authorization: `Bearer ${token}` }
  );

  I.seeResponseCodeIs(201);

  const json = res.data;
  expect(json).to.have.property('id');
  expect(json).to.have.property('product_id', productId);
  expect(json).to.have.property('quantity', 2);
  expect(json).to.have.property('size', 'M');
  cartItemId = json.id;
});

Scenario('POST /cart - Lỗi 422 khi size không hợp lệ', async ({ I }) => {
  const res = await I.sendPostRequest('/cart',
    {
      product_id: productId,
      quantity: 1,
      size: 'XXXX',
    },
    { Authorization: `Bearer ${token}` }
  );

  I.seeResponseCodeIs(422);
});

Scenario('POST /cart - Lỗi 422 khi thiếu product_id', async ({ I }) => {
  const res = await I.sendPostRequest('/cart',
    {
      quantity: 1,
      size: 'L',
    },
    { Authorization: `Bearer ${token}` }
  );

  I.seeResponseCodeIs(422);
});

Scenario('POST /cart - Lỗi 401 khi không có token', async ({ I }) => {
  const res = await I.sendPostRequest('/cart', {
    product_id: productId,
    quantity: 1,
    size: 'M',
  });

  I.seeResponseCodeIs(401);
});

// ─── CẬP NHẬT SỐ LƯỢNG ──────────────────────────────────────────

Scenario('PATCH /cart/:id - Cập nhật số lượng thành công', async ({ I }) => {
  // Thêm vào giỏ trước
  const addRes = await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'L' },
    { Authorization: `Bearer ${token}` }
  );
  const itemId = addRes.data.id;

  const res = await I.sendPatchRequest(`/cart/${itemId}`,
    { quantity: 5 },
    { Authorization: `Bearer ${token}` }
  );

  I.seeResponseCodeIs(200);

  const json = res.data;
  expect(json).to.have.property('quantity', 5);
});

Scenario('PATCH /cart/:id - Lỗi 422 khi quantity = 0', async ({ I }) => {
  const addRes = await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'S' },
    { Authorization: `Bearer ${token}` }
  );
  const itemId = addRes.data.id;

  const res = await I.sendPatchRequest(`/cart/${itemId}`,
    { quantity: 0 },
    { Authorization: `Bearer ${token}` }
  );

  I.seeResponseCodeIs(422);
});

// ─── XÓA KHỎI GIỎ ───────────────────────────────────────────────

Scenario('DELETE /cart/:id - Xóa sản phẩm khỏi giỏ thành công', async ({ I }) => {
  // Thêm vào giỏ để xóa
  const addRes = await I.sendPostRequest('/cart',
    { product_id: productId, quantity: 1, size: 'XL' },
    { Authorization: `Bearer ${token}` }
  );
  const itemId = addRes.data.id;

  const res = await I.sendDeleteRequest(`/cart/${itemId}`, {
    Authorization: `Bearer ${token}`,
  });

  I.seeResponseCodeIs(200);
});

Scenario('DELETE /cart/:id - Lỗi 404 khi ID không tồn tại', async ({ I }) => {
  const res = await I.sendDeleteRequest('/cart/999999', {
    Authorization: `Bearer ${token}`,
  });

  I.seeResponseCodeIs(404);
});
