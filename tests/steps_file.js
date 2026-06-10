const ADMIN_EMAIL = 'admin@fashionshop.vn';
const ADMIN_PASSWORD = process.env.ADMIN_TEST_PASSWORD || 'Admin123456';

module.exports = function steps() {
  return actor({

    // ─── USER AUTH ──────────────────────────────────────────────
    loginNewUser: async function () {
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

      this.amOnPage('http://localhost:5173/');
      await this.waitForElement('body', 10);

      await this.executeScript(([t, u]) => {
        localStorage.setItem('token', t);
        localStorage.setItem('user', JSON.stringify(u));
      }, [token, user]);

      this.refreshPage();
      await this.waitForElement('body', 10);

      return { email, password, token };
    },

    // ─── LOGIN USER EXISTING ───────────────────────────────────
    loginAs: async function (email, password) {
      const loginRes = await this.sendPostRequest('/login', { email, password });
      const { token, user } = loginRes.data;

      this.amOnPage('http://localhost:5173/');
      await this.waitForElement('body', 10);

      await this.executeScript(([t, u]) => {
        localStorage.setItem('token', t);
        localStorage.setItem('user', JSON.stringify(u));
      }, [token, user]);

      this.refreshPage();
      await this.waitForElement('body', 10);

      return token;
    },

    // ─── CLEAR USER AUTH ────────────────────────────────────────
    clearAuth: async function () {
  this.amOnPage('http://localhost:5173/');

  await this.waitForElement('body', 10);

  await this.executeScript(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
  });
},

    // ─── ADMIN LOGIN ────────────────────────────────────────────
    adminLoginByApi: async function () {
      const loginRes = await this.sendPostRequest('/admin/login', {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });

      const { token, admin } = loginRes.data;

      this.amOnPage('http://localhost:5174/');
      await this.waitForElement('body', 10);

      await this.executeScript(([t, a]) => {
        localStorage.setItem('admin_token', t);
        localStorage.setItem('admin_user', JSON.stringify(a));
}, [token, admin]);

      this.refreshPage();
      await this.waitForElement('body', 10);
    },

    // ─── CLEAR ADMIN AUTH ───────────────────────────────────────
   clearAdminAuth: async function () {
  this.amOnPage('http://localhost:5174/');

  await this.waitForElement('body', 10);

  await this.executeScript(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    sessionStorage.clear();
  });
},

    // ─── DISABLE VALIDATION ────────────────────────────────────
    disableNativeValidation: async function () {
      await this.executeScript(() => {
        const form = document.querySelector('form');
        if (form) form.noValidate = true;
      });
    },

  });
};