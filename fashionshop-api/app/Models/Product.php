<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'ten_sp', 'gia', 'gia_cu', 'mo_ta', 'so_luong',
        'gioi_tinh', 'category_id', 'hinh_anh'
    ];

    public function category() {
        return $this->belongsTo(Category::class);
    }

    public function reviews() {
        return $this->hasMany(Review::class);
    }

    public function cartItems() {
        return $this->hasMany(Cart::class);
    }
}