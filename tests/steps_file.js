module.exports = function() {
  return actor({
    // Tạo user mới qua API rồi set token vào localStorage (dùng cho E2E tests cần auth)
    loginNewUser: async function() {
      const email = `e2e_${Date.now()}@test.com`;
      const password = 'Chi123';

      await this.sendPostRequest('/register', {
        fullname: 'E2E Test User',
        email,
        phone: '0901234567',
        gender: 'Nam',
        password,
        password_confirmation: password,
      });

      const loginRes = await this.sendPostRequest('/login', { email, password });
      const { token, user } = loginRes.data;

      await this.executeScript(([t, u]) => {
        localStorage.setItem('token', t);
        localStorage.setItem('user', JSON.stringify(u));
      }, [token, user]);

      return { email, password, token };
    },

    // Set auth bằng email/password có sẵn (dùng cho admin hoặc seeded user)
    loginAs: async function(email, password) {
      const loginRes = await this.sendPostRequest('/login', { email, password });
      const { token, user } = loginRes.data;

      await this.executeScript(([t, u]) => {
        localStorage.setItem('token', t);
        localStorage.setItem('user', JSON.stringify(u));
      }, [token, user]);

      return token;
    },

    // Xóa auth khỏi localStorage
    clearAuth: async function() {
      await this.executeScript(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
    },
  });
};
