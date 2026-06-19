<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function index()
    {
        $contacts = Contact::orderBy('created_at', 'desc')->paginate(10);

        return response()->json([
            'contacts' => $contacts,
            'data' => $contacts->items()
        ]);
    }
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:new,read,resolved'
        ]);

        $contact = Contact::findOrFail($id);

        $contact->update([
            'status' => $request->status
        ]);

        return response()->json([
            'message' => 'Status updated successfully',
            'updated_status' => $contact->status
        ]);
    }
}