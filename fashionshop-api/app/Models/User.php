<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $fillable = [
        'fullname', 'email', 'phone', 'gender', 'password'
    ];

    protected $hidden = ['password', 'remember_token'];

    public function cart() {
        return $this->hasMany(Cart::class);
    }

    public function orders() {
        return $this->hasMany(Order::class);
    }

    public function addresses() {
        return $this->hasMany(UserAddress::class);
    }

    public function reviews() {
        return $this->hasMany(Review::class);
    }
}
