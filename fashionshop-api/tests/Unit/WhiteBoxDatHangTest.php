<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Http\Controllers\Api\OrderController;
use Illuminate\Http\Request;
use Illuminate\Foundation\Testing\RefreshDatabase;

class WhiteBoxDatHangTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Tạo request có user đăng nhập
     */
    private function makeRequest($user, $data = [])
    {
        $request = new Request($data);
        $request->setUserResolver(fn () => $user);

        return $request;
    }

    /**
     * WB01
     * Bao phủ nhánh:
     * Validate thất bại
     *
     * Kết quả mong đợi:
     * ValidationException
     */
    public function test_wb01_store_validation_fail()
    {
        $user = User::factory()->create();

        $request = $this->makeRequest($user, [
            'fullname' => '',
            'phone' => '123',
            'address' => '',
            'payment' => 'BANK'
        ]);

        $this->expectException(\Illuminate\Validation\ValidationException::class);

        (new OrderController())->store($request);
    }

    /**
     * WB02
     * Bao phủ nhánh:
     * Giỏ hàng trống
     *
     * Kết quả mong đợi:
     * HTTP 400
     */
    public function test_wb02_cart_empty()
    {
        $user = User::factory()->create();

        $request = $this->makeRequest($user, [
            'fullname' => 'Nguyen Van A',
            'phone' => '0912345678',
            'address' => 'HCM',
            'payment' => 'COD'
        ]);

        $response = (new OrderController())->store($request);

        $this->assertEquals(400, $response->status());
    }

    /**
     * WB03
     * Bao phủ nhánh:
     * Đặt hàng thành công
     *
     * Kết quả mong đợi:
     * HTTP 200
     */
    public function test_wb03_store_success()
    {
        $user = User::factory()->create();

        $product = Product::create([
            'ten_sp' => 'Áo',
            'gia' => 100000,
            'gia_cu' => 120000,
            'mo_ta' => 'Test',
            'so_luong' => 10,
            'gioi_tinh' => 1,
            'category_id' => null,
            'hinh_anh' => null,
        ]);

        Cart::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'size' => 'L'
        ]);

        $request = $this->makeRequest($user, [
            'fullname' => 'Nguyen Van A',
            'phone' => '0912345678',
            'address' => 'TP HCM',
            'payment' => 'COD'
        ]);

        $response = (new OrderController())->store($request);

        $this->assertEquals(200, $response->status());

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'fullname' => 'Nguyen Van A'
        ]);

        $this->assertDatabaseHas('order_details', [
            'product_id' => $product->id,
            'quantity' => 2
        ]);

        $this->assertDatabaseMissing('carts', [
            'user_id' => $user->id
        ]);
    }
}