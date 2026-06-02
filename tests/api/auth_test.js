const { expect } = require('chai');

Feature('Auth API @api');

const email = `user_${Date.now()}@gmail.com`;
const password = 'Chi123';

// ─── REGISTER ───────────────────────────────────────────────────

Scenario('POST /register - Status 201 Created', async ({ I }) => {
  const res = await I.sendPostRequest('/register', {
    fullname: 'Nguyễn Chí Trung',
    email,
    phone: '0938019655',
    gender: 'Nam',
    password,
    password_confirmation: password,
  });

  expect(res.status).to.equal(201);
});

Scenario('POST /register - Response có token và user', async ({ I }) => {
  const uniqueEmail = `reg2_${Date.now()}@gmail.com`;
  const res = await I.sendPostRequest('/register', {
    fullname: 'Nguyễn Chí Trung',
    email: uniqueEmail,
    phone: '0938019655',
    gender: 'Nam',
    password,
    password_confirmation: password,
  });

  expect(res.data).to.have.property('token');
  expect(res.data).to.have.property('user');
  expect(res.data.user).to.have.property('email');
});

Scenario('[BUG] POST /register - User có field name', async ({ I }) => {
  const uniqueEmail = `reg3_${Date.now()}@gmail.com`;
  const res = await I.sendPostRequest('/register', {
    fullname: 'Nguyễn Chí Trung',
    email: uniqueEmail,
    phone: '0938019655',
    gender: 'Nam',
    password,
    password_confirmation: password,
  });

  // ❌ controller dùng 'fullname', không phải 'name'
  expect(res.data.user).to.have.property('name');
});

// ─── LOGIN ──────────────────────────────────────────────────────

Scenario('POST /login - Status 200 OK', async ({ I }) => {
  await I.sendPostRequest('/register', {
    fullname: 'Nguyễn Chí Trung',
    email,
    phone: '0938019655',
    gender: 'Nam',
    password,
    password_confirmation: password,
  });

  const res = await I.sendPostRequest('/login', { email, password });

  expect(res.status).to.equal(200);
});

Scenario('POST /login - Đăng nhập thành công và có token', async ({ I }) => {
  const res = await I.sendPostRequest('/login', { email, password });

  expect(res.data.message).to.equal('Đăng nhập thành công');
  expect(res.data.token).to.be.a('string').and.not.empty;
});

Scenario('POST /login - User chỉ trả trường cần thiết', async ({ I }) => {
  const res = await I.sendPostRequest('/login', { email, password });

  const keys = Object.keys(res.data.user);
  const allowed = ['id', 'fullname', 'email', 'phone', 'gender'];
  keys.forEach(k => expect(allowed).to.include(k));
});

// ─── LOGOUT ─────────────────────────────────────────────────────

Scenario('POST /logout - Status 200 OK', async ({ I }) => {
  const loginRes = await I.sendPostRequest('/login', { email, password });
  const token = loginRes.data.token;

  const res = await I.sendPostRequest('/logout', {}, {
    Authorization: `Bearer ${token}`,
  });

  expect(res.status).to.equal(200);
});

Scenario('POST /logout - Message đăng xuất thành công', async ({ I }) => {
  const loginRes = await I.sendPostRequest('/login', { email, password });
  const token = loginRes.data.token;

  const res = await I.sendPostRequest('/logout', {}, {
    Authorization: `Bearer ${token}`,
  });

  expect(res.data.message).to.equal('Đăng xuất thành công');
});

Scenario('[BUG] POST /logout - Response có field user', async ({ I }) => {
  const loginRes = await I.sendPostRequest('/login', { email, password });
  const token = loginRes.data.token;

  const res = await I.sendPostRequest('/logout', {}, {
    Authorization: `Bearer ${token}`,
  });

  // ❌ controller chỉ trả message, không có 'user'
  expect(res.data).to.have.property('user');
});

Scenario('POST /logout - Lỗi 401 khi không có token', async ({ I }) => {
  const res = await I.sendPostRequest('/logout', {});

  expect(res.status).to.equal(401);
});
