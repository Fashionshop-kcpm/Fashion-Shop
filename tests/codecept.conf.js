const { setHeadlessWhen } = require('@codeceptjs/configure');

setHeadlessWhen(process.env.HEADLESS);

exports.config = {
  tests: './**/*_test.js',
  output: './output',
  helpers: {
    REST: {
      endpoint: 'http://127.0.0.1:8000/api/v1',
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    },
    Playwright: {
      url: 'http://localhost:5173',
      show: true,
      browser: 'chromium',
    },
  },
  include: {
    I: './steps_file.js',
  },
  name: 'FashionShop Tests',
};
