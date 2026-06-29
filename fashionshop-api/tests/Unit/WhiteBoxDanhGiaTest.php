<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Review;
use App\Http\Controllers\Api\ReviewController;
use Illuminate\Http\Request;
use Illuminate\Foundation\Testing\RefreshDatabase;

class WhiteBoxDanhGiaTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Hàm tạo Request có user đăng nhập
     */
    private function makeRequest($user, $data = [])
    {
        $request = new Request($data);
        $request->setUserResolver(fn () => $user);

        return $request;
    }

    /**
     * WB01
     * Bao phủ đường đi:
     * index() có dữ liệu đánh giá
     *
     * Kết quả mong đợi:
     * Trả về danh sách review.
     */
    public function test_wb01_index_has_reviews()
    {
        $user = User::factory()->create();

        $product = Product::create([
            'ten_sp' => 'Áo thun',
            'gia' => 100000,
            'gia_cu' => 120000,
            'mo_ta' => 'Test',
            'so_luong' => 10,
            'gioi_tinh' => 1,
            'category_id' => null,
            'hinh_anh' => null,
        ]);

        Review::create([
            'product_id' => $product->id,
            'user_id' => $user->id,
            'rating' => 5,
            'comment' => 'Rất đẹp'
        ]);

        $response = (new ReviewController())->index($product->id);

        $this->assertEquals(200, $response->status());
    }

    /**
     * WB02
     * Bao phủ đường đi:
     * index() không có dữ liệu
     *
     * Kết quả mong đợi:
     * Trả về mảng rỗng.
     */
    public function test_wb02_index_empty()
    {
        $response = (new ReviewController())->index(999);

        $this->assertEquals(200, $response->status());
    }

    /**
     * WB03
     * Bao phủ đường đi:
     * validate thất bại
     *
     * Kết quả mong đợi:
     * Validation Exception.
     */
    public function test_wb03_store_validation_fail()
    {
        $user = User::factory()->create();

        $request = $this->makeRequest($user, [
            'rating' => 6,
            'comment' => ''
        ]);

        $this->expectException(\Illuminate\Validation\ValidationException::class);

        (new ReviewController())->store($request, 1);
    }

    /**
     * WB04
     * Bao phủ đường đi:
     * validate thành công
     * tạo review thành công
     *
     * Kết quả mong đợi:
     * Trả về message "Đã gửi đánh giá".
     */
    public function test_wb04_store_success()
    {
        $user = User::factory()->create();

        $product = Product::create([
            'ten_sp' => 'Áo thun',
            'gia' => 100000,
            'gia_cu' => 120000,
            'mo_ta' => 'Test',
            'so_luong' => 10,
            'gioi_tinh' => 1,
            'category_id' => null,
            'hinh_anh' => null,
        ]);

        $request = $this->makeRequest($user, [
            'rating' => 5,
            'comment' => 'Sản phẩm rất tốt'
        ]);

        $response = (new ReviewController())->store($request, $product->id);

        $this->assertEquals(201, $response->status());

        $this->assertDatabaseHas('reviews', [
            'product_id' => $product->id,
            'user_id' => $user->id,
            'rating' => 5
        ]);
    }
}