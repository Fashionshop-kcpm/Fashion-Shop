<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserAddressFactory extends Factory
{
    protected $model = UserAddress::class;

    public function definition(): array
    {
        return [
            'user_id'         => User::factory(),
            'fullname'        => $this->faker->name(),
            'phone'           => '0' . $this->faker->numerify('#########'),
            'address_details' => $this->faker->address(),
            'is_default'      => 0,
        ];
    }
}
