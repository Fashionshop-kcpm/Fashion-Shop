const { expect } = require('chai');

Feature('Admin API @api @admin');

// ⚠️ Cần có admin account trong DB trước khi chạy test này
const ADMIN_EMAIL = 'admin@fashionshop.vn';
const ADMIN_PASSWORD = 'Admin@123456';

let adminToken = '';

Before(async ({ I }) => {
  const res = await I.sendPostRequest('/admin/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  adminToken = res.data.token;
});

// ─── ADMIN LOGIN ────────────────────────────────────────────────

Scenario('POST /admin/login - Admin đăng nhập thành công', async ({ I }) => {
  const res = await I.sendPostRequest('/admin/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  expect(res.status).to.equal(200);
  expect(res.data).to.have.property('token');
  expect(res.data).to.have.property('admin');
});

Scenario('POST /admin/login - Lỗi 401 khi sai mật khẩu', async ({ I }) => {
  const res = await I.sendPostRequest('/admin/login', {
    email: ADMIN_EMAIL,
    password: 'wrongpass',
  });

  expect(res.status).to.equal(401);
});

Scenario('POST /admin/login - Lỗi khi dùng tài khoản user thường', async ({ I }) => {
  const userEmail = `notadmin_${Date.now()}@test.com`;
  await I.sendPostRequest('/register', {
    fullname: 'Normal User',
    email: userEmail,
    phone: '0901234567',
    gender: 'Nam',
    password: '123456',
    password_confirmation: '123456',
  });

  const res = await I.sendPostRequest('/admin/login', {
    email: userEmail,
    password: '123456',
  });

  expect(res.status).to.not.equal(200);
});

// ─── DASHBOARD ──────────────────────────────────────────────────

Scenario('GET /admin/dashboard - Xem dashboard', async ({ I }) => {
  const res = await I.sendGetRequest('/admin/dashboard', {
    Authorization: `Bearer ${adminToken}`,
  });

  expect(res.status).to.equal(200);
  expect(res.data).to.have.property('total_revenue');
  expect(res.data).to.have.property('total_orders');
  expect(res.data).to.have.property('total_users');
});

Scenario('GET /admin/dashboard - Lỗi 401 khi không có token', async ({ I }) => {
  const res = await I.sendGetRequest('/admin/dashboard');

  expect(res.status).to.equal(401);
});

// ─── ADMIN PRODUCTS ──────────────────────────────────────────────

Scenario('GET /admin/products - Xem danh sách sản phẩm', async ({ I }) => {
  const res = await I.sendGetRequest('/admin/products', {
    Authorization: `Bearer ${adminToken}`,
  });

  expect(res.status).to.equal(200);
  expect(res.data).to.have.property('data').that.is.an('array');
  expect(res.data).to.have.property('meta');
});

Scenario('GET /admin/products - Lỗi 403 khi dùng token user thường', async ({ I }) => {
  const userRes = await I.sendPostRequest('/register', {
    fullname: 'Regular User',
    email: `regular_${Date.now()}@test.com`,
    phone: '0901234567',
    gender: 'Nam',
    password: '123456',
    password_confirmation: '123456',
  });
  const userToken = userRes.data.token;

  const res = await I.sendGetRequest('/admin/products', {
    Authorization: `Bearer ${userToken}`,
  });

  expect(res.status).to.equal(403);
});

// ─── ADMIN ORDERS ────────────────────────────────────────────────

Scenario('GET /admin/orders - Xem tất cả đơn hàng', async ({ I }) => {
  const res = await I.sendGetRequest('/admin/orders', {
    Authorization: `Bearer ${adminToken}`,
  });

  expect(res.status).to.equal(200);
  expect(res.data).to.have.property('data').that.is.an('array');
});

Scenario('PATCH /admin/orders/:id/status - Cập nhật trạng thái đơn hàng', async ({ I }) => {
  const listRes = await I.sendGetRequest('/admin/orders', {
    Authorization: `Bearer ${adminToken}`,
  });
  const orders = listRes.data.data;

  if (!orders || orders.length === 0) {
    console.log('Không có đơn hàng để test, bỏ qua');
    return;
  }

  const orderId = orders[0].id;
  const res = await I.sendPatchRequest(`/admin/orders/${orderId}/status`,
    { status: 'Đang giao' },
    { Authorization: `Bearer ${adminToken}` }
  );

  expect(res.status).to.equal(200);
});

// ─── ADMIN USERS ─────────────────────────────────────────────────

Scenario('GET /admin/users - Xem danh sách người dùng', async ({ I }) => {
  const res = await I.sendGetRequest('/admin/users', {
    Authorization: `Bearer ${adminToken}`,
  });

  expect(res.status).to.equal(200);
  expect(res.data).to.be.an('array');
});

Scenario('GET /admin/users/:id - Xem chi tiết người dùng', async ({ I }) => {
  const listRes = await I.sendGetRequest('/admin/users', {
    Authorization: `Bearer ${adminToken}`,
  });
  const users = listRes.data;

  if (!users || users.length === 0) {
    console.log('Không có user để test, bỏ qua');
    return;
  }

  const userId = users[0].id;
  const res = await I.sendGetRequest(`/admin/users/${userId}`, {
    Authorization: `Bearer ${adminToken}`,
  });

  expect(res.status).to.equal(200);
  expect(res.data).to.have.property('id', userId);
  expect(res.data).to.have.property('fullname');
  expect(res.data).to.have.property('email');
});

// ─── ADMIN REVIEWS ───────────────────────────────────────────────

Scenario('GET /admin/reviews - Xem tất cả đánh giá', async ({ I }) => {
  const res = await I.sendGetRequest('/admin/reviews', {
    Authorization: `Bearer ${adminToken}`,
  });

  expect(res.status).to.equal(200);
  expect(res.data).to.be.an('array');
});

Scenario('PATCH /admin/reviews/:id/reply - Phản hồi đánh giá', async ({ I }) => {
  const listRes = await I.sendGetRequest('/admin/reviews', {
    Authorization: `Bearer ${adminToken}`,
  });
  const reviews = listRes.data;

  if (!reviews || reviews.length === 0) {
    console.log('Không có review để test, bỏ qua');
    return;
  }

  const reviewId = reviews[0].id;
  const res = await I.sendPatchRequest(`/admin/reviews/${reviewId}/reply`,
    { reply: 'Cảm ơn bạn đã đánh giá sản phẩm!' },
    { Authorization: `Bearer ${adminToken}` }
  );

  expect(res.status).to.equal(200);
});

// ─── ADMIN CONTACTS ──────────────────────────────────────────────

Scenario('GET /admin/contacts - Xem danh sách liên hệ', async ({ I }) => {
  const res = await I.sendGetRequest('/admin/contacts', {
    Authorization: `Bearer ${adminToken}`,
  });

  expect(res.status).to.equal(200);
  expect(res.data).to.be.an('array');
});

Scenario('PATCH /admin/contacts/:id/status - Cập nhật trạng thái liên hệ', async ({ I }) => {
  const listRes = await I.sendGetRequest('/admin/contacts', {
    Authorization: `Bearer ${adminToken}`,
  });
  const contacts = listRes.data;

  if (!contacts || contacts.length === 0) {
    console.log('Không có liên hệ để test, bỏ qua');
    return;
  }

  const contactId = contacts[0].id;
  const res = await I.sendPatchRequest(`/admin/contacts/${contactId}/status`,
    { status: 'read' },
    { Authorization: `Bearer ${adminToken}` }
  );

  expect(res.status).to.equal(200);
});

// ─── ADMIN LOGOUT ────────────────────────────────────────────────

Scenario('POST /admin/logout - Admin đăng xuất thành công', async ({ I }) => {
  const res = await I.sendPostRequest('/admin/logout', {}, {
    Authorization: `Bearer ${adminToken}`,
  });

  expect(res.status).to.equal(200);
});
