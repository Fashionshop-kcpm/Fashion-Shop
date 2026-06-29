<?php

namespace Tests\Unit\Whitebox;

use App\Http\Controllers\Api\OrderController;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

/**
 * Pure Whitebox Test cho chức năng Đặt Hàng (Order)
 *
 * Chọc trực tiếp vào OrderController để kiểm tra:
 * - Logic tính toán `$totalPrice = tổng tiền giỏ hàng + phí ship (30.000đ)`
 * - Logic thao tác làm sạch giỏ hàng (Clean up Database: Cart::delete())
 */
class CoreOrderWhiteboxTest extends TestCase
{
    use RefreshDatabase;

    private OrderController $controller;
    private User $user;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        // Khởi tạo trực tiếp (bỏ qua Middleware và Router)
        $this->controller = new OrderController();
        $this->user = User::factory()->create();
        $this->product = Product::factory()->create([
            'gia' => 150000 // Fix giá để dễ tính toán
        ]);
    }

    private function createMockRequest(array $data): Request
    {
        $request = Request::create('/dummy-url', 'POST', $data);
        $request->setUserResolver(function () {
            return $this->user;
        });

        return $request;
    }

    /**
     * Test nhánh 1: Kiểm tra logic tính $totalPrice và lưu Order
     * Kỳ vọng: Order lưu vào DB với tổng tiền = (Số lượng * Giá) + 30000 (phí ship)
     */
    public function test_internal_order_calculation_logic(): void
    {
        // 1. Dàn xếp Database (Giỏ hàng có 2 sản phẩm, tổng tiền giỏ = 150.000 * 2 = 300.000)
        Cart::factory()->create([
            'user_id'    => $this->user->id,
            'product_id' => $this->product->id,
            'quantity'   => 2,
            'size'       => 'L',
        ]);

        // 2. Chuẩn bị Request gửi thẳng vào nội bộ Controller
        $request = $this->createMockRequest([
            'fullname' => 'John Doe',
            'phone'    => '0987654321',
            'address'  => '123 Street ABC',
            'payment'  => 'COD',
        ]);

        // 3. Thực thi trực tiếp
        $this->controller->store($request);

        // 4. Khẳng định logic (Assertions)
        $order = Order::where('user_id', $this->user->id)->first();
        $this->assertNotNull($order, 'Đơn hàng chưa được lưu vào Database');
        
        // Kiểm tra biến nội bộ đã được tính đúng chưa
        // Kỳ vọng: 300.000 (sản phẩm) + 30.000 (ship) = 330.000
        $this->assertEquals(330000, $order->total, 'Logic tính tổng tiền (totalPrice) sai');
        $this->assertEquals('pending', $order->status, 'Trạng thái mặc định không phải là pending');
    }

    /**
     * Test nhánh 2: Kiểm tra luồng làm sạch giỏ hàng (Cart::delete)
     * Kì vọng: Đoạn code xóa các items trong bảng `cart_table_v2` phải thực sự chạy
     */
    public function test_internal_order_cleans_up_cart_logic(): void
    {
        // 1. Dàn xếp có 3 mặt hàng trong giỏ
        Cart::factory()->count(3)->create([
            'user_id'    => $this->user->id,
            'product_id' => $this->product->id,
        ]);

        $this->assertDatabaseCount('cart_table_v2', 3);

        $request = $this->createMockRequest([
            'fullname' => 'John Doe',
            'phone'    => '0987654321',
            'address'  => '123 Street ABC',
            'payment'  => 'COD',
        ]);

        // 2. Chạy store
        $this->controller->store($request);

        // 3. Khẳng định logic xóa
        // Hàm Cart::where('user_id', ...)->delete() phải được gọi thành công
        $this->assertDatabaseCount('cart_table_v2', 0);
    }

    /**
     * Test nhánh 3: Người dùng thử đặt hàng khi giỏ hàng trống rỗng
     * Kỳ vọng: Trả về lỗi 400 và thông báo 'Giỏ hàng trống'
     */
    public function test_internal_order_fails_on_empty_cart(): void
    {
        // 1. Dàn xếp: Cố tình không tạo giỏ hàng (Cart = 0)
        $request = $this->createMockRequest([
            'fullname' => 'John Doe',
            'phone'    => '0987654321',
            'address'  => '123 Street ABC',
            'payment'  => 'COD',
        ]);

        // 2. Chạy store
        $response = $this->controller->store($request);
        $responseData = $response->getData();

        // 3. Khẳng định logic
        $this->assertEquals(400, $response->status());
        $this->assertEquals('Giỏ hàng trống', $responseData->message);
        
        // Không tạo ra bất kỳ order nào
        $this->assertDatabaseCount('orders', 0);
    }
}
