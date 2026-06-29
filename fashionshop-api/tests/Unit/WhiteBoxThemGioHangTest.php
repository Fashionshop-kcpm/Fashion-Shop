<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Cart;
use App\Http\Controllers\Api\CartController;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;

class WhiteBoxThemGioHangTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Tạo Request có user đăng nhập
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
     * Validate thất bại do size không hợp lệ
     *
     * Kết quả mong đợi:
     * HTTP 200
     */
    public function test_wb01_store_invalid_size()
    {
        $user = User::factory()->create();

        $request = $this->makeRequest($user, [
            'product_id' => 1,
            'quantity' => 1,
            'size' => 'XXL'
        ]);

        $response = (new CartController())->store($request);

        $this->assertEquals(200, $response->status());
    }

    /**
     * WB02
     * Bao phủ nhánh:
     * Validate thất bại do dữ liệu không hợp lệ
     *
     * Kết quả mong đợi:
     * HTTP 200
     */
    public function test_wb02_store_invalid_data()
    {
        $user = User::factory()->create();

        $request = $this->makeRequest($user, [
            'product_id' => '',
            'quantity' => 0,
            'size' => 'M'
        ]);

        $response = (new CartController())->store($request);

        $this->assertEquals(200, $response->status());
    }

    /**
     * WB03
     * Bao phủ nhánh:
     * Sản phẩm đã tồn tại trong giỏ
     *
     * Kết quả mong đợi:
     * Quantity được tăng
     */
    public function test_wb03_store_increment_quantity()
    {
        $user = User::factory()->create();

        $product = Product::create([
            'ten_sp' => 'Ao',
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
            'quantity' => 1,
            'size' => 'M'
        ]);

        $request = $this->makeRequest($user, [
            'product_id' => $product->id,
            'quantity' => 2,
            'size' => 'M'
        ]);

        $response = (new CartController())->store($request);

        $this->assertEquals(200, $response->status());

        $this->assertDatabaseHas('carts', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 3
        ]);
    }

    /**
     * WB04
     * Bao phủ nhánh:
     * Thêm mới vào giỏ hàng
     *
     * Kết quả mong đợi:
     * HTTP 200
     */
    public function test_wb04_store_create_new_cart()
    {
        $user = User::factory()->create();

        $product = Product::create([
            'ten_sp' => 'Ao',
            'gia' => 100000,
            'gia_cu' => 120000,
            'mo_ta' => 'Test',
            'so_luong' => 10,
            'gioi_tinh' => 1,
            'category_id' => null,
            'hinh_anh' => null,
        ]);

        $request = $this->makeRequest($user, [
            'product_id' => $product->id,
            'quantity' => 2,
            'size' => 'L'
        ]);

        $response = (new CartController())->store($request);

        $this->assertEquals(200, $response->status());

        $this->assertDatabaseHas('carts', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'size' => 'L'
        ]);
    }
}