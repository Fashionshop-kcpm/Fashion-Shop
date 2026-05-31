Feature('Profile API @api');

const testUser = {
  fullname: `Profile User ${Date.now()}`,
  email: `profile_${Date.now()}@example.com`,
  phone: '0912345678',
  gender: 'Nam',
  password: '123456',
  password_confirmation: '123456',
};

let authToken = '';

Before(async ({ I }) => {
  const res = await I.sendPostRequest('/register', testUser);
  const json = await res.data;
  authToken = json.token;
});

Scenario('Lấy profile thành công - có field name', async ({ I }) => {
  I.haveRequestHeaders({ Authorization: `Bearer ${authToken}` });

  const res = await I.sendGetRequest('/profile');

  I.seeResponseCodeIs(200);
  I.seeResponseContainsJson({ name: testUser.fullname });
});

Scenario('Lấy profile thất bại - không có token', async ({ I }) => {
  const res = await I.sendGetRequest('/profile');
  I.seeResponseCodeIs(401);
});
