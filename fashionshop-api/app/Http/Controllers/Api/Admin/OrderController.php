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
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('fullname', 'LIKE', "%{$request->keyword}%");
            })->orWhere('id', $request->keyword);
        }
        return response()->json($query->paginate(10));
    }

    public function show($id)
    {
        $order = Order::with(['user', 'details.product'])->findOrFail($id);
        return response()->json($order);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,shipping,completed,cancelled'
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);

        return response()->json(['message' => 'Đã cập nhật trạng thái']);
    }
}