<?php

namespace Tests\Unit\Whitebox;

use App\Http\Controllers\Api\CartController;
use App\Models\Cart;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

/**
 * Pure Whitebox Test cho chức năng Giỏ Hàng (Cart)
 *
 * Bỏ qua lớp HTTP / Routing bên ngoài.
 * Trực tiếp khởi tạo Controller, giả lập (mock) tham số Request,
 * và kiểm chứng các trạng thái (state) thay đổi trực tiếp bên trong nội bộ logic.
 */
class CoreCartWhiteboxTest extends TestCase
{
    use RefreshDatabase;

    private CartController $controller;
    private User $user;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        // Khởi tạo trực tiếp controller (bypass routing)
        $this->controller = new CartController();
        
        $this->user = User::factory()->create();
        $this->product = Product::factory()->create();
    }

    /**
     * Tạo một đối tượng giả lập (Mock) cho class Illuminate\Http\Request
     */
    private function createMockRequest(array $data): Request
    {
        $request = Request::create('/dummy-url', 'POST', $data);
        
        // Cắm user vào request giống như cơ chế của Middleware Sanctum
        $request->setUserResolver(function () {
            return $this->user;
        });

        return $request;
    }

    /**
     * Test nhánh 1: Khi sản phẩm chưa tồn tại trong giỏ hàng (if (!$cart))
     * Kỳ vọng: Gọi Cart::create() để tạo record mới
     */
    public function test_internal_store_branch_creates_new_cart_item(): void
    {
        // 1. Tạo request giả
        $request = $this->createMockRequest([
            'product_id' => $this->product->id,
            'quantity'   => 2,
            'size'       => 'M',
        ]);

        // 2. Chọc thẳng vào method nội bộ của controller
        $response = $this->controller->store($request);
        $responseData = $response->getData(); // Lấy dữ liệu raw trả về

        // 3. Khẳng định logic (Assertions)
        $this->assertEquals('Đã thêm vào giỏ hàng', $responseData->message);
        $this->assertEquals($this->product->id, $responseData->cart->product_id);
        
        // Khẳng định dưới tầng DB rằng hàm Cart::create() thực sự chạy
        $this->assertDatabaseCount('cart_table_v2', 1);
        $this->assertDatabaseHas('cart_table_v2', [
            'user_id'    => $this->user->id,
            'product_id' => $this->product->id,
            'quantity'   => 2,
            'size'       => 'M',
        ]);
    }

    /**
     * Test nhánh 2: Khi sản phẩm đã tồn tại trong giỏ hàng (if ($cart))
     * Kỳ vọng: Gọi $cart->increment() để cộng dồn số lượng, không tạo mới
     */
    public function test_internal_store_branch_increments_existing_quantity(): void
    {
        // 1. Dàn xếp (Arrange): Có sẵn 1 item trong database
        Cart::factory()->create([
            'user_id'    => $this->user->id,
            'product_id' => $this->product->id,
            'quantity'   => 3,
            'size'       => 'L',
        ]);

        // 2. Tạo request giả đụng đúng sản phẩm và size đó
        $request = $this->createMockRequest([
            'product_id' => $this->product->id,
            'quantity'   => 5,
            'size'       => 'L', // Cùng size để trigger nhánh if ($cart)
        ]);

        // 3. Thực thi trực tiếp
        $this->controller->store($request);

        // 4. Khẳng định logic (Assert)
        // Số lượng record không đổi, chỉ có quantity thay đổi
        $this->assertDatabaseCount('cart_table_v2', 1);
        
        $updatedCart = Cart::where('user_id', $this->user->id)->first();
        // Cũ 3 + Thêm 5 = Kì vọng 8
        $this->assertEquals(8, $updatedCart->quantity, 'Logic hàm increment() trong nhánh đã chạy sai');
    }

    /**
     * Test nhánh 3: Validation Fails
     * Kỳ vọng: Validator::make() hoạt động và block sớm nếu thiếu dữ liệu quan trọng
     */
    public function test_internal_store_branch_validation_fails(): void
    {
        // 1. Tạo request giả thiếu quantity và size sai định dạng
        $request = $this->createMockRequest([
            'product_id' => $this->product->id,
            'size'       => 'UNKNOWN_SIZE',
        ]);

        // 2. Thực thi trực tiếp
        $response = $this->controller->store($request);
        $responseData = $response->getData(true); // Trả về dạng array

        // 3. Khẳng định logic
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('size', $responseData['errors']);
        
        // Không có dữ liệu nào được đưa vào DB
        $this->assertDatabaseCount('cart_table_v2', 0);
    }
}
