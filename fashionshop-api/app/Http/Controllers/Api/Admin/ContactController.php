<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function index()
    {
        return response()->json(
            Contact::orderBy('created_at', 'desc')->paginate(10)
        );
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:new,read,resolved']);

        Contact::findOrFail($id)->update(['status' => $request->status]);

        return response()->json(['message' => 'Đã cập nhật trạng thái']);
    }
}