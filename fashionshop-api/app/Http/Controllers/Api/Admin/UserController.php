<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::orderBy('created_at', 'desc');

        if ($request->keyword) {
            $query->where('fullname', 'LIKE', "%{$request->keyword}%")
                  ->orWhere('email', 'LIKE', "%{$request->keyword}%");
        }

        return response()->json($query->paginate(20));
    }

    public function show($id)
    {
        return response()->json([
            'message' => 'Lấy user thành công',
            'data' => User::findOrFail($id)
        ]);
    }
}