const { expect } = require('chai');

Feature('Reviews & Contacts API @api');

let token = '';
let productId = null;

Before(async ({ I }) => {
  const res = await I.sendPostRequest('/register', {
    fullname: 'Review User',
    email: `review_${Date.now()}@gmail.com`,
    phone: '0938019655',
    gender: 'Nam',
    password: 'Chi123',
    password_confirmation: 'Chi123',
  });
  token = res.data.token;

  const listRes = await I.sendGetRequest('/products');
  productId = listRes.data.data[0].id;
});

Scenario('POST /products/:id/reviews - Viet danh gia thanh cong', async ({ I }) => {
  const res = await I.sendPostRequest(`/products/${productId}/reviews`,
    { rating: 5, comment: 'San pham rat tot, dung size!' },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.status).to.equal(201);
  expect(res.data).to.have.property('id');
  expect(res.data).to.have.property('rating', 5);
  expect(res.data).to.have.property('comment');
});

Scenario('POST /products/:id/reviews - Loi 422 khi rating > 5', async ({ I }) => {
  const res = await I.sendPostRequest(`/products/${productId}/reviews`,
    { rating: 6, comment: 'San pham tot' },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.status).to.equal(422);
});

Scenario('POST /products/:id/reviews - Loi 422 khi thieu comment', async ({ I }) => {
  const res = await I.sendPostRequest(`/products/${productId}/reviews`,
    { rating: 4 },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.status).to.equal(422);
});

Scenario('POST /products/:id/reviews - Loi 401 khi khong co token', async ({ I }) => {
  const res = await I.sendPostRequest(`/products/${productId}/reviews`, {
    rating: 5,
    comment: 'Tot lam',
  });

  expect(res.status).to.equal(401);
});

Scenario('POST /products/:id/reviews - Loi 404 khi san pham khong ton tai', async ({ I }) => {
  const res = await I.sendPostRequest('/products/999999/reviews',
    { rating: 5, comment: 'Test' },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.status).to.equal(404);
});

Scenario('POST /contacts - Gui lien he thanh cong', async ({ I }) => {
  const res = await I.sendPostRequest('/contacts', {
    fullname: 'Nguyen Van A',
    email: 'contact@test.com',
    message: 'Toi muon hoi ve san pham...',
  });

  expect(res.status).to.equal(201);
});

Scenario('POST /contacts - Loi 422 khi thieu message', async ({ I }) => {
  const res = await I.sendPostRequest('/contacts', {
    fullname: 'Test',
    email: 'test@test.com',
  });

  expect(res.status).to.equal(422);
});

Scenario('POST /contacts - Loi 422 khi email khong hop le', async ({ I }) => {
  const res = await I.sendPostRequest('/contacts', {
    fullname: 'Test',
    email: 'not-an-email',
    message: 'Xin chao',
  });

  expect(res.status).to.equal(422);
});
