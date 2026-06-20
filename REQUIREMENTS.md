# FashionShop — Yêu cầu hệ thống (Requirements)

## Actors

| Actor | Mô tả |
|---|---|
| **Guest** | Khách chưa đăng nhập |
| **User** | Khách hàng đã đăng nhập |
| **Admin** | Quản trị viên |

---

## Guest — Khách chưa đăng nhập

### Được phép

| ID | Yêu cầu |
|---|---|
| G-01 | Xem trang chủ: sản phẩm Nổi Bật, Bán Chạy, Khuyến Mãi (3 tab):

        - Khách có thể xem trang chủ để tham khảo các sản phẩm nổi bật, bán chạy và khuyến mãi.
        - Hệ thống hiển thị danh sách sản phẩm theo từng nhóm và hỗ trợ phân trang khi số lượng sản phẩm lớn.
        - hệ thống cung cấp thông tin tổng số sản phẩm hệ thống ghi nhận các bộ lọc được áp dụng khi lấy dữ liệu.
        - sản phẩm có thể được hiển thị theo danh mục lọc. |


| G-02 | Duyệt sản phẩm theo danh mục (Quần Tây, Jean, Kaki, Short, Polo, Sơ Mi, Khoác):

        - Khách có thể xem danh sách sản phẩm theo từng danh mục để dễ dàng tìm kiếm và lựa chọn sản phẩm phù hợp.
        - Hệ thống hỗ trợ hiển thị danh sách sản phẩm theo danh mục và phân trang khi số lượng sản phẩm lớn.
        - Hệ thống hỗ trợ phân trang danh sách sản phẩm, hệ thống trả về thông tin phản hồi khi xử lý yêu cầu. |


| G-03 | Lọc sản phẩm theo giới tính (Nam / Nữ): 

        - Khách chưa đăng nhập có thể lọc danh sách sản phẩm theo giới tính Nam hoặc Nữ để tìm sản phẩm phù hợp.
        - Hệ thống trả về danh sách sản phẩm.
        - Sản phẩm được phân loại theo giới tính. |


| G-04 | Tìm kiếm sản phẩm theo tên: 

        - Khách chưa đăng nhập có thể tìm kiếm sản phẩm bằng cách nhập tên hoặc từ khóa liên quan đến sản phẩm.
        - Hệ thống trả về danh sách sản phẩm phù hợp. |


| G-05 | Xem trang chi tiết sản phẩm (hình ảnh, mô tả, giá, kích cỡ):

        - Khách có thể xem thông tin chi tiết của sản phẩm trước khi mua hàng.
        - Thông tin hiển thị bao gồm tên sản phẩm, danh mục, kích cỡ, hình ảnh, mô tả, giá bán và các đánh giá của khách hàng.
        - Một sản phẩm có thể có nhiều đánh giá, kích cỡ. |


| G-06 | Xem điểm rating trung bình và bình luận của sản phẩm: 

        - Khách chưa đăng nhập có thể xem điểm đánh giá trung bình (rating) và danh sách bình luận của một sản phẩm để tham khảo trước khi mua hàng. |


| G-07 | Đăng ký tài khoản (họ tên, email, SĐT, giới tính, mật khẩu):

        - Khách chưa đăng nhập có thể đăng ký tài khoản mới bằng cách cung cấp đầy đủ thông tin cá nhân gồm họ tên, email, số điện thoại, giới tính và mật khẩu.
        - Hệ thống cấp thông tin xác thực sau khi đăng ký, hệ thống trả về thông tin tài khoản vừa tạo, tài khoản được tạo bằng email đã đăng ký.
        - Sau khi đăng ký thành công, hệ thống tạo tài khoản mới và cho phép người dùng sử dụng tài khoản để truy cập các chức năng dành cho khách hàng. |


| G-08 | Đăng nhập bằng email + mật khẩu: 

        - Khách đã có tài khoản có thể đăng nhập vào hệ thống bằng email và mật khẩu đã đăng ký.
        - Sau khi đăng nhập thành công, hệ thống xác thực người dùng và cấp quyền truy cập vào các chức năng dành cho khách hàng.
        - Hệ thống trả về thông tin, tài khoản người dùng đã đăng nhập. |


| G-09 | Gửi form liên hệ (họ tên, email, nội dung):

        - Khách có thể gửi thông tin liên hệ đến cửa hàng thông qua biểu mẫu liên hệ.
        - Hệ thống kiểm tra tính hợp lệ của email khi gửi liên hệ.
        - Thông tin gửi bao gồm họ tên, email và nội dung liên hệ để cửa hàng tiếp nhận và phản hồi. |


### Bị chặn (redirect về trang login)

| ID | Yêu cầu |
|---|---|
| G-10 | Thêm sản phẩm vào giỏ hàng |
| G-11 | Xem giỏ hàng |
| G-12 | Tiến hành thanh toán |
| G-13 | Xem lịch sử đơn hàng |
| G-14 | Viết đánh giá sản phẩm |
| G-15 | Xem hồ sơ cá nhân và địa chỉ giao hàng |

---

## User — Khách hàng đã đăng nhập

### Tài khoản & Hồ sơ

| ID | Yêu cầu |
|---|---|
| U-01 | Xem và cập nhật thông tin cá nhân (họ tên, SĐT, giới tính):

        - Người dùng có thể xem và cập nhật thông tin cá nhân của mình, bao gồm họ tên, số điện thoại và giới tính.
        - Sau khi cập nhật thành công, hệ thống lưu thay đổi và thông báo kết quả và trạng thái cho người dùng. |


| U-02 | Đổi mật khẩu (nhập mật khẩu cũ, mật khẩu mới, xác nhận):

        - Người dùng có thể thay đổi mật khẩu tài khoản bằng cách nhập mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu mới.
        - Sau khi đổi mật khẩu thành công, hệ thống cập nhật mật khẩu mới và thông báo kết quả cho người dùng. |


| U-03 | Xem danh sách địa chỉ giao hàng đã lưu: 

        - Người dùng có thể xem danh sách địa chỉ giao hàng đã lưu của mình.
        - Hệ thống hiển thị thông tin từng địa chỉ bao gồm: mã địa chỉ, họ tên người nhận, số điện thoại, địa chỉ chi tiết và trạng thái mặc định.
        - Danh sách trả về có tổng số lượng địa chỉ tương ứng với số bản ghi thực tế.  |


| U-04 | Thêm địa chỉ giao hàng mới: 

        - Người dùng có thể thêm mới một địa chỉ giao hàng vào hệ thống.
        - Sau khi thêm thành công, hệ thống lưu lại thông tin địa chỉ vừa tạo và trả về kết quả xác nhận.
        - Địa chỉ mới mặc định không được đặt là địa chỉ chính.  |


| U-05 | Xóa địa chỉ giao hàng: 

        - Người dùng có thể xóa một địa chỉ giao hàng đã lưu trong hệ thống.
        - Sau khi xóa thành công, hệ thống trả về thông tin xác nhận và thông tin của địa chỉ vừa bị xóa.
        - Địa chỉ đã xóa không được còn trạng thái mặc định. |


| U-06 | Đặt một địa chỉ làm mặc định:

        - Người dùng có thể chọn một địa chỉ giao hàng và đặt làm địa chỉ mặc định trong hệ thống.
        - Hệ thống trả về thông tin địa chỉ sau khi cập nhật(id, user_id, fullname, phone, address_details, is_default)
        - Khi thao tác thành công, hệ thống cập nhật lại trạng thái mặc định của địa chỉ được chọn và đảm bảo chỉ tồn tại một địa chỉ mặc định tại một thời điểm.  |


| U-07 | Đăng xuất:  

        - Người dùng có thể đăng xuất khỏi hệ thống để kết thúc phiên làm việc hiện tại.
        - Sau khi đăng xuất thành công, hệ thống hủy phiên đăng nhập và thông báo kết quả cho người dùng. |


### Mua sắm

| ID | Yêu cầu |
|---|---|
| U-08 | Tất cả quyền của Guest (G-01 → G-09) |
| U-09 | Thêm sản phẩm vào giỏ hàng (chọn size S/M/L/XL và số lượng):

        - Người dùng đã đăng nhập có thể thêm sản phẩm vào giỏ hàng bằng cách chọn kích cỡ (S/M/L/XL) và số lượng mong muốn trước khi mua hàng.
        - Hệ thống kiểm tra tính hợp lệ của thông tin được chọn trước khi thêm vào giỏ hàng.
        - Hệ thống trả về kết quả xử lý yêu cầu. |


| U-10 | Xem giỏ hàng: danh sách sản phẩm, size, số lượng, giá, tổng tiền:

        - Người dùng có thể xem toàn bộ sản phẩm đã thêm vào giỏ hàng trước khi thanh toán.
        - Hệ thống hiển thị thông tin sản phẩm, kích cỡ, số lượng và tổng tiền của giỏ hàng.
        - Số lượng sản phẩm trong giỏ phải hợp lệ. |


| U-11 | Cập nhật số lượng sản phẩm trong giỏ:

        - Người dùng có thể thay đổi số lượng của sản phẩm đã thêm trong giỏ hàng.
        - Sau khi cập nhật thành công, hệ thống phải cập nhật lại thông tin giỏ hàng và tổng tiền tương ứng. |


| U-12 | Xóa một sản phẩm khỏi giỏ: 

        - Người dùng có thể xóa một sản phẩm đã thêm trong giỏ hàng khi không còn nhu cầu mua sản phẩm đó.
        - Sau khi xóa thành công, hệ thống cập nhật lại giỏ hàng và trả về thông tin xác nhận.
        - Hệ thống trả về thông tin sản phẩm/giỏ hàng đã bị xóa. |


### Thanh toán & Đơn hàng

| ID | Yêu cầu |
|---|---|
| U-13 | Điền thông tin giao hàng (họ tên, SĐT, địa chỉ) hoặc chọn từ địa chỉ đã lưu:

        - Người dùng có thể nhập thông tin giao hàng gồm họ tên, số điện thoại, địa chỉ hoặc lựa chọn một địa chỉ đã lưu trong hệ thống để sử dụng cho đơn hàng. |


| U-14 | Chọn phương thức thanh toán: **COD (Thanh toán khi nhận hàng)**:

        - Người dùng có thể lựa chọn phương thức thanh toán COD (Thanh toán khi nhận hàng) khi thực hiện đặt đơn. 
        - Hệ thống lưu và trả về phương thức thanh toán đã chọn. |


| U-15 | Xem tóm tắt đơn hàng trước khi xác nhận (sản phẩm, phí ship 30.000đ, tổng):

        - Người dùng có thể xem thông tin tóm tắt đơn hàng trước khi tiến hành xác nhận đặt hàng.
        - Thông tin tóm tắt bao gồm mã đơn hàng, danh sách sản phẩm trong đơn và phí vận chuyển.
        - Hệ thống hiển thị phí vận chuyển cố định là 30.000đ trong bước tóm tắt đơn hàng.  |


| U-16 | Đặt hàng thành công → hiển thị trang xác nhận kèm mã đơn: 

        - Người dùng có thể đặt hàng thành công sau khi hoàn tất thông tin đơn hàng. 
        - Hệ thống phải tạo đơn hàng mới và hiển thị thông tin xác nhận kèm mã đơn hàng để người dùng theo dõi. |


| U-17 | Xem danh sách toàn bộ đơn hàng đã đặt (mã, ngày, tổng, trạng thái):
 
        Người dùng có thể xem danh sách tất cả đơn hàng đã đặt của mình trong hệ thống.
        Mỗi đơn hàng hiển thị tổng số lượng sản phẩm đã đặt, mỗi đơn hàng có thông tin ngày đặt hàng.
        Danh sách đơn hàng bao gồm thông tin cơ bản để theo dõi tình trạng và lịch sử mua hàng.  |


| U-18 | Xem chi tiết đơn hàng (từng sản phẩm, size, số lượng, giá): 

        - Người dùng có thể xem chi tiết của một đơn hàng, bao gồm danh sách sản phẩm đã mua và thông tin chi tiết của từng sản phẩm trong đơn.
        - Hệ thống tính đúng thành tiền của từng sản phẩm |


| U-19 | Hủy đơn hàng khi trạng thái còn **"Chờ xử lý"** :

        - Người dùng có thể hủy đơn hàng nếu đơn hàng đang ở trạng thái “Chờ xử lý”.
        - Hệ thống trả về thông báo xác nhận hủy đơn.
        - Sau khi hủy thành công, hệ thống cập nhật lại trạng thái đơn hàng và ghi nhận thời gian cập nhật mới nhất. |


### Đánh giá

| ID | Yêu cầu |
|---|---|
| U-20 | Viết đánh giá sản phẩm (1–5 sao + bình luận văn bản):

        - Người dùng có thể gửi đánh giá cho sản phẩm đã mua bằng cách chọn số sao từ 1 đến 5 và nhập nội dung bình luận.
        - Sau khi gửi thành công, hệ thống lưu đánh giá và trả về thông tin đánh giá vừa tạo.
        - Hệ thống hiển thị mô tả tương ứng với số sao đánh giá. |


| U-21 | Xem phản hồi của shop trên bình luận của mình: 

        - Người dùng có thể xem phản hồi từ shop đối với các đánh giá hoặc bình luận mà mình đã gửi về sản phẩm.
        - Phản hồi phải gắn với một đánh giá cụ thể. |


| U-22 | Xem đánh giá sản phẩm: 

        - Người dùng có thể xem danh sách các đánh giá của sản phẩm, bao gồm số sao đánh giá và nội dung nhận xét từ những khách hàng khác.
        - Một sản phẩm có thể có nhiều đánh giá. |

---

## Admin — Quản trị viên

### Dashboard

| ID | Yêu cầu |
|---|---|
| A-01 | Xem tổng quan: tổng doanh thu (đơn "Hoàn thành"), tổng đơn hàng, tổng khách hàng:

        - Admin có thể xem các thống kê tổng quan của hệ thống để theo dõi tình hình kinh doanh, bao gồm tổng doanh thu từ các đơn hàng đã hoàn thành, tổng số đơn hàng và tổng số khách hàng. |


🎯 Map với test thường gặp: |
| A-02 | Xem danh sách 7 đơn hàng mới nhất trên dashboard: 

        - Admin có thể xem trang dashboard hệ thống, trong đó hiển thị các thống kê tổng quan và danh sách các đơn hàng mới nhất để theo dõi hoạt động kinh doanh.
        - Hệ thống chỉ hiển thị 7 đơn hàng mới nhất. |

        
| A-03 | Đăng xuất:

        - Admin có thể đăng xuất khỏi hệ thống để kết thúc phiên làm việc quản trị hiện tại.
        - Khi đăng xuất thành công, hệ thống phải xác nhận thao tác đăng xuất và vô hiệu hóa phiên đăng nhập của Admin.
        - Hệ thống trả về thông tin Admin vừa thực hiện đăng xuất. | 


### Quản lý Sản phẩm

| ID | Yêu cầu |
|---|---|
| A-03 | Xem danh sách sản phẩm (tìm kiếm theo tên, phân trang 10/trang):

        - Admin có thể xem danh sách sản phẩm trong hệ thống, tìm kiếm sản phẩm theo tên và duyệt dữ liệu thông qua chức năng phân trang. 
        - Kiểm tra bổ sung trạng thái. |


| A-04 | Thêm sản phẩm mới: tên, giá, giá cũ, mô tả, số lượng, giới tính, danh mục, ảnh:

        - Admin có thể thêm mới sản phẩm vào hệ thống bằng cách nhập đầy đủ thông tin sản phẩm gồm tên, giá, giá cũ, mô tả, số lượng, giới tính, danh mục và hình ảnh. 
        - Sản phẩm mới phải được tạo và có mã định danh.
        - Sản phẩm phải thuộc một danh mục. |


| A-05 | Sửa thông tin sản phẩm: 

        - Admin có thể cập nhật thông tin của sản phẩm đã tồn tại trong hệ thống, bao gồm các thông tin như tên, giá, giá cũ, mô tả, số lượng, giới tính, danh mục và hình ảnh. 
        - Sản phẩm phải thuộc một danh mục sau khi cập nhật. |


| A-06 | Xóa sản phẩm: 

        - Admin có thể xóa một sản phẩm khỏi hệ thống khi sản phẩm không còn được kinh doanh hoặc cần loại bỏ khỏi danh mục quản lý. 
        - Hệ thống thông báo kết quả xóa sản phẩm.
        - Hệ thống trả về thông tin sản phẩm vừa được xóa để phục vụ quản lý dữ liệu. |


| A-07 | Upload ảnh sản phẩm (validate MIME: jpg/jpeg/png/webp, tối đa 5MB): 

        - Admin có thể tải ảnh sản phẩm lên hệ thống khi tạo hoặc cập nhật sản phẩm. 
        - Hệ thống chỉ chấp nhận các định dạng ảnh jpg, jpeg, png, webp và kích thước tối đa là 5MB. |
        

### Quản lý Đơn hàng

| ID | Yêu cầu |
|---|---|
| A-08 | Xem tất cả đơn hàng (phân trang): 

        - Admin có thể xem danh sách toàn bộ đơn hàng trong hệ thống theo cơ chế phân trang để thuận tiện cho việc quản lý và theo dõi đơn hàng.
        - Admin có thể xem danh sách đơn hàng theo trạng thái.
        - Thông tin đơn hàng phải hiển thị chính xác tổng tiền. |


| A-09 | Xem chi tiết đơn hàng (thông tin khách, sản phẩm, tổng tiền):

        - Admin có thể xem chi tiết một đơn hàng, bao gồm thông tin khách hàng, danh sách sản phẩm trong đơn hàng, trạng thái đơn hàng và tổng tiền thanh toán. 
        - Hiển thị thông tin sản phẩm trong đơn hàng. |


| A-10 | Cập nhật trạng thái đơn: `pending` → `shipping` → `completed` / `cancelled`: 

        - Admin có thể cập nhật trạng thái đơn hàng theo đúng quy trình xử lý của hệ thống. 
        - Đơn hàng chỉ được phép chuyển trạng thái theo luồng: pending → shipping → completed hoặc cancelled.
        - Hệ thống trả về thông báo xác nhận sau khi cập nhật, hệ thống trả về thông tin đơn hàng sau khi cập nhật. |


### Quản lý Người dùng

| ID | Yêu cầu |
|---|---|
| A-11 | Xem danh sách toàn bộ khách hàng: 

        - Admin có thể xem danh sách toàn bộ khách hàng trong hệ thống để phục vụ công tác quản lý và theo dõi thông tin người dùng.
        - Mỗi khách hàng phải có mã định danh để phục vụ các chức năng quản lý tiếp theo. |


| A-12 | Xem chi tiết thông tin một khách hàng:

        - Admin có thể xem chi tiết thông tin của một khách hàng trong hệ thống để phục vụ công tác quản lý và hỗ trợ khách hàng. |


### Quản lý Đánh giá

| ID | Yêu cầu |
|---|---|
| A-13 | Xem tất cả đánh giá sản phẩm: 

        - Admin có thể xem danh sách tất cả đánh giá sản phẩm của khách hàng để phục vụ việc kiểm duyệt và quản lý nội dung đánh giá.
        - Mỗi đánh giá phải có thông tin số sao đánh giá.
        - Đánh giá sản phẩm sử dụng thang điểm từ 1 đến 5 sao.
        - Mỗi đánh giá phải có mã định danh để phục vụ các chức năng quản lý tiếp theo. |


| A-14 | Phản hồi đánh giá của khách (shop reply): 

        - Admin có thể phản hồi đánh giá của khách hàng bằng nội dung trả lời từ cửa hàng (shop reply).
        - Khi phản hồi thành công, hệ thống phải lưu nội dung phản hồi và trả về kết quả cập nhật cho quản trị viên.
        - Hệ thống trả về thông báo hoặc nội dung xác nhận phản hồi thành công. |


| A-15 | Xóa đánh giá: 

        - Admin có thể xóa các đánh giá vi phạm hoặc không phù hợp khỏi hệ thống.
        - Khi xóa thành công, hệ thống phải xác nhận thao tác xóa và đánh giá đó không còn được sử dụng trong hệ thống. 
        - Hệ thống ghi nhận thời điểm xóa đánh giá. |



### Quản lý Liên hệ

| ID | Yêu cầu |
|---|---|
| A-16 | Xem danh sách tin nhắn liên hệ từ khách: 

        - Admin có thể xem danh sách các tin nhắn liên hệ được gửi từ khách hàng để phục vụ việc hỗ trợ và xử lý yêu cầu. 
        - Mỗi tin nhắn liên hệ phải có đầy đủ thông tin người gửi và nội dung liên hệ.
        - Trạng thái liên hệ được quản lý theo các trạng thái của hệ thống.
        - Mỗi liên hệ phải có mã định danh để phục vụ các chức năng quản lý tiếp theo. |


| A-17 | Cập nhật trạng thái liên hệ: `new` → `read` → `resolved`: 

        - Admin có thể cập nhật trạng thái xử lý của một liên hệ từ khách hàng. 
        - Trạng thái phải được chuyển theo luồng xử lý của hệ thống từ new sang read và cuối cùng là resolved.
        - Hệ thống trả về trạng thái mới của liên hệ sau khi cập nhậ |
