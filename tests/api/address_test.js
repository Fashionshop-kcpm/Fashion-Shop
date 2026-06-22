const { expect } = require('chai');

Feature('Address API @api');

let token = '';

Before(async ({ I }) => {
  ({ token } = await I.registerApiUser('addr'));
});

// ─── THÊM ĐỊA CHỈ ─────────────────────────────────────────────────

Scenario('POST /addresses - Status 201 Created', async ({ I }) => {
  const res = await I.sendPostRequest('/addresses',
    { fullname: 'Nguyen Van A', phone: '0987654321', address_details: '123 Le Loi, Quan 1, TP HCM', is_default: true },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.status).to.equal(201);
});

Scenario('POST /addresses - Có message thêm địa chỉ và address object', async ({ I }) => {
  const res = await I.sendPostRequest('/addresses',
    { fullname: 'Nguyen Van A', phone: '0987654321', address_details: '123 Le Loi, Quan 1, TP HCM', is_default: true },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.data.message).to.equal('Đã thêm địa chỉ');
  expect(res.data.address).to.be.an('object');
});

Scenario('[BUG] POST /addresses - Response phải có trường success = true', async ({ I }) => {
  const res = await I.sendPostRequest('/addresses',
    { fullname: 'Nguyen Van A', phone: '0987654321', address_details: '456 Nguyen Hue, Quan 1', is_default: false },
    { Authorization: `Bearer ${token}` }
  );

  // ❌ controller không trả về field 'success'
  expect(res.data).to.have.property('success', true);
});

// ─── XEM DANH SÁCH ĐỊA CHỈ ────────────────────────────────────────

Scenario('GET /addresses - Status 200 OK', async ({ I }) => {
  const res = await I.sendGetRequest('/addresses', {
    Authorization: `Bearer ${token}`,
  });

  expect(res.status).to.equal(200);
});

Scenario('GET /addresses - Body không rỗng', async ({ I }) => {
  const res = await I.sendGetRequest('/addresses', {
    Authorization: `Bearer ${token}`,
  });

  expect(JSON.stringify(res.data).length).to.be.greaterThan(0);
});

Scenario('[BUG] GET /addresses - Response phải có trường message', async ({ I }) => {
  const res = await I.sendGetRequest('/addresses', {
    Authorization: `Bearer ${token}`,
  });

  // ❌ GET /addresses không trả về 'message'
  expect(res.data).to.have.property('message');
});

// ─── ĐẶT LÀM ĐỊA CHỈ MẶC ĐỊNH ─────────────────────────────────────

Scenario('PATCH /addresses/:id/default - Kiểm tra status code phải là 200', async ({ I }) => {
  const id = await I.createAddress(token, 'Test User', '789 ABC St');

  const res = await I.sendPatchRequest(`/addresses/${id}/default`, {}, {
    Authorization: `Bearer ${token}`,
  });

  expect(res.status).to.equal(200);
});

Scenario('PATCH /addresses/:id/default - Kiểm tra response có message và data', async ({ I }) => {
  const id = await I.createAddress(token, 'Test User 2', '321 XYZ Ave');

  const res = await I.sendPatchRequest(`/addresses/${id}/default`, {}, {
    Authorization: `Bearer ${token}`,
  });

  expect(res.data).to.have.property('message');
  expect(res.data).to.have.property('data');
});

// ─── XÓA ĐỊA CHỈ ──────────────────────────────────────────────────

Scenario('DELETE /addresses/:id - Kiểm tra status code phải là 200', async ({ I }) => {
  const id = await I.createAddress(token, 'Delete User', '999 Del St');

  const res = await I.sendDeleteRequest(`/addresses/${id}`, {
    Authorization: `Bearer ${token}`,
  });

  expect(res.status).to.equal(200);
});

Scenario('DELETE /addresses/:id - Kiểm tra response có message', async ({ I }) => {
  const id = await I.createAddress(token, 'Delete User 2', '888 Del Ave');

  const res = await I.sendDeleteRequest(`/addresses/${id}`, {
    Authorization: `Bearer ${token}`,
  });

  expect(res.data).to.have.property('message');
});

Scenario('DELETE /addresses/:id - Response trả về địa chỉ đã xóa', async ({ I }) => {
  const id = await I.createAddress(token, 'Delete User 3', '777 Rem Rd');

  const res = await I.sendDeleteRequest(`/addresses/${id}`, {
    Authorization: `Bearer ${token}`,
  });

  expect(res.data).to.have.property('address');
  expect(res.data.address).to.have.property('id');
  expect(res.data.address).to.have.property('fullname');
});
