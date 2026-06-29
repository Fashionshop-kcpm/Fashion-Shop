<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Http\Controllers\Api\Admin\ProductController;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class WhiteBoxQuanLySanPhamTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Tạo Request
     */
    private function makeRequest($data = [])
    {
        return new Request($data);
    }

    /**
     * WB01
     * Bao phủ nhánh:
     * index() không có keyword
     *
     * Kết quả mong đợi:
     * HTTP 200
     */
    public function test_wb01_index_without_keyword()
    {
        Product::create([
            'ten_sp' => 'Áo thun',
            'gia' => 100000,
            'gia_cu' => 120000,
            'mo_ta' => 'Test',
            'so_luong' => 10,
            'gioi_tinh' => 1,
            'category_id' => null,
            'hinh_anh' => null,
        ]);

        $request = $this->makeRequest();

        $response = (new ProductController())->index($request);

        $this->assertEquals(200, $response->status());
    }

    /**
     * WB02
     * Bao phủ nhánh:
     * index() có keyword
     *
     * Kết quả mong đợi:
     * HTTP 200
     */
    public function test_wb02_index_with_keyword()
    {
        Product::create([
            'ten_sp' => 'Áo sơ mi',
            'gia' => 200000,
            'gia_cu' => 250000,
            'mo_ta' => 'Test',
            'so_luong' => 5,
            'gioi_tinh' => 1,
            'category_id' => null,
            'hinh_anh' => null,
        ]);

        $request = $this->makeRequest([
            'keyword' => 'Áo'
        ]);

        $response = (new ProductController())->index($request);

        $this->assertEquals(200, $response->status());
    }

    /**
     * WB03
     * Bao phủ nhánh:
     * store() validate thất bại
     *
     * Kết quả mong đợi:
     * ValidationException
     */
    public function test_wb03_store_validation_fail()
    {
        $request = $this->makeRequest([
            'ten_sp' => '',
            'gia' => -1,
            'so_luong' => -5,
            'gioi_tinh' => 2,
        ]);

        $this->expectException(
            \Illuminate\Validation\ValidationException::class
        );

        (new ProductController())->store($request);
    }

    /**
     * WB04
     * Bao phủ nhánh:
     * store() thêm thành công
     *
     * Kết quả mong đợi:
     * HTTP 201
     */
    public function test_wb04_store_success()
    {
        $request = $this->makeRequest([
            'ten_sp' => 'Áo Hoodie',
            'gia' => 350000,
            'gia_cu' => 400000,
            'mo_ta' => 'Test',
            'so_luong' => 20,
            'gioi_tinh' => 1,
            'category_id' => null,
        ]);

        $response = (new ProductController())->store($request);

        $this->assertEquals(201, $response->status());

        $this->assertDatabaseHas('products', [
            'ten_sp' => 'Áo Hoodie'
        ]);
    }

        /**
     * WB05
     * Bao phủ nhánh:
     * update() không tìm thấy sản phẩm
     *
     * Kết quả mong đợi:
     * ModelNotFoundException
     */
    public function test_wb05_update_product_not_found()
    {
        $request = $this->makeRequest([
            'ten_sp' => 'Áo Test',
            'gia' => 100000,
            'gia_cu' => 120000,
            'mo_ta' => 'Test',
            'so_luong' => 10,
            'gioi_tinh' => 1,
            'category_id' => null,
        ]);

        $this->expectException(
            \Illuminate\Database\Eloquent\ModelNotFoundException::class
        );

        (new ProductController())->update($request, 999);
    }

    /**
     * WB06
     * Bao phủ nhánh:
     * update() validate thất bại
     *
     * Kết quả mong đợi:
     * ValidationException
     */
    public function test_wb06_update_validation_fail()
    {
        $product = Product::create([
            'ten_sp' => 'Áo Thun',
            'gia' => 100000,
            'gia_cu' => 120000,
            'mo_ta' => 'Test',
            'so_luong' => 10,
            'gioi_tinh' => 1,
            'category_id' => null,
            'hinh_anh' => null,
        ]);

        $request = $this->makeRequest([
            'ten_sp' => '',
            'gia' => -100,
            'gia_cu' => -50,
            'mo_ta' => 'Test',
            'so_luong' => -1,
            'gioi_tinh' => 2,
            'category_id' => null,
        ]);

        $this->expectException(
            \Illuminate\Validation\ValidationException::class
        );

        (new ProductController())->update($request, $product->id);
    }

    /**
     * WB07
     * Bao phủ nhánh:
     * update() cập nhật thành công
     *
     * Kết quả mong đợi:
     * HTTP 200
     */
    public function test_wb07_update_success()
    {
        $product = Product::create([
            'ten_sp' => 'Áo Cũ',
            'gia' => 100000,
            'gia_cu' => 120000,
            'mo_ta' => 'Test',
            'so_luong' => 10,
            'gioi_tinh' => 1,
            'category_id' => null,
            'hinh_anh' => null,
        ]);

        $request = $this->makeRequest([
            'ten_sp' => 'Áo Mới',
            'gia' => 150000,
            'gia_cu' => 180000,
            'mo_ta' => 'Đã cập nhật',
            'so_luong' => 20,
            'gioi_tinh' => 1,
            'category_id' => null,
        ]);

        $response = (new ProductController())->update($request, $product->id);

        $this->assertEquals(200, $response->status());

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'ten_sp' => 'Áo Mới',
            'gia' => 150000,
        ]);
    }

        /**
     * WB08
     * Bao phủ nhánh:
     * destroy() không tìm thấy sản phẩm
     *
     * Kết quả mong đợi:
     * ModelNotFoundException
     */
    public function test_wb08_destroy_product_not_found()
    {
        $this->expectException(
            \Illuminate\Database\Eloquent\ModelNotFoundException::class
        );

        (new ProductController())->destroy(999);
    }

    /**
     * WB09
     * Bao phủ nhánh:
     * destroy() xóa sản phẩm thành công
     *
     * Kết quả mong đợi:
     * HTTP 200
     */
    public function test_wb09_destroy_success()
    {
        $product = Product::create([
            'ten_sp' => 'Áo Test',
            'gia' => 100000,
            'gia_cu' => 120000,
            'mo_ta' => 'Test',
            'so_luong' => 10,
            'gioi_tinh' => 1,
            'category_id' => null,
            'hinh_anh' => null,
        ]);

        $response = (new ProductController())->destroy($product->id);

        $this->assertEquals(200, $response->status());

        $this->assertDatabaseMissing('products', [
            'id' => $product->id
        ]);
    }

    /**
     * WB10
     * Bao phủ nhánh: store() có upload ảnh (hasFile = true)
     * Kết quả mong đợi: HTTP 201, hinh_anh không null
     */
    public function test_wb10_store_with_image()
    {
        Storage::fake('public');
        $file = UploadedFile::fake()->image('product.jpg');

        $request = new \Illuminate\Http\Request(
            ['ten_sp' => 'Áo Có Ảnh', 'gia' => 200000, 'so_luong' => 10, 'gioi_tinh' => 1],
            [], [], [],
            ['hinh_anh' => $file]
        );

        $response = (new ProductController())->store($request);

        $this->assertEquals(201, $response->status());

        $product = Product::where('ten_sp', 'Áo Có Ảnh')->first();
        $this->assertNotNull($product->hinh_anh);
    }

    /**
     * WB11
     * Bao phủ nhánh: update() có upload ảnh mới (hasFile = true)
     * Kết quả mong đợi: HTTP 200, hinh_anh được cập nhật
     */
    public function test_wb11_update_with_image()
    {
        Storage::fake('public');
        $file = UploadedFile::fake()->image('updated.jpg');

        $product = Product::create([
            'ten_sp'      => 'Áo Cũ',
            'gia'         => 100000,
            'gia_cu'      => 120000,
            'mo_ta'       => 'Test',
            'so_luong'    => 10,
            'gioi_tinh'   => 1,
            'category_id' => null,
            'hinh_anh'    => null,
        ]);

        $request = new \Illuminate\Http\Request(
            ['ten_sp' => 'Áo Mới Có Ảnh', 'gia' => 150000, 'so_luong' => 15, 'gioi_tinh' => 1],
            [], [], [],
            ['hinh_anh' => $file]
        );

        $response = (new ProductController())->update($request, $product->id);

        $this->assertEquals(200, $response->status());
        $this->assertNotNull($product->fresh()->hinh_anh);
    }
}
