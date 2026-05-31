Feature('Auth API @api');

const user = {
  fullname: 'Test User',
  email: `test_${Date.now()}@example.com`,
  phone: '0912345678',
  gender: 'Nam',
  password: '123456',
  password_confirmation: '123456',
};

let token = '';

Scenario('Đăng ký thành công và có field name', async ({ I }) => {
  const res = await I.sendPostRequest('/register', user);

  I.seeResponseCodeIs(201);
  I.seeResponseContainsJson({ message: 'Đăng ký thành công' });
  I.seeResponseContainsJson({ user: { name: user.fullname } });
  I.seeResponseContainsJson({ user: { email: user.email } });
});

Scenario('Đăng ký thất bại - email đã tồn tại', async ({ I }) => {
  // Đăng ký lần 1
  await I.sendPostRequest('/register', user);

  // Đăng ký lần 2 cùng email
  const res = await I.sendPostRequest('/register', user);
  I.seeResponseCodeIs(422);
});

Scenario('Đăng nhập thành công', async ({ I }) => {
  // Cần tạo user trước
  await I.sendPostRequest('/register', {
    ...user,
    email: `login_${Date.now()}@example.com`,
  });

  const loginRes = await I.sendPostRequest('/login', {
    email: user.email,
    password: user.password,
  });

  I.seeResponseCodeIs(200);
  I.seeResponseContainsJson({ message: 'Đăng nhập thành công' });
  I.seeResponseContainsJson({ user: { fullname: user.fullname } });
});

Scenario('Đăng nhập thất bại - sai mật khẩu', async ({ I }) => {
  const res = await I.sendPostRequest('/login', {
    email: user.email,
    password: 'wrongpassword',
  });

  I.seeResponseCodeIs(401);
  I.seeResponseContainsJson({ message: 'Email hoặc mật khẩu không chính xác' });
});
