const { expect } = require("chai");

Feature("Profile API @api");

let token = "";
let profileEmail = "";
const password = "Chi123";

Before(async ({ I }) => {
  // Tạo email mới mỗi scenario để tránh duplicate
  profileEmail = `profile_${Date.now()}@gmail.com`;

  const res = await I.sendPostRequest("/register", {
    fullname: "Nguyễn Chí Trung",
    email: profileEmail,
    phone: "0938019655",
    gender: "Nam",
    password,
    password_confirmation: password,
  });
  token = res.data.token;
});

// ─── VIEW PROFILE ────────────────────────────────────────────────

Scenario("GET /profile - Status 200 OK", async ({ I }) => {
  const res = await I.sendGetRequest("/profile", {
    Authorization: `Bearer ${token}`,
  });

  expect(res.status).to.equal(200);
});

Scenario("GET /profile - Profile có đủ các field", async ({ I }) => {
  const res = await I.sendGetRequest("/profile", {
    Authorization: `Bearer ${token}`,
  });

  expect(res.data).to.have.property("id");
  expect(res.data).to.have.property("fullname");
  expect(res.data).to.have.property("email");
  expect(res.data).to.have.property("phone");
});

Scenario("GET /profile - Lỗi 401 khi không có token", async ({ I }) => {
  const res = await I.sendGetRequest("/profile");

  expect(res.status).to.equal(401);
});

// ─── UPDATE PROFILE ──────────────────────────────────────────────

Scenario("PUT /profile - Status 200 OK", async ({ I }) => {
  const res = await I.sendPutRequest(
    "/profile",
    { email: profileEmail, phone: "0901234567", gender: "Nam" },
    { Authorization: `Bearer ${token}` },
  );

  expect(res.status).to.equal(200);
});

Scenario("PUT /profile - Message cập nhật thành công", async ({ I }) => {
  const res = await I.sendPutRequest(
    "/profile",
    { email: profileEmail, phone: "0901234567", gender: "Nam" },
    { Authorization: `Bearer ${token}` },
  );

  expect(res.data.message).to.equal("Cập nhật thành công");
});

Scenario("PUT /profile - Lỗi 422 khi email không hợp lệ", async ({ I }) => {
  const res = await I.sendPutRequest(
    "/profile",
    { email: "not-an-email", phone: "0901234567", gender: "Nam" },
    { Authorization: `Bearer ${token}` },
  );

  expect(res.status).to.equal(422);
});

// ─── CHANGE PASSWORD ─────────────────────────────────────────────

Scenario("PUT /profile/password - Status 200 OK", async ({ I }) => {
  const res = await I.sendPutRequest(
    "/profile/password",
    {
      old_password: password,
      new_password: "newpass123",
      new_password_confirmation: "newpass123",
    },
    { Authorization: `Bearer ${token}` },
  );

  expect(res.status).to.equal(200);
});

Scenario(
  "PUT /profile/password - Message đổi mật khẩu thành công",
  async ({ I }) => {
    const res = await I.sendPutRequest(
      "/profile/password",
      {
        old_password: password,
        new_password: "newpass123",
        new_password_confirmation: "newpass123",
      },
      { Authorization: `Bearer ${token}` },
    );

    expect(res.data.message).to.equal("Đổi mật khẩu thành công");
  },
);

Scenario("PUT /profile/password - Lỗi khi mật khẩu cũ sai", async ({ I }) => {
  const res = await I.sendPutRequest(
    "/profile/password",
    {
      old_password: "wrongpassword",
      new_password: "newpass123",
      new_password_confirmation: "newpass123",
    },
    { Authorization: `Bearer ${token}` },
  );

  expect(res.status).to.not.equal(200);
});

Scenario(
  "PUT /profile/password - Lỗi khi mật khẩu mới không khớp",
  async ({ I }) => {
    const res = await I.sendPutRequest(
      "/profile/password",
      {
        old_password: password,
        new_password: "newpass123",
        new_password_confirmation: "different123",
      },
      { Authorization: `Bearer ${token}` },
    );

    expect(res.status).to.equal(422);
  },
);
