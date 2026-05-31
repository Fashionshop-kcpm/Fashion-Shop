const { expect } = require('chai');

Feature('Profile API @api');

let token = '';
const profileEmail = `profile_${Date.now()}@gmail.com`;
const password = 'Chi123';

Before(async ({ I }) => {
  const res = await I.sendPostRequest('/register', {
    fullname: 'Nguyễn Chí Trung',
    email: profileEmail,
    phone: '0938019655',
    gender: 'Nam',
    password,
    password_confirmation: password,
  });
  token = res.data.token;
});

// ─── VIEW PROFILE ────────────────────────────────────────────────

Scenario('GET /profile - Status 200 OK', async ({ I }) => {
  const res = await I.sendGetRequest('/profile', {
    Authorization: `Bearer ${token}`,
  });

  expect(res.status).to.equal(200);
});

Scenario('GET /profile - Profile có đủ các field', async ({ I }) => {
  const res = await I.sendGetRequest('/profile', {
    Authorization: `Bearer ${token}`,
  });

  expect(res.data).to.have.property('id');
  expect(res.data).to.have.property('fullname');
  expect(res.data).to.have.property('email');
  expect(res.data).to.have.property('phone');
});

Scenario('[BUG] GET /profile - User có field name', async ({ I }) => {
  const res = await I.sendGetRequest('/profile', {
    Authorization: `Bearer ${token}`,
  });

  // ❌ ProfileController trả $request->user() → chỉ có 'fullname', không có 'name'
  expect(res.data).to.have.property('name');
});

// ─── UPDATE PROFILE ──────────────────────────────────────────────

Scenario('PUT /profile - Status 200 OK', async ({ I }) => {
  const res = await I.sendPutRequest('/profile',
    { email: profileEmail, phone: '0901234567', gender: 'Nam' },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.status).to.equal(200);
});

Scenario('PUT /profile - Message cập nhật thành công', async ({ I }) => {
  const res = await I.sendPutRequest('/profile',
    { email: profileEmail, phone: '0901234567', gender: 'Nam' },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.data.message).to.equal('Cập nhật thành công');
});

Scenario('[BUG] PUT /profile - Response trả về user đã cập nhật', async ({ I }) => {
  const res = await I.sendPutRequest('/profile',
    { email: profileEmail, phone: '0901234567', gender: 'Nam' },
    { Authorization: `Bearer ${token}` }
  );

  // ❌ controller chỉ trả message, không có field 'user'
  expect(res.data).to.have.property('user');
});

// ─── CHANGE PASSWORD ─────────────────────────────────────────────

Scenario('PUT /profile/password - Status 200 OK', async ({ I }) => {
  const res = await I.sendPutRequest('/profile/password',
    {
      old_password: password,
      new_password: 'newpass123',
      new_password_confirmation: 'newpass123',
    },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.status).to.equal(200);
});

Scenario('PUT /profile/password - Message đổi mật khẩu thành công', async ({ I }) => {
  const res = await I.sendPutRequest('/profile/password',
    {
      old_password: password,
      new_password: 'newpass123',
      new_password_confirmation: 'newpass123',
    },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.data.message).to.equal('Đổi mật khẩu thành công');
});

Scenario('[BUG] PUT /profile/password - Response trả về token mới', async ({ I }) => {
  const res = await I.sendPutRequest('/profile/password',
    {
      old_password: password,
      new_password: 'newpass123',
      new_password_confirmation: 'newpass123',
    },
    { Authorization: `Bearer ${token}` }
  );

  // ❌ controller chỉ trả message, không cấp token mới
  expect(res.data).to.have.property('token');
});
