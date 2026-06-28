<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Whitebox Feature Test: CartController
 *
 * Coverage: index(), store(), update(), destroy()
 * Kiểm tra mọi nhánh điều kiện trong CartController:
 *   - store(): cart tồn tại → increment vs tạo mới; size validation branch
 *   - update(): cart thuộc user / không thuộc user
 *   - destroy(): cart tồn tại / không tồn tại
 */
class CartTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user  = User::factory()->create();
        $this->token = $this->user->createToken('auth_token')->plainTextToken;
    }

    private function auth(): array
    {
        return ['Authorization' => "Bearer {$this->token}"];
    }

    // =====================================================================
    // INDEX TESTS
    // =====================================================================

    /**
     * TC-CART-01: Lấy giỏ hàng khi trống → items = [], total_price = 0
     * Branch: Cart::where('user_id')->where('quantity', '>', 0)->get() → empty
     */
    public function test_get_empty_cart(): void
    {
        $response = $this->withHeaders($this->auth())->getJson('/api/v1/cart');

        $response->assertStatus(200)
                 ->assertJsonStructure(['items', 'data', 'total_price'])
                 ->assertJsonPath('total_price', 0);
    }

    /**
     * TC-CART-02: Lấy giỏ hàng khi có sản phẩm → trả về đúng items
     * Branch: Cart::where(...)->get() → non-empty collection
     */
    public function test_get_cart_with_items(): void
    {
        $product = Product::factory()->create(['gia' => 200000]);
        Cart::factory()->create([
            'user_id'    => $this->user->id,
            'product_id' => $product->id,
            'quantity'   => 2,
        ]);

        $response = $this->withHeaders($this->auth())->getJson('/api/v1/cart');

        $response->assertStatus(200)
                 ->assertJsonPath('total_price', 400000);
    }

    // =====================================================================
    // STORE TESTS
    // =====================================================================

    /**
     * TC-CART-03: Thêm sản phẩm mới vào giỏ (chưa có trong giỏ)
     * Branch: Cart::where(product_id, size)->first() → null → Cart::create()
     */
    public function test_add_new_product_to_cart(): void
    {
        $product = Product::factory()->create();

        $response = $this->withHeaders($this->auth())->postJson('/api/v1/cart', [
            'product_id' => $product->id,
            'quantity'   => 2,
            'size'       => 'M',
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('message', 'Đã thêm vào giỏ hàng');

        $this->assertDatabaseHas('cart_table_v2', [
            'user_id'    => $this->user->id,
            'product_id' => $product->id,
            'quantity'   => 2,
            'size'       => 'M',
        ]);
    }

    /**
     * TC-CART-04: Thêm sản phẩm đã có trong giỏ (cùng size) → increment quantity
     * Branch: Cart::where(product_id, size)->first() → exists → $cart->increment()
     */
    public function test_add_existing_product_increments_quantity(): void
    {
        $product = Product::factory()->create();
        Cart::factory()->create([
            'user_id'    => $this->user->id,
            'product_id' => $product->id,
            'quantity'   => 1,
            'size'       => 'L',
        ]);

        $response = $this->withHeaders($this->auth())->postJson('/api/v1/cart', [
            'product_id' => $product->id,
            'quantity'   => 3,
            'size'       => 'L',
        ]);

        $response->assertStatus(200);

        // Quantity phải là 1 + 3 = 4
        $this->assertDatabaseHas('cart_table_v2', [
            'user_id'    => $this->user->id,
            'product_id' => $product->id,
            'quantity'   => 4,
            'size'       => 'L',
        ]);
    }

    /**
     * TC-CART-05: Thêm sản phẩm đã có nhưng khác size → tạo mới (không increment)
     * Branch: Cart::where(product_id, size='M')->first() → null (size khác) → Cart::create()
     */
    public function test_add_same_product_different_size_creates_new(): void
    {
        $product = Product::factory()->create();
        Cart::factory()->create([
            'user_id'    => $this->user->id,
            'product_id' => $product->id,
            'quantity'   => 2,
            'size'       => 'S',
        ]);

        $this->withHeaders($this->auth())->postJson('/api/v1/cart', [
            'product_id' => $product->id,
            'quantity'   => 1,
            'size'       => 'XL',
        ]);

        // Phải có 2 records trong giỏ (size S và XL)
        $cartCount = Cart::where('user_id', $this->user->id)
                         ->where('product_id', $product->id)
                         ->count();
        $this->assertEquals(2, $cartCount);
    }

    /**
     * TC-CART-06: Size không hợp lệ → trả về lỗi "Size không hợp lệ"
     * Branch: $validator->errors()->has('size') → true → trả về message đặc biệt
     */
    public function test_add_to_cart_invalid_size(): void
    {
        $product = Product::factory()->create();

        $response = $this->withHeaders($this->auth())->postJson('/api/v1/cart', [
            'product_id' => $product->id,
            'quantity'   => 1,
            'size'       => 'XXL', // Không hợp lệ
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('message', 'Size không hợp lệ');
    }

    /**
     * TC-CART-07: Thiếu product_id → validation fail
     * Branch: $validator->fails() → true → 'size' not has → lỗi chung
     */
    public function test_add_to_cart_missing_product_id(): void
    {
        $response = $this->withHeaders($this->auth())->postJson('/api/v1/cart', [
            'quantity' => 1,
            'size'     => 'M',
        ]);

        // Trả về 200 với message lỗi (theo logic controller)
        $response->assertStatus(200)
                 ->assertJsonPath('message', 'Dữ liệu không hợp lệ');
    }

    /**
     * TC-CART-08: Quantity < 1 → validation fail
     * Branch: 'quantity' => 'min:1' triggered
     */
    public function test_add_to_cart_quantity_less_than_one(): void
    {
        $product = Product::factory()->create();

        $response = $this->withHeaders($this->auth())->postJson('/api/v1/cart', [
            'product_id' => $product->id,
            'quantity'   => 0,
            'size'       => 'M',
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('message', 'Dữ liệu không hợp lệ');
    }

    /**
     * TC-CART-09: Không có token → 401 (middleware)
     * Branch: auth:sanctum middleware rejects
     */
    public function test_add_to_cart_unauthenticated(): void
    {
        $product = Product::factory()->create();

        $response = $this->postJson('/api/v1/cart', [
            'product_id' => $product->id,
            'quantity'   => 1,
            'size'       => 'M',
        ]);

        $response->assertStatus(401);
    }

    // =====================================================================
    // UPDATE TESTS
    // =====================================================================

    /**
     * TC-CART-10: Cập nhật quantity cart item thành công
     * Branch: Cart::where(id, user_id)->firstOrFail() → found → update()
     */
    public function test_update_cart_quantity_success(): void
    {
        $product = Product::factory()->create(['gia' => 100000]);
        $cart    = Cart::factory()->create([
            'user_id'    => $this->user->id,
            'product_id' => $product->id,
            'quantity'   => 1,
        ]);

        $response = $this->withHeaders($this->auth())
                         ->patchJson("/api/v1/cart/{$cart->id}", [
                             'quantity' => 5,
                         ]);

        $response->assertStatus(200)
                 ->assertJsonPath('message', 'Đã cập nhật giỏ hàng')
                 ->assertJsonStructure(['message', 'cart', 'total_price']);

        $this->assertDatabaseHas('cart_table_v2', [
            'id'       => $cart->id,
            'quantity' => 5,
        ]);
    }

    /**
     * TC-CART-11: Cập nhật cart item không thuộc về user hiện tại → 404
     * Branch: Cart::where(id, user_id)->firstOrFail() → throws ModelNotFoundException
     */
    public function test_update_cart_belonging_to_another_user(): void
    {
        $otherUser = User::factory()->create();
        $product   = Product::factory()->create();
        $cart      = Cart::factory()->create([
            'user_id'    => $otherUser->id,
            'product_id' => $product->id,
        ]);

        $response = $this->withHeaders($this->auth())
                         ->patchJson("/api/v1/cart/{$cart->id}", [
                             'quantity' => 5,
                         ]);

        $response->assertStatus(404);
    }

    /**
     * TC-CART-12: Cập nhật quantity = 0 → validation fail 422
     * Branch: 'quantity' => 'min:1' triggered
     */
    public function test_update_cart_invalid_quantity(): void
    {
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);

        $response = $this->withHeaders($this->auth())
                         ->patchJson("/api/v1/cart/{$cart->id}", [
                             'quantity' => 0,
                         ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['quantity']);
    }

    // =====================================================================
    // DESTROY TESTS
    // =====================================================================

    /**
     * TC-CART-13: Xóa cart item thành công
     * Branch: Cart::where(id, user_id)->first() → found → delete()
     */
    public function test_delete_cart_item_success(): void
    {
        $product = Product::factory()->create();
        $cart    = Cart::factory()->create([
            'user_id'    => $this->user->id,
            'product_id' => $product->id,
        ]);

        $response = $this->withHeaders($this->auth())
                         ->deleteJson("/api/v1/cart/{$cart->id}");

        $response->assertStatus(200)
                 ->assertJsonPath('message', 'Đã xóa sản phẩm khỏi giỏ hàng')
                 ->assertJsonPath('deleted_cart_id', $cart->id);

        $this->assertDatabaseMissing('cart_table_v2', ['id' => $cart->id]);
    }

    /**
     * TC-CART-14: Xóa cart item không tồn tại → trả về null
     * Branch: Cart::where(id, user_id)->first() → null → trả về message lỗi
     */
    public function test_delete_nonexistent_cart_item(): void
    {
        $response = $this->withHeaders($this->auth())
                         ->deleteJson('/api/v1/cart/99999');

        $response->assertStatus(200)
                 ->assertJsonPath('message', 'ID không hợp lệ')
                 ->assertJsonPath('deleted_cart_id', null);
    }
}
