Feature('Products & Categories API @api');

// ─── DANH MỤC ───────────────────────────────────────────────────

Scenario('GET /categories - Lấy danh sách danh mục', async ({ I }) => {
  const res = await I.sendGetRequest('/categories');

  I.seeResponseCodeIs(200);

  const json = res.data;
  expect(json).to.be.an('array').that.is.not.empty;
  expect(json[0]).to.have.property('id');
  expect(json[0]).to.have.property('name');
});

// ─── SẢN PHẨM ───────────────────────────────────────────────────

Scenario('GET /products - Lấy danh sách sản phẩm', async ({ I }) => {
  const res = await I.sendGetRequest('/products');

  I.seeResponseCodeIs(200);

  const json = res.data;
  expect(json).to.have.property('data').that.is.an('array');
  expect(json).to.have.property('meta');
  expect(json.meta).to.have.property('total');
});

Scenario('GET /products?keyword=áo - Tìm kiếm theo tên', async ({ I }) => {
  const res = await I.sendGetRequest('/products?keyword=áo');

  I.seeResponseCodeIs(200);

  const json = res.data;
  expect(json).to.have.property('data').that.is.an('array');
});

Scenario('GET /products?category_id=1 - Lọc theo danh mục', async ({ I }) => {
  const res = await I.sendGetRequest('/products?category_id=1');

  I.seeResponseCodeIs(200);

  const json = res.data;
  expect(json).to.have.property('data').that.is.an('array');
});

Scenario('GET /products?gioi_tinh=1 - Lọc theo giới tính Nam', async ({ I }) => {
  const res = await I.sendGetRequest('/products?gioi_tinh=1');

  I.seeResponseCodeIs(200);

  const json = res.data;
  expect(json).to.have.property('data').that.is.an('array');
  json.data.forEach((p) => {
    expect(p.gender).to.equal(1);
  });
});

Scenario('GET /products?page=1 - Phân trang', async ({ I }) => {
  const res = await I.sendGetRequest('/products?page=1');

  I.seeResponseCodeIs(200);

  const json = res.data;
  expect(json.meta).to.have.property('current_page', 1);
});

Scenario('GET /products/:id - Xem chi tiết sản phẩm tồn tại', async ({ I }) => {
  // Lấy ID sản phẩm đầu tiên từ danh sách
  const listRes = await I.sendGetRequest('/products');
  const products = listRes.data.data;
  expect(products.length).to.be.greaterThan(0);
  const productId = products[0].id;

  const res = await I.sendGetRequest(`/products/${productId}`);

  I.seeResponseCodeIs(200);

  const json = res.data;
  expect(json).to.have.property('id', productId);
  expect(json).to.have.property('name');
  expect(json).to.have.property('price');
  expect(json).to.have.property('stock');
});

Scenario('GET /products/:id - Lỗi 404 khi ID không tồn tại', async ({ I }) => {
  const res = await I.sendGetRequest('/products/999999');

  I.seeResponseCodeIs(404);
});

// ─── ĐÁNH GIÁ SẢN PHẨM (public - xem) ─────────────────────────

Scenario('GET /products/:id/reviews - Xem đánh giá sản phẩm', async ({ I }) => {
  const listRes = await I.sendGetRequest('/products');
  const productId = listRes.data.data[0].id;

  const res = await I.sendGetRequest(`/products/${productId}/reviews`);

  I.seeResponseCodeIs(200);

  const json = res.data;
  expect(json).to.be.an('array');
});
