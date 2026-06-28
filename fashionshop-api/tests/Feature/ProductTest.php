<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Whitebox Feature Test: ProductController
 *
 * Coverage: index() (với các filters), show()
 * Kiểm tra mọi nhánh điều kiện trong ProductController:
 *   - index(): keyword filter branch, category_id filter branch, gioi_tinh filter branch
 *   - show(): product tồn tại vs không tồn tại
 */
class ProductTest extends TestCase
{
    use RefreshDatabase;

    // =====================================================================
    // INDEX TESTS
    // =====================================================================

    /**
     * TC-PRODUCT-01: Lấy danh sách sản phẩm không có filter
     * Branch: Tất cả if($request->keyword), if($request->category_id), if($request->gioi_tinh) → false
     *         → paginate(10) không có điều kiện thêm
     */
    public function test_get_products_without_filters(): void
    {
        Product::factory()->count(5)->create();

        $response = $this->getJson('/api/v1/products');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data',
                     'current_page',
                     'total',
                     'per_page',
                     'applied_filters' => ['keyword', 'category_id', 'gioi_tinh'],
                 ]);
    }

    /**
     * TC-PRODUCT-02: Lọc sản phẩm theo keyword
     * Branch: if($request->keyword) → true → whereRaw(REPLACE(LOWER(ten_sp)...))
     */
    public function test_get_products_with_keyword_filter(): void
    {
        Product::factory()->create(['ten_sp' => 'ao thun nam']);
        Product::factory()->create(['ten_sp' => 'quan jeans']);
        Product::factory()->create(['ten_sp' => 'ao polo']);

        $response = $this->getJson('/api/v1/products?keyword=ao');

        $response->assertStatus(200);
        // applied_filters phải phản ánh keyword đã dùng
        $response->assertJsonPath('applied_filters.keyword', 'ao');
    }

    /**
     * TC-PRODUCT-03: Lọc sản phẩm theo category_id
     * Branch: if($request->category_id) → true → where('category_id', ...)
     */
    public function test_get_products_filtered_by_category(): void
    {
        $cat1 = Category::factory()->create();
        $cat2 = Category::factory()->create();

        Product::factory()->count(3)->create(['category_id' => $cat1->id]);
        Product::factory()->count(2)->create(['category_id' => $cat2->id]);

        $response = $this->getJson("/api/v1/products?category_id={$cat1->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('applied_filters.category_id', (string) $cat1->id);
        // Chỉ có 3 sản phẩm của cat1
        $this->assertEquals(3, $response->json('total'));
    }

    /**
     * TC-PRODUCT-04: Lọc sản phẩm theo giới tính = 0 (Nữ)
     * Branch: if($request->gioi_tinh !== null) → true → where('gioi_tinh', 0)
     */
    public function test_get_products_filtered_by_gender_female(): void
    {
        Product::factory()->count(2)->create(['gioi_tinh' => 0]);
        Product::factory()->count(3)->create(['gioi_tinh' => 1]);

        $response = $this->getJson('/api/v1/products?gioi_tinh=0');

        $response->assertStatus(200);
        $this->assertEquals(2, $response->json('total'));
    }

    /**
     * TC-PRODUCT-05: Lọc sản phẩm theo giới tính = 1 (Nam)
     * Branch: if($request->gioi_tinh !== null) → true → where('gioi_tinh', 1)
     */
    public function test_get_products_filtered_by_gender_male(): void
    {
        Product::factory()->count(2)->create(['gioi_tinh' => 0]);
        Product::factory()->count(3)->create(['gioi_tinh' => 1]);

        $response = $this->getJson('/api/v1/products?gioi_tinh=1');

        $response->assertStatus(200);
        $this->assertEquals(3, $response->json('total'));
    }

    /**
     * TC-PRODUCT-06: Phân trang hoạt động đúng (per_page = 10)
     * Branch: paginate(10) với nhiều records
     */
    public function test_products_are_paginated_10_per_page(): void
    {
        Product::factory()->count(15)->create();

        $response = $this->getJson('/api/v1/products');

        $response->assertStatus(200);
        $this->assertEquals(10, $response->json('per_page'));
        $this->assertEquals(15, $response->json('total'));
        $this->assertCount(10, $response->json('data'));
    }

    /**
     * TC-PRODUCT-07: Kết hợp nhiều filter cùng lúc
     * Branch: Tất cả if() branches → true cùng lúc
     */
    public function test_get_products_with_multiple_filters(): void
    {
        $cat = Category::factory()->create();
        Product::factory()->create([
            'ten_sp'     => 'ao thun nam',
            'category_id' => $cat->id,
            'gioi_tinh'  => 1,
        ]);
        Product::factory()->create([
            'ten_sp'     => 'quan nu',
            'category_id' => $cat->id,
            'gioi_tinh'  => 0,
        ]);

        $response = $this->getJson("/api/v1/products?keyword=ao&category_id={$cat->id}&gioi_tinh=1");

        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('total'));
    }

    // =====================================================================
    // SHOW TESTS
    // =====================================================================

    /**
     * TC-PRODUCT-08: Xem chi tiết sản phẩm tồn tại → 200 + đầy đủ thông tin
     * Branch: if(!$product) → false → trả về product với sizes được thêm vào
     */
    public function test_show_existing_product(): void
    {
        $product = Product::factory()->create();

        $response = $this->getJson("/api/v1/products/{$product->id}");

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'id',
                     'ten_sp',
                     'gia',
                     'sizes',
                 ]);

        // Verify sizes array được thêm đúng (4 sizes: S, M, L, XL)
        $sizes = $response->json('sizes');
        $this->assertCount(4, $sizes);
        $sizeNames = array_column($sizes, 'size_name');
        $this->assertContains('S', $sizeNames);
        $this->assertContains('M', $sizeNames);
        $this->assertContains('L', $sizeNames);
        $this->assertContains('XL', $sizeNames);
    }

    /**
     * TC-PRODUCT-09: Xem sản phẩm không tồn tại → 404
     * Branch: if(!$product) → true → return 404 'Sản phẩm không tồn tại'
     */
    public function test_show_nonexistent_product(): void
    {
        $response = $this->getJson('/api/v1/products/99999');

        $response->assertStatus(404)
                 ->assertJsonPath('message', 'Sản phẩm không tồn tại');
    }

    /**
     * TC-PRODUCT-10: Xem sản phẩm → trường 'name' được gán từ 'ten_sp'
     * Branch: $product->name = $product->ten_sp (line mapping)
     */
    public function test_show_product_name_mapped_from_ten_sp(): void
    {
        $product = Product::factory()->create(['ten_sp' => 'Áo Thun Cổ Tròn']);

        $response = $this->getJson("/api/v1/products/{$product->id}");

        $response->assertStatus(200)
                 ->assertJsonPath('name', 'Áo Thun Cổ Tròn');
    }
}
