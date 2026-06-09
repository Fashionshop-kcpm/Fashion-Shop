const { expect } = require("chai");

Feature("Admin API @api @admin");

// ⚠️ Cần có admin account trong DB trước khi chạy test này
const ADMIN_EMAIL = "admin@fashionshop.vn";
const ADMIN_PASSWORD = "Admin123456";

let adminToken = "";

Before(async ({ I }) => {
  const res = await I.sendPostRequest("/admin/login", {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  adminToken = res.data.token;
});

// ─── ADMIN LOGIN ────────────────────────────────────────────────

Scenario("POST /admin/login - Admin đăng nhập thành công", async ({ I }) => {
  const res = await I.sendPostRequest("/admin/login", {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  expect(res.status).to.equal(200);
  expect(res.data).to.have.property("token");
  expect(res.data).to.have.property("admin");
});

Scenario("POST /admin/login - Lỗi 401 khi sai mật khẩu", async ({ I }) => {
  const res = await I.sendPostRequest("/admin/login", {
    email: ADMIN_EMAIL,
    password: "wrongpass",
  });

  expect(res.status).to.equal(401);
});

Scenario(
  "POST /admin/login - Lỗi khi dùng tài khoản user thường",
  async ({ I }) => {
    const userEmail = `notadmin_${Date.now()}@test.com`;
    await I.sendPostRequest("/register", {
      fullname: "Normal User",
      email: userEmail,
      phone: "0901234567",
      gender: "Nam",
      password: "123456",
      password_confirmation: "123456",
    });

    const res = await I.sendPostRequest("/admin/login", {
      email: userEmail,
      password: "123456",
    });

    expect(res.status).to.not.equal(200);
  },
);

// ─── DASHBOARD ──────────────────────────────────────────────────

Scenario("GET /admin/dashboard - Status 200 OK", async ({ I }) => {
  const res = await I.sendGetRequest("/admin/dashboard", {
    Authorization: `Bearer ${adminToken}`,
  });

  expect(res.status).to.equal(200);
  expect(res.status).to.not.equal(401);
  expect(res.status).to.not.equal(403);
});

Scenario(
  "GET /admin/dashboard - Xem dashboard có dữ liệu thống kê",
  async ({ I }) => {
    const res = await I.sendGetRequest("/admin/dashboard", {
      Authorization: `Bearer ${adminToken}`,
    });

    expect(res.data).to.have.property("total_revenue");
    expect(res.data).to.have.property("total_orders");
    expect(res.data).to.have.property("total_users");
  },
);

Scenario(
  "[BUG] GET /admin/dashboard - Phải trả về có field data",
  async ({ I }) => {
    const res = await I.sendGetRequest("/admin/dashboard", {
      Authorization: `Bearer ${adminToken}`,
    });

    // ❌ API trả về thẳng các field, không wrap trong 'data'
    expect(res.data).to.have.property("data");
  },
);

Scenario("GET /admin/dashboard - Lỗi 401 khi không có token", async ({ I }) => {
  const res = await I.sendGetRequest("/admin/dashboard");

  expect(res.status).to.equal(401);
});

// ─── ADMIN PRODUCTS ──────────────────────────────────────────────

Scenario("GET /admin/products - Status 200 OK", async ({ I }) => {
  const res = await I.sendGetRequest("/admin/products", {
    Authorization: `Bearer ${adminToken}`,
  });

  expect(res.status).to.equal(200);
});

Scenario(
  "GET /admin/products - Định dạng dữ liệu trả về là JSON hợp lệ",
  async ({ I }) => {
    const res = await I.sendGetRequest("/admin/products", {
      Authorization: `Bearer ${adminToken}`,
    });

    expect(res.data).to.have.property("data").that.is.an("array");
  },
);

Scenario(
  "[BUG] GET /admin/products - API phải có cờ success = true",
  async ({ I }) => {
    const res = await I.sendGetRequest("/admin/products", {
      Authorization: `Bearer ${adminToken}`,
    });

    // ❌ API không trả về field 'success'
    expect(res.data).to.have.property("success", true);
  },
);

Scenario(
  "GET /admin/products - Lỗi 403 khi dùng token user thường",
  async ({ I }) => {
    const userRes = await I.sendPostRequest("/register", {
      fullname: "Regular User",
      email: `regular_${Date.now()}@test.com`,
      phone: "0901234567",
      gender: "Nam",
      password: "123456",
      password_confirmation: "123456",
    });
    const userToken = userRes.data.token;

    const res = await I.sendGetRequest("/admin/products", {
      Authorization: `Bearer ${userToken}`,
    });

    expect(res.status).to.equal(403);
  },
);

// NOTE: POST /admin/products (Thêm sản phẩm) và POST /admin/products/:id (Sửa sản phẩm)
// yêu cầu multipart/form-data với file ảnh (hinh_anh) nên không thể test qua REST helper.
// Xem Postman collection để biết cấu trúc request và các BUG liên quan đến flag 'success'.

Scenario("DELETE /admin/products/:id - Xóa sản phẩm thành công", async ({ I }) => {
  const listRes = await I.sendGetRequest("/admin/products", {
    Authorization: `Bearer ${adminToken}`,
  });
  const products = listRes.data.data;

  if (!products || products.length === 0) {
    console.log("Không có sản phẩm để test, bỏ qua");
    return;
  }

  const productId = products[products.length - 1].id;
  const res = await I.sendDeleteRequest(`/admin/products/${productId}`, {
    Authorization: `Bearer ${adminToken}`,
  });

  expect(res.status).to.equal(200);
  expect(res.data).to.have.property("message");
});

Scenario(
  "[BUG] DELETE /admin/products/:id - API phải trả về id của sản phẩm vừa xóa",
  async ({ I }) => {
    const listRes = await I.sendGetRequest("/admin/products", {
      Authorization: `Bearer ${adminToken}`,
    });
    const products = listRes.data.data;

    if (!products || products.length === 0) {
      console.log("Không có sản phẩm để test, bỏ qua");
      return;
    }

    const productId = products[products.length - 1].id;
    const res = await I.sendDeleteRequest(`/admin/products/${productId}`, {
      Authorization: `Bearer ${adminToken}`,
    });

    // ❌ controller không trả về field 'id'
    expect(res.data).to.have.property("id");
  },
);

// ─── ADMIN ORDERS ────────────────────────────────────────────────

Scenario("GET /admin/orders - Xem tất cả đơn hàng", async ({ I }) => {
  const res = await I.sendGetRequest("/admin/orders", {
    Authorization: `Bearer ${adminToken}`,
  });

  expect(res.status).to.equal(200);
  const isArray = Array.isArray(res.data);
  const hasPagination = res.data.hasOwnProperty("data");
  expect(isArray || hasPagination).to.be.true;
});

Scenario(
  "[BUG] GET /admin/orders - Lọc đơn hàng theo status pending (không filter)",
  async ({ I }) => {
    const res = await I.sendGetRequest("/admin/orders", {
      Authorization: `Bearer ${adminToken}`,
    });

    const orders = Array.isArray(res.data) ? res.data : res.data.data;
    if (orders && orders.length > 0) {
      // ❌ request không truyền ?status=pending nhưng test kỳ vọng tất cả là pending
      orders.forEach((o) => {
        expect(o.status).to.equal("pending");
      });
    }
  },
);

Scenario("GET /admin/orders/:id - Order có đầy đủ thông tin", async ({ I }) => {
  const listRes = await I.sendGetRequest("/admin/orders", {
    Authorization: `Bearer ${adminToken}`,
  });
  const orders = Array.isArray(listRes.data) ? listRes.data : listRes.data.data;

  if (!orders || orders.length === 0) {
    console.log("Không có đơn hàng để test, bỏ qua");
    return;
  }

  const orderId = orders[0].id;
  const res = await I.sendGetRequest(`/admin/orders/${orderId}`, {
    Authorization: `Bearer ${adminToken}`,
  });

  expect(res.status).to.equal(200);
  expect(res.data).to.have.property("id");
  expect(res.data).to.have.property("user");
  expect(res.data).to.have.property("details");
  expect(res.data).to.have.property("total");
  expect(res.data).to.have.property("status");
  expect(res.data.details).to.be.an("array");
});

Scenario(
  "GET /admin/orders/:id - Product dùng 'name' không dùng 'ten_sp'",
  async ({ I }) => {
    const listRes = await I.sendGetRequest("/admin/orders", {
      Authorization: `Bearer ${adminToken}`,
    });
    const orders = Array.isArray(listRes.data) ? listRes.data : listRes.data.data;

    if (!orders || orders.length === 0) {
      console.log("Không có đơn hàng để test, bỏ qua");
      return;
    }

    const orderId = orders[0].id;
    const res = await I.sendGetRequest(`/admin/orders/${orderId}`, {
      Authorization: `Bearer ${adminToken}`,
    });

    if (res.data.details && res.data.details.length > 0) {
      res.data.details.forEach((item, i) => {
        expect(item.product, `item ${i}`).to.have.property("name");
        expect(item.product).to.not.have.property("ten_sp");
      });
    }
  },
);

Scenario(
  "PATCH /admin/orders/:id/status - Cập nhật trạng thái đơn hàng",
  async ({ I }) => {
    const listRes = await I.sendGetRequest("/admin/orders", {
      Authorization: `Bearer ${adminToken}`,
    });
    const orders = Array.isArray(listRes.data) ? listRes.data : listRes.data.data;

    if (!orders || orders.length === 0) {
      console.log("Không có đơn hàng để test, bỏ qua");
      return;
    }

    const orderId = orders[0].id;
    const res = await I.sendPatchRequest(
      `/admin/orders/${orderId}/status`,
      { status: "shipping" },
      { Authorization: `Bearer ${adminToken}` },
    );

    expect(res.status).to.equal(200);
    expect(res.data).to.have.property("message");
    expect(res.data).to.have.property("order");
    if (res.data.order) {
      expect(res.data.order.status).to.equal("shipping");
    }
  },
);

// ─── ADMIN USERS ─────────────────────────────────────────────────

Scenario("GET /admin/users - Status 200 OK", async ({ I }) => {
  const res = await I.sendGetRequest("/admin/users", {
    Authorization: `Bearer ${adminToken}`,
  });

  expect(res.status).to.equal(200);
  expect(res.data).to.have.property("data");
});

Scenario(
  "[BUG] GET /admin/users - Phải trả về đúng 20 người dùng",
  async ({ I }) => {
    const res = await I.sendGetRequest("/admin/users", {
      Authorization: `Bearer ${adminToken}`,
    });

    // ❌ số lượng phụ thuộc vào dữ liệu DB, không phải luôn là 20
    expect(res.data.data.length).to.equal(20);
  },
);

Scenario("GET /admin/users/:id - Xem chi tiết người dùng", async ({ I }) => {
  const listRes = await I.sendGetRequest("/admin/users", {
    Authorization: `Bearer ${adminToken}`,
  });
  const users = listRes.data.data || listRes.data;

  if (!users || users.length === 0) {
    console.log("Không có user để test, bỏ qua");
    return;
  }

  const userId = users[0].id;
  const res = await I.sendGetRequest(`/admin/users/${userId}`, {
    Authorization: `Bearer ${adminToken}`,
  });

  expect(res.status).to.equal(200);
});

Scenario(
  "[BUG] GET /admin/users/:id - Response phải có trường message",
  async ({ I }) => {
    const listRes = await I.sendGetRequest("/admin/users", {
      Authorization: `Bearer ${adminToken}`,
    });
    const users = listRes.data.data || listRes.data;

    if (!users || users.length === 0) {
      console.log("Không có user để test, bỏ qua");
      return;
    }

    const userId = users[0].id;
    const res = await I.sendGetRequest(`/admin/users/${userId}`, {
      Authorization: `Bearer ${adminToken}`,
    });

    // ❌ GET /admin/users/:id không trả về field 'message'
    expect(res.data).to.have.property("message");
  },
);

// ─── ADMIN REVIEWS ───────────────────────────────────────────────

Scenario(
  "GET /admin/reviews - Lấy danh sách đánh giá thành công",
  async ({ I }) => {
    const res = await I.sendGetRequest("/admin/reviews", {
      Authorization: `Bearer ${adminToken}`,
    });

    expect(res.status).to.equal(200);
  },
);

Scenario(
  "GET /admin/reviews - Danh sách đánh giá có dữ liệu",
  async ({ I }) => {
    const res = await I.sendGetRequest("/admin/reviews", {
      Authorization: `Bearer ${adminToken}`,
    });

    expect(res.data.data).to.be.an("array");
  },
);

Scenario(
  "[BUG] GET /admin/reviews - Rating không được vượt quá 5",
  async ({ I }) => {
    const res = await I.sendGetRequest("/admin/reviews", {
      Authorization: `Bearer ${adminToken}`,
    });

    if (res.data.data && res.data.data.length > 0) {
      res.data.data.forEach((review) => {
        // ❌ test này kiểm tra rating > 5, nhưng hệ thống chỉ cho phép 1-5
        expect(review.rating).to.be.above(5);
      });
    }
  },
);

Scenario(
  "PATCH /admin/reviews/:id/reply - Phản hồi đánh giá thành công",
  async ({ I }) => {
    const listRes = await I.sendGetRequest("/admin/reviews", {
      Authorization: `Bearer ${adminToken}`,
    });
    const reviews = listRes.data.data;

    if (!reviews || reviews.length === 0) {
      console.log("Không có review để test, bỏ qua");
      return;
    }

    const reviewId = reviews[0].id;
    const res = await I.sendPatchRequest(
      `/admin/reviews/${reviewId}/reply`,
      { shop_reply: "Cam on ban da danh gia san pham cua shop!" },
      { Authorization: `Bearer ${adminToken}` },
    );

    expect(res.status).to.equal(200);
  },
);

Scenario(
  "PATCH /admin/reviews/:id/reply - shop_reply đã được cập nhật",
  async ({ I }) => {
    const listRes = await I.sendGetRequest("/admin/reviews", {
      Authorization: `Bearer ${adminToken}`,
    });
    const reviews = listRes.data.data;

    if (!reviews || reviews.length === 0) {
      console.log("Không có review để test, bỏ qua");
      return;
    }

    const reviewId = reviews[0].id;
    const res = await I.sendPatchRequest(
      `/admin/reviews/${reviewId}/reply`,
      { shop_reply: "Cam on quy khach!" },
      { Authorization: `Bearer ${adminToken}` },
    );

    expect(res.data.shop_reply).to.not.be.null;
  },
);

Scenario(
  "[BUG] PATCH /admin/reviews/:id/reply - Response phải trả về id của đánh giá",
  async ({ I }) => {
    const listRes = await I.sendGetRequest("/admin/reviews", {
      Authorization: `Bearer ${adminToken}`,
    });
    const reviews = listRes.data.data;

    if (!reviews || reviews.length === 0) {
      console.log("Không có review để test, bỏ qua");
      return;
    }

    const reviewId = reviews[0].id;
    const res = await I.sendPatchRequest(
      `/admin/reviews/${reviewId}/reply`,
      { shop_reply: "Test reply" },
      { Authorization: `Bearer ${adminToken}` },
    );

    // ❌ controller không trả về field 'id'
    expect(res.data).to.have.property("id");
  },
);

Scenario(
  "DELETE /admin/reviews/:id - Xóa đánh giá thành công",
  async ({ I }) => {
    const listRes = await I.sendGetRequest("/admin/reviews", {
      Authorization: `Bearer ${adminToken}`,
    });
    const reviews = listRes.data.data;

    if (!reviews || reviews.length === 0) {
      console.log("Không có review để test, bỏ qua");
      return;
    }

    const reviewId = reviews[reviews.length - 1].id;
    const res = await I.sendDeleteRequest(`/admin/reviews/${reviewId}`, {
      Authorization: `Bearer ${adminToken}`,
    });

    expect(res.status).to.equal(200);
    expect(res.data).to.have.property("message");
  },
);

Scenario(
  "[BUG] DELETE /admin/reviews/:id - Review đã xóa không còn tồn tại",
  async ({ I }) => {
    const listRes = await I.sendGetRequest("/admin/reviews", {
      Authorization: `Bearer ${adminToken}`,
    });
    const reviews = listRes.data.data;

    if (!reviews || reviews.length === 0) {
      console.log("Không có review để test, bỏ qua");
      return;
    }

    const reviewId = reviews[reviews.length - 1].id;
    const res = await I.sendDeleteRequest(`/admin/reviews/${reviewId}`, {
      Authorization: `Bearer ${adminToken}`,
    });

    // ❌ controller không trả về field 'data'
    expect(res.data).to.have.property("data");
    expect(res.data.data).to.not.be.null;
  },
);

// ─── ADMIN CONTACTS ──────────────────────────────────────────────

Scenario(
  "GET /admin/contacts - Lấy danh sách liên hệ thành công",
  async ({ I }) => {
    const res = await I.sendGetRequest("/admin/contacts", {
      Authorization: `Bearer ${adminToken}`,
    });

    expect(res.status).to.equal(200);
  },
);

Scenario(
  "GET /admin/contacts - Mỗi liên hệ có đủ trường bắt buộc",
  async ({ I }) => {
    const res = await I.sendGetRequest("/admin/contacts", {
      Authorization: `Bearer ${adminToken}`,
    });

    const contacts = res.data.data || res.data;
    if (Array.isArray(contacts) && contacts.length > 0) {
      contacts.forEach((contact) => {
        expect(contact).to.have.property("fullname");
        expect(contact).to.have.property("email");
        expect(contact).to.have.property("message");
        expect(contact).to.have.property("status");
      });
    }
  },
);

Scenario(
  "[BUG] GET /admin/contacts - Tất cả liên hệ phải có trạng thái closed",
  async ({ I }) => {
    const res = await I.sendGetRequest("/admin/contacts", {
      Authorization: `Bearer ${adminToken}`,
    });

    const contacts = res.data.data || res.data;
    if (Array.isArray(contacts)) {
      contacts.forEach((contact) => {
        // ❌ contacts có nhiều trạng thái, không phải tất cả đều 'closed'
        expect(contact.status).to.equal("closed");
      });
    }
  },
);

Scenario(
  "PATCH /admin/contacts/:id/status - Cập nhật trạng thái liên hệ",
  async ({ I }) => {
    const listRes = await I.sendGetRequest("/admin/contacts", {
      Authorization: `Bearer ${adminToken}`,
    });
    const contacts = listRes.data.data || listRes.data;

    if (!contacts || contacts.length === 0) {
      console.log("Không có liên hệ để test, bỏ qua");
      return;
    }

    const contactId = contacts[0].id;
    const res = await I.sendPatchRequest(
      `/admin/contacts/${contactId}/status`,
      { status: "read" },
      { Authorization: `Bearer ${adminToken}` },
    );

    expect(res.status).to.equal(200);
  },
);

Scenario(
  "PATCH /admin/contacts/:id/status - Response có message xác nhận",
  async ({ I }) => {
    const listRes = await I.sendGetRequest("/admin/contacts", {
      Authorization: `Bearer ${adminToken}`,
    });
    const contacts = listRes.data.data || listRes.data;

    if (!contacts || contacts.length === 0) {
      console.log("Không có liên hệ để test, bỏ qua");
      return;
    }

    const contactId = contacts[0].id;
    const res = await I.sendPatchRequest(
      `/admin/contacts/${contactId}/status`,
      { status: "read" },
      { Authorization: `Bearer ${adminToken}` },
    );

    expect(res.data.message).to.be.a("string").and.have.lengthOf.above(0);
  },
);

Scenario(
  "[BUG] PATCH /admin/contacts/:id/status - Message phải là tiếng Anh",
  async ({ I }) => {
    const listRes = await I.sendGetRequest("/admin/contacts", {
      Authorization: `Bearer ${adminToken}`,
    });
    const contacts = listRes.data.data || listRes.data;

    if (!contacts || contacts.length === 0) {
      console.log("Không có liên hệ để test, bỏ qua");
      return;
    }

    const contactId = contacts[0].id;
    const res = await I.sendPatchRequest(
      `/admin/contacts/${contactId}/status`,
      { status: "read" },
      { Authorization: `Bearer ${adminToken}` },
    );

    // ❌ controller trả về tiếng Việt, không phải tiếng Anh
    expect(res.data.message).to.equal("Status updated successfully");
  },
);

// ─── ADMIN LOGOUT ────────────────────────────────────────────────

Scenario("POST /admin/logout - Đăng xuất thành công", async ({ I }) => {
  const res = await I.sendPostRequest(
    "/admin/logout",
    {},
    {
      Authorization: `Bearer ${adminToken}`,
    },
  );

  expect(res.status).to.equal(200);
});

Scenario("POST /admin/logout - Message đăng xuất thành công", async ({ I }) => {
  const loginRes = await I.sendPostRequest("/admin/login", {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  const freshToken = loginRes.data.token;

  const res = await I.sendPostRequest(
    "/admin/logout",
    {},
    {
      Authorization: `Bearer ${freshToken}`,
    },
  );

  expect(res.data.message).to.equal("Đã đăng xuất");
});

Scenario(
  "[BUG] POST /admin/logout - Token phải bị vô hiệu hóa sau khi đăng xuất",
  async ({ I }) => {
    const loginRes = await I.sendPostRequest("/admin/login", {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    const freshToken = loginRes.data.token;

    const res = await I.sendPostRequest(
      "/admin/logout",
      {},
      {
        Authorization: `Bearer ${freshToken}`,
      },
    );

    // ❌ controller không trả về field 'token_revoked'
    expect(res.data).to.have.property("token_revoked");
    expect(res.data.token_revoked).to.equal(true);
  },
);
