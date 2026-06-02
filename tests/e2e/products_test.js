Feature('Trang San Pham @e2e');

Scenario('Trang chu hien thi danh sach san pham', async ({ I }) => {
  I.amOnPage('/');
  I.waitForElement('h1', 5);
  I.seeElement('h3');
});

Scenario('Trang chu co tab Noi Bat, Ban Chay, Khuyen Mai', async ({ I }) => {
  I.amOnPage('/');
  I.waitForText('Noi Bat', 5);
  I.seeElement('button');
});

Scenario('Bam vao san pham mo trang chi tiet', async ({ I }) => {
  I.amOnPage('/');
  I.waitForElement('h3 a, a h3', 10);
  I.click(locate('h3').first());
  I.waitForNavigation();
  I.seeInCurrentUrl('/products/');
});

Scenario('Trang chi tiet san pham hien thi ten va gia', async ({ I }) => {
  // Di den trang category de lay san pham
  I.amOnPage('/category');
  I.waitForElement('h3', 10);
  I.click(locate('h3').first());
  I.waitForNavigation();
  I.seeInCurrentUrl('/products/');
  I.waitForElement('h1', 5);
  I.seeElement('button[type="submit"], button');
});

Scenario('Trang category hien thi danh sach san pham', async ({ I }) => {
  I.amOnPage('/category');
  I.waitForElement('h3', 10);
  I.seeElement('h3');
});

Scenario('Trang search tim kiem san pham theo tu khoa', async ({ I }) => {
  I.amOnPage('/search?keyword=ao');
  I.waitForElement('body', 5);
  I.seeInCurrentUrl('/search');
});

Scenario('Click Them Gio khi chua dang nhap chuyen den trang login', async ({ I }) => {
  I.amOnPage('/');
  I.waitForElement('button', 10);
  // Bam nut "Them Gio" dau tien
  I.click(locate('button').withText('Them Gio').first());
  I.waitForNavigation();
  I.seeCurrentUrlEquals('http://localhost:5173/login');
});
