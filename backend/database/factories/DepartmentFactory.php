<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Department>
 */
class DepartmentFactory extends Factory
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
                'Phòng Nhân Sự',
                'Phòng Kế Toán',
                'Phòng Marketing',
                'Phòng IT',
                'Phòng Bán Hàng',
                'Phòng Hỗ Trợ Khách Hàng',
                'Phòng Nghiên Cứu & Phát Triển',
                'Phòng Sản Xuất',
                'Phòng Mua Hàng',
                'Phòng Vận Hành'
            ]),
            'description' => $this->faker->sentence(),
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
