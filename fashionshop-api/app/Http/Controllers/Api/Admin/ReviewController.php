<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index()
    {
        return response()->json(
            Review::with(['user', 'product'])
                ->orderBy('created_at', 'desc')
                ->paginate(10)
        );
    }

    public function reply(Request $request, $id)
    {
        $request->validate(['shop_reply' => 'required|string']);

        $review = Review::findOrFail($id);
        $review->update(['shop_reply' => $request->shop_reply]);

        return response()->json(['message' => 'Đã phản hồi đánh giá']);
    }

    public function destroy($id)
    {
        Review::findOrFail($id)->delete();
        return response()->json(['message' => 'Đã xóa đánh giá']);
    }
}