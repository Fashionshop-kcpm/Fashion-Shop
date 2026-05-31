const { expect } = require('chai');

Feature('Products & Categories API @api');

Scenario('GET /categories - Lay danh sach danh muc', async ({ I }) => {
  const res = await I.sendGetRequest('/categories');

  expect(res.status).to.equal(200);
  expect(res.data).to.be.an('array').that.is.not.empty;
  expect(res.data[0]).to.have.property('id');
  expect(res.data[0]).to.have.property('name');
});

Scenario('GET /products - Lay danh sach san pham', async ({ I }) => {
  const res = await I.sendGetRequest('/products');

  expect(res.status).to.equal(200);
  expect(res.data).to.have.property('data').that.is.an('array');
  expect(res.data).to.have.property('meta');
  expect(res.data.meta).to.have.property('total');
});

Scenario('GET /products?keyword=ao - Tim kiem theo ten', async ({ I }) => {
  const res = await I.sendGetRequest('/products?keyword=ao');

  expect(res.status).to.equal(200);
  expect(res.data).to.have.property('data').that.is.an('array');
});

Scenario('GET /products?category_id=1 - Loc theo danh muc', async ({ I }) => {
  const res = await I.sendGetRequest('/products?category_id=1');

  expect(res.status).to.equal(200);
  expect(res.data).to.have.property('data').that.is.an('array');
});

Scenario('GET /products?gioi_tinh=1 - Loc theo gioi tinh Nam', async ({ I }) => {
  const res = await I.sendGetRequest('/products?gioi_tinh=1');

  expect(res.status).to.equal(200);
  expect(res.data).to.have.property('data').that.is.an('array');
  res.data.data.forEach((p) => {
    expect(p.gender).to.equal(1);
  });
});

Scenario('GET /products?page=1 - Phan trang', async ({ I }) => {
  const res = await I.sendGetRequest('/products?page=1');

  expect(res.status).to.equal(200);
  expect(res.data.meta).to.have.property('current_page', 1);
});

Scenario('GET /products/:id - Xem chi tiet san pham ton tai', async ({ I }) => {
  const listRes = await I.sendGetRequest('/products');
  const products = listRes.data.data;
  expect(products.length).to.be.greaterThan(0);
  const productId = products[0].id;

  const res = await I.sendGetRequest(`/products/${productId}`);

  expect(res.status).to.equal(200);
  expect(res.data).to.have.property('id', productId);
  expect(res.data).to.have.property('name');
  expect(res.data).to.have.property('price');
});

Scenario('GET /products/:id - Loi 404 khi ID khong ton tai', async ({ I }) => {
  const res = await I.sendGetRequest('/products/999999');

  expect(res.status).to.equal(404);
});

Scenario('GET /products/:id/reviews - Xem danh gia san pham', async ({ I }) => {
  const listRes = await I.sendGetRequest('/products');
  const productId = listRes.data.data[0].id;

  const res = await I.sendGetRequest(`/products/${productId}/reviews`);

  expect(res.status).to.equal(200);
  expect(res.data).to.be.an('array');
});
