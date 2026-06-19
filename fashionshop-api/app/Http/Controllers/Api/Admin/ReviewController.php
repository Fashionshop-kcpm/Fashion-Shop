<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index()
        {
        $reviews = Review::with(['user', 'product'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'reviews' => $reviews,
            'data' => $reviews->items()
        ]);

}

    public function reply(Request $request, $id)
    {
        $request->validate(['shop_reply' => 'required|string']);

        $review = Review::findOrFail($id);
        $review->update(['shop_reply' => $request->shop_reply]);

        $review = $review->fresh();

        return response()->json([
            'id' => $review->id,
            'shop_reply' => $review->shop_reply,
            'reply_message' => 'Đã phản hồi đánh giá thành công',
            'data' => $review
        ]);
    }

    public function destroy($id)
    {
    $review = Review::find($id);

    if (!$review) {
        return response()->json([
            'message' => 'Không tìm thấy đánh giá',
            'data' => null
        ], 404);
    }

    $deletedAt = now()->toDateTimeString();

    $review->delete();

    return response()->json([
        'message' => 'Đã xóa đánh giá',
        'deleted_at' => $deletedAt,
        'data' => [
            'id' => $id,
            'deleted' => true
        ]
    ]);

    }
}