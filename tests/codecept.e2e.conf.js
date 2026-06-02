const { setHeadlessWhen } = require('@codeceptjs/configure');

setHeadlessWhen(process.env.HEADLESS);

exports.config = {
  tests: './e2e/**/*_test.js',
  output: './output',
  helpers: {
    Playwright: {
      url: 'http://localhost:5173',
      show: true,
      browser: 'chromium',
    },
    REST: {
      endpoint: 'http://127.0.0.1:8000/api/v1',
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    },
  },
  include: {
    I: './steps_file.js',
  },
  name: 'FashionShop E2E Tests',
};
