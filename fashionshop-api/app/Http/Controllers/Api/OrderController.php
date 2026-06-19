<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderDetail;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
       $orders = Order::with('details')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
        $order->total_quantity = $order->details->sum('quantity');
        $order->order_date = $order->created_at;
        return $order;
    });
        return response()->json($orders);
    }
  
    public function show(Request $request, $id)
    {
        $order = Order::with('details.product')
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return response()->json([
            'details' => $order->details->map(function ($detail) {
                $detail->product->size = $detail->size;
                $detail->total = $detail->price * $detail->quantity;
                return $detail;
            }),
            'order' => $order
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'fullname' => 'required|string',
            'phone'    => 'required|regex:/^[0-9]{9,11}$/',
            'address'  => 'required|string',
            'payment'  => 'required|in:COD',
        ]);

        $cartItems = Cart::with('product')
            ->where('user_id', $request->user()->id)
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Giỏ hàng trống'], 400);
        }

        $total = $cartItems->sum(fn($item) => $item->product->gia * $item->quantity) + 30000;

        $order = Order::create([
            'user_id'  => $request->user()->id,
            'fullname' => $request->fullname,
            'phone'    => $request->phone,
            'address'  => $request->address,
            'payment'  => $request->payment,
            'total'    => $total,
            'status'   => 'pending',
        ]);

        foreach ($cartItems as $item) {
            OrderDetail::create([
                'order_id'   => $order->id,
                'product_id' => $item->product_id,
                'quantity'   => $item->quantity,
                'price'      => $item->product->gia,
                'size'       => $item->size,
            ]);
        }

        Cart::where('user_id', $request->user()->id)->delete();

    $shippingFee = 30000;

    $total = $cartItems->sum(
        fn($item) => $item->product->gia * $item->quantity
    ) + $shippingFee;         return response()->json([
        'message' => 'Đặt hàng thành công',
        'shipping_fee' => $shippingFee,
        'order' => $order->load('details')
    ], 200);
        }

    public function cancel(Request $request, $id)
    {
        $order = Order::where('id', $id)
        ->where('user_id', $request->user()->id)
        ->firstOrFail();

    if ($order->status !== 'pending') {
        return response()->json([
            'message' => 'Không thể hủy đơn hàng này'
        ], 400);
    }

    $order->update([
        'status' => 'cancelled'
    ]);

    return response()->json([
        'message' => 'Đã hủy đơn hàng',
        'status'  => 'cancelled',
        'updated_at' => $order->updated_at
    ], 200);
    }
}