exports.config = {
  tests: './api/**/*_test.js',
  output: './output',
  helpers: {
    REST: {
      endpoint: 'http://127.0.0.1:8000/api/v1',
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    },
  },
  include: {
    I: './steps_file.js',
  },
  name: 'FashionShop API Tests',
  timeout: 60,
};
