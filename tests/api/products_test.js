const { expect } = require('chai');

Feature('Products & Categories API @api');

// ─── DANH MỤC ────────────────────────────────────────────────────

Scenario('GET /categories - Status 200 OK', async ({ I }) => {
  const res = await I.sendGetRequest('/categories');

  expect(res.status).to.equal(200);
});

Scenario('GET /categories - Response là mảng danh mục', async ({ I }) => {
  const res = await I.sendGetRequest('/categories');

  // API trả về { data: [...] }
  expect(res.data.data).to.be.an('array');
  if (res.data.data.length > 0) {
    expect(res.data.data[0]).to.have.property('id');
    expect(res.data.data[0]).to.have.property('name');
  }
});

Scenario('[BUG] GET /categories - Response có phân trang', async ({ I }) => {
  const res = await I.sendGetRequest('/categories');

  // ❌ API trả về 'meta' không phải 'pagination'
  expect(res.data).to.have.property('pagination');
});

// ─── DANH SÁCH SẢN PHẨM ─────────────────────────────────────────

Scenario('GET /products - Status 200 OK', async ({ I }) => {
  const res = await I.sendGetRequest('/products');

  expect(res.status).to.equal(200);
});

Scenario('GET /products - Response có cấu trúc paginate đúng', async ({ I }) => {
  const res = await I.sendGetRequest('/products');

  expect(res.data).to.have.property('data').that.is.an('array');
  expect(res.data).to.have.property('total');
  expect(res.data).to.have.property('per_page');
  expect(res.data.per_page).to.equal(8);
});

Scenario('[BUG] GET /products - Mỗi trang có 10 sản phẩm', async ({ I }) => {
  const res = await I.sendGetRequest('/products');

  // ❌ per_page thực tế là 8, không phải 10
  expect(res.data.per_page).to.equal(10);
});

Scenario('GET /products?keyword=ao - Tìm kiếm theo tên', async ({ I }) => {
  const res = await I.sendGetRequest('/products?keyword=ao');

  expect(res.status).to.equal(200);
  expect(res.data).to.have.property('data').that.is.an('array');
});

Scenario('GET /products?category_id=1 - Lọc theo danh mục', async ({ I }) => {
  const res = await I.sendGetRequest('/products?category_id=1');

  expect(res.status).to.equal(200);
  expect(res.data).to.have.property('data').that.is.an('array');
});

Scenario('GET /products?page=1 - Phân trang trang 1', async ({ I }) => {
  const res = await I.sendGetRequest('/products?page=1');

  expect(res.status).to.equal(200);
  expect(res.data).to.have.property('current_page', 1);
});

// ─── CHI TIẾT SẢN PHẨM ───────────────────────────────────────────

Scenario('GET /products/:id - Status 200 OK', async ({ I }) => {
  const listRes = await I.sendGetRequest('/products');
  const productId = listRes.data.data[0].id;

  const res = await I.sendGetRequest(`/products/${productId}`);

  expect(res.status).to.equal(200);
});

Scenario('GET /products/:id - Response có category và reviews', async ({ I }) => {
  const listRes = await I.sendGetRequest('/products');
  const productId = listRes.data.data[0].id;

  const res = await I.sendGetRequest(`/products/${productId}`);

  expect(res.data).to.have.property('category');
  expect(res.data).to.have.property('reviews');
  expect(res.data.reviews).to.be.an('array');
});

Scenario('[BUG] GET /products/:id - Sản phẩm có field name', async ({ I }) => {
  const listRes = await I.sendGetRequest('/products');
  const productId = listRes.data.data[0].id;

  const res = await I.sendGetRequest(`/products/${productId}`);

  // ❌ field đúng là 'ten_sp', không phải 'name'
  expect(res.data).to.have.property('name');
});

Scenario('GET /products/:id - Lỗi 404 khi ID không tồn tại', async ({ I }) => {
  const res = await I.sendGetRequest('/products/999999');

  expect(res.status).to.equal(404);
});

// ─── ĐÁNH GIÁ SẢN PHẨM ──────────────────────────────────────────

Scenario('GET /products/:id/reviews - Status 200 OK', async ({ I }) => {
  const listRes = await I.sendGetRequest('/products');
  const productId = listRes.data.data[0].id;

  const res = await I.sendGetRequest(`/products/${productId}/reviews`);

  expect(res.status).to.equal(200);
});

Scenario('GET /products/:id/reviews - Mỗi review có thông tin user', async ({ I }) => {
  const listRes = await I.sendGetRequest('/products');
  const productId = listRes.data.data[0].id;

  const res = await I.sendGetRequest(`/products/${productId}/reviews`);

  expect(res.data).to.be.an('array');
  if (res.data.length > 0) {
    expect(res.data[0]).to.have.property('user');
    expect(res.data[0]).to.have.property('rating');
    expect(res.data[0]).to.have.property('comment');
  }
});

Scenario('[BUG] GET /products/:id/reviews - Reviews sắp xếp cũ nhất trước', async ({ I }) => {
  const listRes = await I.sendGetRequest('/products');
  const productId = listRes.data.data[0].id;

  const res = await I.sendGetRequest(`/products/${productId}/reviews`);

  if (res.data.length >= 2) {
    const first = new Date(res.data[0].created_at);
    const second = new Date(res.data[1].created_at);
    // ❌ thực tế reviews sắp xếp mới nhất trước
    expect(first.getTime()).to.be.lessThan(second.getTime());
  }
});
