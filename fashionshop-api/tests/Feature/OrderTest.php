<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Whitebox Feature Test: OrderController
 *
 * Coverage: index(), show(), store(), cancel()
 * Kiểm tra mọi nhánh điều kiện trong OrderController:
 *   - store(): giỏ hàng rỗng vs không rỗng; validation phone/payment
 *   - cancel(): status = 'pending' vs status khác; order thuộc user / không thuộc user
 */
class OrderTest extends TestCase
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
     * TC-ORDER-01: Lấy danh sách đơn hàng của user (không có đơn nào)
     * Branch: Order::where(user_id)->get() → empty collection
     */
    public function test_get_empty_orders_list(): void
    {
        $response = $this->withHeaders($this->auth())->getJson('/api/v1/orders');

        $response->assertStatus(200)
                 ->assertJson([]);
    }

    /**
     * TC-ORDER-02: Lấy danh sách đơn hàng của user (có đơn hàng)
     * Branch: Order::where(user_id)->orderBy('created_at', 'desc')->get() → non-empty
     *         Mỗi order được map thêm total_quantity và order_date
     */
    public function test_get_orders_list_with_orders(): void
    {
        Order::factory()->create(['user_id' => $this->user->id]);
        Order::factory()->create(['user_id' => $this->user->id]);

        $response = $this->withHeaders($this->auth())->getJson('/api/v1/orders');

        $response->assertStatus(200)
                 ->assertJsonCount(2);
    }

    /**
     * TC-ORDER-03: Đơn hàng của user khác không được lấy
     * Branch: Where clause 'user_id' = request->user()->id filters correctly
     */
    public function test_orders_are_user_isolated(): void
    {
        $otherUser = User::factory()->create();
        Order::factory()->count(3)->create(['user_id' => $otherUser->id]);

        $response = $this->withHeaders($this->auth())->getJson('/api/v1/orders');

        $response->assertStatus(200)
                 ->assertJson([]);
    }

    // =====================================================================
    // SHOW TESTS
    // =====================================================================

    /**
     * TC-ORDER-04: Xem chi tiết đơn hàng thành công
     * Branch: Order::with('details.product')->where(id, user_id)->firstOrFail() → found
     */
    public function test_show_order_detail_success(): void
    {
        $order = Order::factory()->create(['user_id' => $this->user->id]);

        $response = $this->withHeaders($this->auth())
                         ->getJson("/api/v1/orders/{$order->id}");

        $response->assertStatus(200)
                 ->assertJsonStructure(['details', 'order']);
    }

    /**
     * TC-ORDER-05: Xem đơn hàng của user khác → 404
     * Branch: firstOrFail() → ModelNotFoundException → 404
     */
    public function test_show_order_belonging_to_another_user(): void
    {
        $otherUser = User::factory()->create();
        $order     = Order::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->withHeaders($this->auth())
                         ->getJson("/api/v1/orders/{$order->id}");

        $response->assertStatus(404);
    }

    // =====================================================================
    // STORE TESTS
    // =====================================================================

    /**
     * TC-ORDER-06: Đặt hàng thành công
     * Branch: $cartItems->isEmpty() → false → Order::create() → foreach OrderDetail::create()
     *         → Cart::delete() → trả về 200
     */
    public function test_place_order_success(): void
    {
        $product = Product::factory()->create(['gia' => 200000]);
        Cart::factory()->create([
            'user_id'    => $this->user->id,
            'product_id' => $product->id,
            'quantity'   => 2,
            'size'       => 'M',
        ]);

        $response = $this->withHeaders($this->auth())->postJson('/api/v1/orders', [
            'fullname' => 'Nguyen Van A',
            'phone'    => '0912345678',
            'address'  => '123 Nguyen Hue, Ho Chi Minh',
            'payment'  => 'COD',
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('message', 'Đặt hàng thành công')
                 ->assertJsonStructure(['message', 'shipping_fee', 'order']);

        // Giỏ hàng phải được xóa sau khi đặt hàng
        $this->assertDatabaseCount('cart_table_v2', 0);

        // Đơn hàng và chi tiết phải được tạo
        $this->assertDatabaseHas('orders', [
            'user_id' => $this->user->id,
            'status'  => 'pending',
        ]);
    }

    /**
     * TC-ORDER-07: Đặt hàng khi giỏ hàng trống → 400
     * Branch: $cartItems->isEmpty() → true → return 400 'Giỏ hàng trống'
     */
    public function test_place_order_with_empty_cart(): void
    {
        $response = $this->withHeaders($this->auth())->postJson('/api/v1/orders', [
            'fullname' => 'Nguyen Van A',
            'phone'    => '0912345678',
            'address'  => '123 Nguyen Hue',
            'payment'  => 'COD',
        ]);

        $response->assertStatus(400)
                 ->assertJsonPath('message', 'Giỏ hàng trống');
    }

    /**
     * TC-ORDER-08: Đặt hàng với phone không hợp lệ → 422
     * Branch: 'phone' => 'regex:/^[0-9]{9,11}$/' triggered
     */
    public function test_place_order_invalid_phone(): void
    {
        $response = $this->withHeaders($this->auth())->postJson('/api/v1/orders', [
            'fullname' => 'Nguyen Van A',
            'phone'    => '123',
            'address'  => '123 Nguyen Hue',
            'payment'  => 'COD',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['phone']);
    }

    /**
     * TC-ORDER-09: Đặt hàng với payment không phải COD → 422
     * Branch: 'payment' => 'in:COD' validation triggered
     */
    public function test_place_order_invalid_payment_method(): void
    {
        $response = $this->withHeaders($this->auth())->postJson('/api/v1/orders', [
            'fullname' => 'Nguyen Van A',
            'phone'    => '0912345678',
            'address'  => '123 Nguyen Hue',
            'payment'  => 'MOMO',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['payment']);
    }

    /**
     * TC-ORDER-10: Đặt hàng thiếu địa chỉ → 422
     * Branch: 'address' => 'required' triggered
     */
    public function test_place_order_missing_address(): void
    {
        $response = $this->withHeaders($this->auth())->postJson('/api/v1/orders', [
            'fullname' => 'Nguyen Van A',
            'phone'    => '0912345678',
            'payment'  => 'COD',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['address']);
    }

    // =====================================================================
    // CANCEL TESTS
    // =====================================================================

    /**
     * TC-ORDER-11: Hủy đơn hàng ở trạng thái pending → thành công
     * Branch: $order->status === 'pending' → true → update('cancelled') → 200
     */
    public function test_cancel_pending_order_success(): void
    {
        $order = Order::factory()->pending()->create(['user_id' => $this->user->id]);

        $response = $this->withHeaders($this->auth())
                         ->patchJson("/api/v1/orders/{$order->id}/cancel");

        $response->assertStatus(200)
                 ->assertJsonPath('message', 'Đã hủy đơn hàng')
                 ->assertJsonPath('status', 'cancelled');

        $this->assertDatabaseHas('orders', [
            'id'     => $order->id,
            'status' => 'cancelled',
        ]);
    }

    /**
     * TC-ORDER-12: Hủy đơn hàng ở trạng thái shipping → 400 (không thể hủy)
     * Branch: $order->status !== 'pending' → true → return 400
     */
    public function test_cancel_shipping_order_fails(): void
    {
        $order = Order::factory()->shipping()->create(['user_id' => $this->user->id]);

        $response = $this->withHeaders($this->auth())
                         ->patchJson("/api/v1/orders/{$order->id}/cancel");

        $response->assertStatus(400)
                 ->assertJsonPath('message', 'Không thể hủy đơn hàng này');
    }

    /**
     * TC-ORDER-13: Hủy đơn hàng ở trạng thái completed → 400
     * Branch: $order->status !== 'pending' → true → return 400
     */
    public function test_cancel_completed_order_fails(): void
    {
        $order = Order::factory()->completed()->create(['user_id' => $this->user->id]);

        $response = $this->withHeaders($this->auth())
                         ->patchJson("/api/v1/orders/{$order->id}/cancel");

        $response->assertStatus(400)
                 ->assertJsonPath('message', 'Không thể hủy đơn hàng này');
    }

    /**
     * TC-ORDER-14: Hủy đơn hàng không tồn tại → 404
     * Branch: firstOrFail() → ModelNotFoundException
     */
    public function test_cancel_nonexistent_order(): void
    {
        $response = $this->withHeaders($this->auth())
                         ->patchJson('/api/v1/orders/99999/cancel');

        $response->assertStatus(404);
    }

    /**
     * TC-ORDER-15: Không xác thực → 401
     * Branch: auth:sanctum middleware rejects
     */
    public function test_place_order_unauthenticated(): void
    {
        $response = $this->postJson('/api/v1/orders', [
            'fullname' => 'Nguyen Van A',
            'phone'    => '0912345678',
            'address'  => '123 Nguyen Hue',
            'payment'  => 'COD',
        ]);

        $response->assertStatus(401);
    }
}
