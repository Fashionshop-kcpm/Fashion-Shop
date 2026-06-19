<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
{
    $totalRevenue = Order::where('status', 'completed')->sum('total');
    $totalOrders  = Order::count();
    $totalUsers   = User::count();
    $totalProducts = Product::count();
    $recentOrders = Order::with('user')
        ->orderBy('created_at', 'desc')
        ->limit(7)
        ->get();

    $data = [
        'total_revenue'  => $totalRevenue,
        'total_orders'   => $totalOrders,
        'total_users'    => $totalUsers,
        'total_products' => $totalProducts,
        'recent_orders'  => $recentOrders,
        'latest_orders'  => $recentOrders,
    ];

    return response()->json(array_merge($data, ['data' => $data]));
}
}