<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category');

        if ($request->keyword) {
            $keyword = str_replace(' ', '', $request->keyword);
            $query->whereRaw("REPLACE(LOWER(ten_sp), ' ', '') LIKE ?", ["%{$keyword}%"]);
        }

        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->gioi_tinh !== null) {
            $query->where('gioi_tinh', $request->gioi_tinh);
        }

        $products = $query->paginate(8);

        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'reviews.user'])->find($id);

        if (!$product) {
            return response()->json(['message' => 'Sản phẩm không tồn tại'], 404);
        }

        $product->name = $product->ten_sp;

        return response()->json($product);
    }

    
}