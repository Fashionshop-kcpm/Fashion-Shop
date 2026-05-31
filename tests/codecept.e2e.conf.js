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
  },
  include: {
    I: './steps_file.js',
  },
  name: 'FashionShop E2E Tests',
};
