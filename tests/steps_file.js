const ADMIN_EMAIL = 'admin@fashionshop.vn';
// test-only credential, not a production secret
const ADMIN_PASSWORD = process.env.ADMIN_TEST_PASSWORD || 'Admin123456';

module.exports = function steps() {
  return actor({

    // ─── USER AUTH ──────────────────────────────────────────────
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

      // Navigate to app domain FIRST — executeScript cần đúng origin
      this.amOnPage('http://localhost:5173/');
      await this.waitForElement('body', 5);

      await this.executeScript(([t, u]) => {
        localStorage.setItem('token', t);
        localStorage.setItem('user', JSON.stringify(u));
      }, [token, user]);

      this.refreshPage();
      await this.waitForElement('body', 3);

      return { email, password, token };
    },

    loginAs: async function(email, password) {
      const loginRes = await this.sendPostRequest('/login', { email, password });
      const { token, user } = loginRes.data;

      this.amOnPage('http://localhost:5173/');
      await this.waitForElement('body', 5);

      await this.executeScript(([t, u]) => {
        localStorage.setItem('token', t);
        localStorage.setItem('user', JSON.stringify(u));
      }, [token, user]);

      return token;
    },

    clearAuth: async function() {
      // try/catch bên trong script để tránh SecurityError khi browser ở about:blank
      await this.executeScript(() => {
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } catch (e) { /* ignore */ }
      });
    },

    // ─── ADMIN AUTH ─────────────────────────────────────────────
    adminLoginByApi: async function() {
      const loginRes = await this.sendPostRequest('/admin/login', {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });
      const { token, admin } = loginRes.data;

      await this.executeScript(([t, a]) => {
        localStorage.setItem('admin_token', t);
        localStorage.setItem('admin_user', JSON.stringify(a));
      }, [token, admin]);
    },

    clearAdminAuth: async function() {
      await this.executeScript(() => {
        try {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
        } catch (e) { /* ignore */ }
      });
    },

    // Tắt HTML5 native form validation để Zod/react-hook-form xử lý
    disableNativeValidation: async function() {
      await this.executeScript(() => {
        const form = document.querySelector('form');
        if (form) form.noValidate = true;
      });
    },

  });
};
