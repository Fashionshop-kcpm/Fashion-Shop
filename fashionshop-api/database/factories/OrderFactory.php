<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'user_id'  => User::factory(),
            'fullname' => $this->faker->name(),
            'phone'    => '0' . $this->faker->numerify('#########'),
            'address'  => $this->faker->address(),
            'payment'  => 'COD',
            'total'    => $this->faker->numberBetween(100000, 5000000),
            'status'   => 'pending',
        ];
    }

    public function pending(): static
    {
        return $this->state(['status' => 'pending']);
    }

    public function shipping(): static
    {
        return $this->state(['status' => 'shipping']);
    }

    public function completed(): static
    {
        return $this->state(['status' => 'completed']);
    }

    public function cancelled(): static
    {
        return $this->state(['status' => 'cancelled']);
    }
}
