<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        return [
            'ten_danh_muc' => $this->faker->randomElement([
                'Áo', 'Quần', 'Váy', 'Đầm', 'Jacket', 'Phụ kiện'
            ]),
        ];
    }
}
