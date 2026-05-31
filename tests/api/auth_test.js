Feature('Auth API @api');

// Dùng timestamp để tránh trùng email giữa các lần chạy
const email = `user_${Date.now()}@test.com`;
const password = '123456';

let token = '';

// ─── ĐĂNG KÝ ────────────────────────────────────────────────────

Scenario('POST /register - Đăng ký thành công', async ({ I }) => {
  const res = await I.sendPostRequest('/register', {
    fullname: 'Nguyễn Văn A',
    email,
    phone: '0901234567',
    gender: 'Nam',
    password,
    password_confirmation: password,
  });

  I.seeResponseCodeIs(201);
  I.seeResponseContainsJson({ message: 'Đăng ký thành công' });
  I.seeResponseContainsJson({ user: { name: 'Nguyễn Văn A' } });
  I.seeResponseContainsJson({ user: { email } });

  const json = res.data;
  token = json.token;
});

Scenario('POST /register - Lỗi 422 khi email đã tồn tại', async ({ I }) => {
  // Đăng ký lần 2 cùng email
  await I.sendPostRequest('/register', {
    fullname: 'Test Dup',
    email,
    phone: '0901234567',
    gender: 'Nam',
    password,
    password_confirmation: password,
  });

  const res = await I.sendPostRequest('/register', {
    fullname: 'Test Dup',
    email,
    phone: '0901234567',
    gender: 'Nam',
    password,
    password_confirmation: password,
  });

  I.seeResponseCodeIs(422);
});

Scenario('POST /register - Lỗi 422 khi thiếu field bắt buộc', async ({ I }) => {
  const res = await I.sendPostRequest('/register', {
    email: `missing_${Date.now()}@test.com`,
    password,
    password_confirmation: password,
  });

  I.seeResponseCodeIs(422);
});

Scenario('POST /register - Lỗi 422 khi password không khớp', async ({ I }) => {
  const res = await I.sendPostRequest('/register', {
    fullname: 'Test User',
    email: `mismatch_${Date.now()}@test.com`,
    phone: '0901234567',
    gender: 'Nam',
    password: '123456',
    password_confirmation: 'abcdef',
  });

  I.seeResponseCodeIs(422);
});

// ─── ĐĂNG NHẬP ──────────────────────────────────────────────────

Scenario('POST /login - Đăng nhập thành công', async ({ I }) => {
  // Tạo user mới rồi login
  const loginEmail = `login_${Date.now()}@test.com`;
  await I.sendPostRequest('/register', {
    fullname: 'Login User',
    email: loginEmail,
    phone: '0901234567',
    gender: 'Nam',
    password,
    password_confirmation: password,
  });

  const res = await I.sendPostRequest('/login', {
    email: loginEmail,
    password,
  });

  I.seeResponseCodeIs(200);
  I.seeResponseContainsJson({ message: 'Đăng nhập thành công' });
  I.seeResponseContainsJson({ user: { email: loginEmail } });

  const json = res.data;
  token = json.token;
});

Scenario('POST /login - Lỗi 401 khi sai mật khẩu', async ({ I }) => {
  const res = await I.sendPostRequest('/login', {
    email,
    password: 'wrongpassword',
  });

  I.seeResponseCodeIs(401);
  I.seeResponseContainsJson({ message: 'Email hoặc mật khẩu không chính xác' });
});

Scenario('POST /login - Lỗi 422 khi thiếu email', async ({ I }) => {
  const res = await I.sendPostRequest('/login', {
    password,
  });

  I.seeResponseCodeIs(422);
});

// ─── ĐĂNG XUẤT ──────────────────────────────────────────────────

Scenario('POST /logout - Đăng xuất thành công', async ({ I }) => {
  // Tạo user và lấy token
  const logoutEmail = `logout_${Date.now()}@test.com`;
  const regRes = await I.sendPostRequest('/register', {
    fullname: 'Logout User',
    email: logoutEmail,
    phone: '0901234567',
    gender: 'Nữ',
    password,
    password_confirmation: password,
  });
  const authToken = regRes.data.token;

  const res = await I.sendPostRequest('/logout', {}, {
    Authorization: `Bearer ${authToken}`,
  });

  I.seeResponseCodeIs(200);
  I.seeResponseContainsJson({ message: 'Đăng xuất thành công' });
});

Scenario('POST /logout - Lỗi 401 khi không có token', async ({ I }) => {
  const res = await I.sendPostRequest('/logout', {});

  I.seeResponseCodeIs(401);
});
