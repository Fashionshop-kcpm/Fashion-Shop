Feature('Profile API @api');

let token = '';
const profileEmail = `profile_${Date.now()}@test.com`;
const password = '123456';

Before(async ({ I }) => {
  const res = await I.sendPostRequest('/register', {
    fullname: 'Profile User',
    email: profileEmail,
    phone: '0912345678',
    gender: 'Nam',
    password,
    password_confirmation: password,
  });
  token = res.data.token;
});

// ─── XEM PROFILE ────────────────────────────────────────────────

Scenario('GET /profile - Xem thông tin cá nhân', async ({ I }) => {
  const res = await I.sendGetRequest('/profile', {
    Authorization: `Bearer ${token}`,
  });

  I.seeResponseCodeIs(200);

  const json = res.data;
  expect(json).to.have.property('name');
  expect(json).to.have.property('email', profileEmail);
  expect(json).to.have.property('phone');
  expect(json).to.have.property('gender');
});

Scenario('GET /profile - Lỗi 401 khi không có token', async ({ I }) => {
  const res = await I.sendGetRequest('/profile');

  I.seeResponseCodeIs(401);
});

// ─── CẬP NHẬT PROFILE ───────────────────────────────────────────

Scenario('PUT /profile - Cập nhật thông tin thành công', async ({ I }) => {
  const res = await I.sendPutRequest('/profile',
    {
      email: profileEmail,
      phone: '0909999999',
      gender: 'Nữ',
    },
    { Authorization: `Bearer ${token}` }
  );

  I.seeResponseCodeIs(200);
  I.seeResponseContainsJson({ message: 'Cập nhật thành công' });
});

Scenario('PUT /profile - Lỗi 422 khi email không hợp lệ', async ({ I }) => {
  const res = await I.sendPutRequest('/profile',
    {
      email: 'not-an-email',
      phone: '0909999999',
      gender: 'Nam',
    },
    { Authorization: `Bearer ${token}` }
  );

  I.seeResponseCodeIs(422);
});

// ─── ĐỔI MẬT KHẨU ───────────────────────────────────────────────

Scenario('PUT /profile/password - Đổi mật khẩu thành công', async ({ I }) => {
  const res = await I.sendPutRequest('/profile/password',
    {
      old_password: password,
      new_password: 'newpass123',
      new_password_confirmation: 'newpass123',
    },
    { Authorization: `Bearer ${token}` }
  );

  I.seeResponseCodeIs(200);
  I.seeResponseContainsJson({ message: 'Đổi mật khẩu thành công' });
});

Scenario('PUT /profile/password - Lỗi 400 khi sai mật khẩu cũ', async ({ I }) => {
  const res = await I.sendPutRequest('/profile/password',
    {
      old_password: 'wrongpassword',
      new_password: 'newpass123',
      new_password_confirmation: 'newpass123',
    },
    { Authorization: `Bearer ${token}` }
  );

  I.seeResponseCodeIs(400);
  I.seeResponseContainsJson({ message: 'Mật khẩu hiện tại không chính xác' });
});

Scenario('PUT /profile/password - Lỗi 422 khi mật khẩu mới không khớp', async ({ I }) => {
  const res = await I.sendPutRequest('/profile/password',
    {
      old_password: password,
      new_password: 'newpass123',
      new_password_confirmation: 'different123',
    },
    { Authorization: `Bearer ${token}` }
  );

  I.seeResponseCodeIs(422);
});
