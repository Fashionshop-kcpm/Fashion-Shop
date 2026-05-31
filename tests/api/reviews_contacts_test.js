Feature('Reviews & Contacts API @api');

let token = '';
let productId = null;

Before(async ({ I }) => {
  const res = await I.sendPostRequest('/register', {
    fullname: 'Review User',
    email: `review_${Date.now()}@test.com`,
    phone: '0912345678',
    gender: 'Nam',
    password: '123456',
    password_confirmation: '123456',
  });
  token = res.data.token;

  const listRes = await I.sendGetRequest('/products');
  productId = listRes.data.data[0].id;
});

// ─── VIẾT ĐÁNH GIÁ ──────────────────────────────────────────────

Scenario('POST /products/:id/reviews - Viết đánh giá thành công', async ({ I }) => {
  const res = await I.sendPostRequest(`/products/${productId}/reviews`,
    {
      rating: 5,
      comment: 'Sản phẩm rất tốt, đúng size!',
    },
    { Authorization: `Bearer ${token}` }
  );

  I.seeResponseCodeIs(201);

  const json = res.data;
  expect(json).to.have.property('id');
  expect(json).to.have.property('rating', 5);
  expect(json).to.have.property('comment');
});

Scenario('POST /products/:id/reviews - Lỗi 422 khi rating ngoài khoảng 1-5', async ({ I }) => {
  const res = await I.sendPostRequest(`/products/${productId}/reviews`,
    {
      rating: 6,
      comment: 'Sản phẩm tốt',
    },
    { Authorization: `Bearer ${token}` }
  );

  I.seeResponseCodeIs(422);
});

Scenario('POST /products/:id/reviews - Lỗi 422 khi thiếu comment', async ({ I }) => {
  const res = await I.sendPostRequest(`/products/${productId}/reviews`,
    { rating: 4 },
    { Authorization: `Bearer ${token}` }
  );

  I.seeResponseCodeIs(422);
});

Scenario('POST /products/:id/reviews - Lỗi 401 khi không có token', async ({ I }) => {
  const res = await I.sendPostRequest(`/products/${productId}/reviews`, {
    rating: 5,
    comment: 'Tốt lắm',
  });

  I.seeResponseCodeIs(401);
});

Scenario('POST /products/:id/reviews - Lỗi 404 khi sản phẩm không tồn tại', async ({ I }) => {
  const res = await I.sendPostRequest('/products/999999/reviews',
    { rating: 5, comment: 'Test' },
    { Authorization: `Bearer ${token}` }
  );

  I.seeResponseCodeIs(404);
});

// ─── LIÊN HỆ ────────────────────────────────────────────────────

Scenario('POST /contacts - Gửi liên hệ thành công', async ({ I }) => {
  const res = await I.sendPostRequest('/contacts', {
    fullname: 'Nguyễn Văn A',
    email: 'contact@test.com',
    message: 'Tôi muốn hỏi về sản phẩm...',
  });

  I.seeResponseCodeIs(201);
});

Scenario('POST /contacts - Lỗi 422 khi thiếu message', async ({ I }) => {
  const res = await I.sendPostRequest('/contacts', {
    fullname: 'Test',
    email: 'test@test.com',
  });

  I.seeResponseCodeIs(422);
});

Scenario('POST /contacts - Lỗi 422 khi email không hợp lệ', async ({ I }) => {
  const res = await I.sendPostRequest('/contacts', {
    fullname: 'Test',
    email: 'not-an-email',
    message: 'Xin chào',
  });

  I.seeResponseCodeIs(422);
});
