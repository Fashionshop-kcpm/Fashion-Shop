<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'ten_sp'      => $this->faker->words(3, true),
            'gia'         => $this->faker->numberBetween(100000, 2000000),
            'gia_cu'      => $this->faker->optional()->numberBetween(150000, 2500000),
            'mo_ta'       => $this->faker->paragraph(),
            'so_luong'    => $this->faker->numberBetween(1, 100),
            'gioi_tinh'   => $this->faker->randomElement([0, 1]),
            'category_id' => Category::factory(),
            'hinh_anh'    => null,
        ];
    }
}
