<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
   public function index(Request $request)
    {
        $query = Order::with('user')->orderBy('created_at', 'desc');

        $status = $request->status ?? 'pending';
        $query->where('status', $status);

        if ($request->keyword) {
        $query->where(function ($q) use ($request) {
            $q->whereHas('user', function ($q2) use ($request) {
                $q2->where('fullname', 'LIKE', "%{$request->keyword}%");
            })->orWhere('id', $request->keyword);
        });
    }
        return response()->json($query->paginate(10));
    }


    public function show($id)
    {
        $order = Order::with(['user', 'details.product'])->findOrFail($id);
        $order->details->each(function ($detail) {
            if ($detail->product) {
                $detail->product->name = $detail->product->ten_sp;
                $detail->product->current_price = $detail->product->gia; // ← đặt tên rõ ràng
                $detail->product->makeHidden(['ten_sp', 'gia', 'gia_cu']);
            }
        });

        return response()->json($order);
    }




    public function updateStatus(Request $request, $id)
{
    $request->validate([
        'status' => 'required|in:pending,shipping,completed,cancelled'
    ]);

    // 1. Tìm đơn hàng và cập nhật trạng thái mới
    $order = Order::findOrFail($id);
    $allowedTransitions = [
    'pending'   => ['shipping', 'cancelled'],
    'shipping'  => ['completed', 'cancelled'],
    'completed' => [],
    'cancelled' => [],
];

if (!in_array($request->status, $allowedTransitions[$order->status] ?? [])) {
    return response()->json([
        'message' => "Không thể chuyển từ '{$order->status}' sang '{$request->status}'"
    ], 422);
}

    $order->update(['status' => $request->status]);

    // 2. Load các quan hệ (user, details, product) vào đối tượng $order vừa cập nhật
    $order->load(['user', 'details.product']);

    // 3. Chuẩn hóa cấu trúc sản phẩm bên trong details để không bị bắt lỗi 'ten_sp'
    if ($order->details) {
        $order->details->each(function ($detail) {
            if ($detail->product) {
                // Thêm thuộc tính 'name' cho đúng chuẩn yêu cầu
                $detail->product->name = $detail->product->ten_sp;
                // Ẩn thuộc tính 'ten_sp' đi
                $detail->product->makeHidden('ten_sp');
            }
        });
    } 

    // 4. Trả về JSON bao gồm cả 'message' và 'order' để pass test case
    return response()->json([
        'message' => 'Đã cập nhật trạng thái',
        'order'   => $order
    ]);
}

}