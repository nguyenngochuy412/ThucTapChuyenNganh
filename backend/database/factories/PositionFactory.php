<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Position>
 */
class PositionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->randomElement([
                'Trưởng Phòng',
                'Phó Phòng',
                'Trưởng Nhóm',
                'Chuyên Viên',
                'Nhân Viên',
                'Thực Tập Sinh',
                'Cộng Tác Viên'
            ]),
            'description' => $this->faker->sentence(),
            'salary' => $this->faker->randomElement([
                10000000, // 10 triệu
                15000000, // 15 triệu
                20000000, // 20 triệu
                25000000, // 25 triệu
                35000000, // 35 triệu
                4500000, // 45 triệu
                65789999 // 65.789.999 VND
            ]),
            'is_active' => $this->faker->boolean(95),
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
                'is_active' => false,
        ]);
    }
}
