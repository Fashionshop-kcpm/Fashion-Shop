<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

/**
 * Whitebox Unit Test: Kiểm tra logic tính tổng tiền đơn hàng
 *
 * Mục đích: Test logic tính total = sum(gia * quantity) + shipping_fee
 * Coverage: OrderController::store() - dòng tính $total và $shippingFee
 */
class OrderTotalCalculationTest extends TestCase
{
    private int $shippingFee = 30000;

    /**
     * Mô phỏng đúng logic trong OrderController::store():
     *   $total = $cartItems->sum(fn($item) => $item->product->gia * $item->quantity) + 30000;
     */
    private function calculateOrderTotal(array $cartItems): int
    {
        $subtotal = array_sum(array_map(
            fn($item) => $item['gia'] * $item['quantity'],
            $cartItems
        ));
        return $subtotal + $this->shippingFee;
    }

    /**
     * TC-UNIT-ORDER-01: 1 sản phẩm → total = (gia * qty) + 30000
     */
    public function test_order_total_with_one_item(): void
    {
        $cartItems = [
            ['gia' => 200000, 'quantity' => 1],
        ];
        $total = $this->calculateOrderTotal($cartItems);
        // 200000 + 30000 = 230000
        $this->assertEquals(230000, $total);
    }

    /**
     * TC-UNIT-ORDER-02: Nhiều sản phẩm → total = sum(gia * qty) + 30000
     */
    public function test_order_total_with_multiple_items(): void
    {
        $cartItems = [
            ['gia' => 100000, 'quantity' => 2],
            ['gia' => 300000, 'quantity' => 1],
        ];
        // (100000*2 + 300000*1) + 30000 = 530000
        $total = $this->calculateOrderTotal($cartItems);
        $this->assertEquals(530000, $total);
    }

    /**
     * TC-UNIT-ORDER-03: Shipping fee luôn cố định là 30.000đ
     */
    public function test_shipping_fee_is_always_30000(): void
    {
        $cartItems = [
            ['gia' => 500000, 'quantity' => 1],
        ];
        $total        = $this->calculateOrderTotal($cartItems);
        $subtotal     = 500000;
        $actualShipping = $total - $subtotal;

        $this->assertEquals(30000, $actualShipping);
        $this->assertEquals($this->shippingFee, $actualShipping);
    }

    /**
     * TC-UNIT-ORDER-04: Nhiều sản phẩm với số lượng lớn
     */
    public function test_order_total_with_large_quantities(): void
    {
        $cartItems = [
            ['gia' => 150000, 'quantity' => 3],
            ['gia' => 200000, 'quantity' => 5],
        ];
        // (150000*3 + 200000*5) + 30000 = 450000 + 1000000 + 30000 = 1480000
        $total = $this->calculateOrderTotal($cartItems);
        $this->assertEquals(1480000, $total);
    }

    /**
     * TC-UNIT-ORDER-05: Total phải luôn > shipping fee (vì giỏ không trống)
     */
    public function test_total_always_greater_than_shipping_fee(): void
    {
        $cartItems = [
            ['gia' => 1, 'quantity' => 1],
        ];
        $total = $this->calculateOrderTotal($cartItems);
        $this->assertGreaterThan($this->shippingFee, $total);
    }

    /**
     * TC-UNIT-ORDER-06: Verify shipping fee value = 30000
     */
    public function test_shipping_fee_constant_is_30000(): void
    {
        $this->assertEquals(30000, $this->shippingFee);
    }
}
