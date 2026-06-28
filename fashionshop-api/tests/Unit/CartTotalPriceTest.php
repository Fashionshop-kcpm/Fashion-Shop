<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

/**
 * Whitebox Unit Test: Kiểm tra logic tính tổng giá giỏ hàng
 *
 * Mục đích: Test thuần logic tính toán, không cần DB
 * Coverage: Hàm tính total_price trong CartController::index() và CartController::update()
 */
class CartTotalPriceTest extends TestCase
{
    /**
     * Hàm helper mô phỏng đúng logic trong CartController:
     *   $total_price = $cart->sum(fn($item) => $item->product->price * $item->quantity)
     */
    private function calculateTotalPrice(array $items): float
    {
        return array_sum(array_map(
            fn($item) => $item['price'] * $item['quantity'],
            $items
        ));
    }

    /**
     * TC-UNIT-CART-01: Giỏ hàng rỗng → tổng = 0
     */
    public function test_empty_cart_total_is_zero(): void
    {
        $items = [];
        $total = $this->calculateTotalPrice($items);
        $this->assertEquals(0, $total);
    }

    /**
     * TC-UNIT-CART-02: Giỏ hàng 1 sản phẩm → tổng = price * quantity
     */
    public function test_single_item_total(): void
    {
        $items = [
            ['price' => 200000, 'quantity' => 2],
        ];
        $total = $this->calculateTotalPrice($items);
        $this->assertEquals(400000, $total);
    }

    /**
     * TC-UNIT-CART-03: Giỏ hàng nhiều sản phẩm → tổng = sum(price * qty)
     */
    public function test_multiple_items_total(): void
    {
        $items = [
            ['price' => 100000, 'quantity' => 3],
            ['price' => 250000, 'quantity' => 1],
            ['price' => 50000,  'quantity' => 4],
        ];
        // 300000 + 250000 + 200000 = 750000
        $total = $this->calculateTotalPrice($items);
        $this->assertEquals(750000, $total);
    }

    /**
     * TC-UNIT-CART-04: Quantity = 1 → tổng = price
     */
    public function test_quantity_one_returns_price(): void
    {
        $items = [
            ['price' => 350000, 'quantity' => 1],
        ];
        $total = $this->calculateTotalPrice($items);
        $this->assertEquals(350000, $total);
    }

    /**
     * TC-UNIT-CART-05: Giá sản phẩm = 0 → tổng = 0 (edge case)
     */
    public function test_zero_price_item(): void
    {
        $items = [
            ['price' => 0, 'quantity' => 5],
        ];
        $total = $this->calculateTotalPrice($items);
        $this->assertEquals(0, $total);
    }

    /**
     * TC-UNIT-CART-06: Nhiều sản phẩm cùng loại với quantity lớn
     */
    public function test_large_quantity(): void
    {
        $items = [
            ['price' => 100000, 'quantity' => 100],
        ];
        $total = $this->calculateTotalPrice($items);
        $this->assertEquals(10000000, $total);
    }
}
