<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAddress extends Model
{
    protected $fillable = ['user_id', 'fullname', 'phone', 'address_details', 'is_default'];

    public function user() {
        return $this->belongsTo(User::class);
    }
}