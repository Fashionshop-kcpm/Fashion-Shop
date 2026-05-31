Feature('Address API @api');

let token = '';
let addressId = null;

Before(async ({ I }) => {
  const res = await I.sendPostRequest('/register', {
    fullname: 'Address User',
    email: `addr_${Date.now()}@test.com`,
    phone: '0912345678',
    gender: 'Nam',
    password: '123456',
    password_confirmation: '123456',
  });
  token = res.data.token;
});

// ─── THÊM ĐỊA CHỈ ───────────────────────────────────────────────

Scenario('POST /addresses - Thêm địa chỉ thành công', async ({ I }) => {
  const res = await I.sendPostRequest('/addresses',
    {
      fullname: 'Nguyễn Văn A',
      phone: '0901234567',
      address_details: '123 Đường Lê Lợi, P.1, Q.1, TP.HCM',
      is_default: true,
    },
    { Authorization: `Bearer ${token}` }
  );

  I.seeResponseCodeIs(201);

  const json = res.data;
  expect(json).to.have.property('id');
  expect(json).to.have.property('address_details');
  addressId = json.id;
});

Scenario('POST /addresses - Lỗi 422 khi thiếu fullname', async ({ I }) => {
  const res = await I.sendPostRequest('/addresses',
    {
      phone: '0901234567',
      address_details: '123 Đường ABC',
    },
    { Authorization: `Bearer ${token}` }
  );

  I.seeResponseCodeIs(422);
});

Scenario('POST /addresses - Lỗi 401 khi không có token', async ({ I }) => {
  const res = await I.sendPostRequest('/addresses', {
    fullname: 'Test',
    phone: '0901234567',
    address_details: '123 ABC',
  });

  I.seeResponseCodeIs(401);
});

// ─── XEM DANH SÁCH ───────────────────────────────────────────────

Scenario('GET /addresses - Xem danh sách địa chỉ', async ({ I }) => {
  // Thêm 1 địa chỉ trước
  await I.sendPostRequest('/addresses',
    {
      fullname: 'Nguyễn Văn A',
      phone: '0901234567',
      address_details: '456 Đường Nguyễn Huệ, Q.1, TP.HCM',
      is_default: false,
    },
    { Authorization: `Bearer ${token}` }
  );

  const res = await I.sendGetRequest('/addresses', {
    Authorization: `Bearer ${token}`,
  });

  I.seeResponseCodeIs(200);

  const json = res.data;
  expect(json).to.be.an('array').that.is.not.empty;
  expect(json[0]).to.have.property('id');
  expect(json[0]).to.have.property('address_details');
});

// ─── ĐẶT MẶC ĐỊNH ────────────────────────────────────────────────

Scenario('PATCH /addresses/:id/default - Đặt địa chỉ mặc định', async ({ I }) => {
  // Tạo địa chỉ mới
  const createRes = await I.sendPostRequest('/addresses',
    {
      fullname: 'Test Default',
      phone: '0901234567',
      address_details: '789 Đường Lý Tự Trọng, Q.1',
      is_default: false,
    },
    { Authorization: `Bearer ${token}` }
  );
  const id = createRes.data.id;

  const res = await I.sendPatchRequest(`/addresses/${id}/default`, {}, {
    Authorization: `Bearer ${token}`,
  });

  I.seeResponseCodeIs(200);
});

// ─── XÓA ĐỊA CHỈ ────────────────────────────────────────────────

Scenario('DELETE /addresses/:id - Xóa địa chỉ thành công', async ({ I }) => {
  // Tạo địa chỉ để xóa
  const createRes = await I.sendPostRequest('/addresses',
    {
      fullname: 'To Delete',
      phone: '0901234567',
      address_details: '999 Đường Cần Xóa',
      is_default: false,
    },
    { Authorization: `Bearer ${token}` }
  );
  const id = createRes.data.id;

  const res = await I.sendDeleteRequest(`/addresses/${id}`, {
    Authorization: `Bearer ${token}`,
  });

  I.seeResponseCodeIs(200);
});

Scenario('DELETE /addresses/:id - Lỗi 404 khi ID không tồn tại', async ({ I }) => {
  const res = await I.sendDeleteRequest('/addresses/999999', {
    Authorization: `Bearer ${token}`,
  });

  I.seeResponseCodeIs(404);
});
