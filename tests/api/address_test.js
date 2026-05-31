const { expect } = require('chai');

Feature('Address API @api');

let token = '';

Before(async ({ I }) => {
  const res = await I.sendPostRequest('/register', {
    fullname: 'Address User',
    email: `addr_${Date.now()}@gmail.com`,
    phone: '0938019655',
    gender: 'Nam',
    password: 'Chi123',
    password_confirmation: 'Chi123',
  });
  token = res.data.token;
});

Scenario('POST /addresses - Them dia chi thanh cong', async ({ I }) => {
  const res = await I.sendPostRequest('/addresses',
    {
      fullname: 'Nguyen Van A',
      phone: '0901234567',
      address_details: '123 Duong Le Loi, P.1, Q.1, TP.HCM',
      is_default: true,
    },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.status).to.equal(201);
  expect(res.data).to.have.property('id');
  expect(res.data).to.have.property('address_details');
});

Scenario('POST /addresses - Loi 422 khi thieu fullname', async ({ I }) => {
  const res = await I.sendPostRequest('/addresses',
    {
      phone: '0901234567',
      address_details: '123 Duong ABC',
    },
    { Authorization: `Bearer ${token}` }
  );

  expect(res.status).to.equal(422);
});

Scenario('POST /addresses - Loi 401 khi khong co token', async ({ I }) => {
  const res = await I.sendPostRequest('/addresses', {
    fullname: 'Test',
    phone: '0901234567',
    address_details: '123 ABC',
  });

  expect(res.status).to.equal(401);
});

Scenario('GET /addresses - Xem danh sach dia chi', async ({ I }) => {
  await I.sendPostRequest('/addresses',
    {
      fullname: 'Nguyen Van A',
      phone: '0901234567',
      address_details: '456 Duong Nguyen Hue, Q.1, TP.HCM',
      is_default: false,
    },
    { Authorization: `Bearer ${token}` }
  );

  const res = await I.sendGetRequest('/addresses', {
    Authorization: `Bearer ${token}`,
  });

  expect(res.status).to.equal(200);
  expect(res.data).to.be.an('array').that.is.not.empty;
  expect(res.data[0]).to.have.property('id');
  expect(res.data[0]).to.have.property('address_details');
});

Scenario('PATCH /addresses/:id/default - Dat dia chi mac dinh', async ({ I }) => {
  const createRes = await I.sendPostRequest('/addresses',
    {
      fullname: 'Test Default',
      phone: '0901234567',
      address_details: '789 Duong Ly Tu Trong, Q.1',
      is_default: false,
    },
    { Authorization: `Bearer ${token}` }
  );
  const id = createRes.data.id;

  const res = await I.sendPatchRequest(`/addresses/${id}/default`, {}, {
    Authorization: `Bearer ${token}`,
  });

  expect(res.status).to.equal(200);
});

Scenario('DELETE /addresses/:id - Xoa dia chi thanh cong', async ({ I }) => {
  const createRes = await I.sendPostRequest('/addresses',
    {
      fullname: 'To Delete',
      phone: '0901234567',
      address_details: '999 Can Xoa',
      is_default: false,
    },
    { Authorization: `Bearer ${token}` }
  );
  const id = createRes.data.id;

  const res = await I.sendDeleteRequest(`/addresses/${id}`, {
    Authorization: `Bearer ${token}`,
  });

  expect(res.status).to.equal(200);
});

Scenario('DELETE /addresses/:id - Loi 404 khi ID khong ton tai', async ({ I }) => {
  const res = await I.sendDeleteRequest('/addresses/999999', {
    Authorization: `Bearer ${token}`,
  });

  expect(res.status).to.equal(404);
});
