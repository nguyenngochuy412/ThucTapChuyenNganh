<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Position;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'phone' => $this->faker->phoneNumber(),
            'birth_date' => $this->faker->dateTimeBetween('-50 years', '-20 years')->format('Y-m-d'),
            'address' => $this->faker->address(),
            'department_id' => Department::inRandomOrder()->first()->id ?? Department::factory(),
            'position_id' => Position::inRandomOrder()->first()->id ?? Position::factory(),
            'hire_date' => $this->faker->dateTimeBetween('-5 years', 'now')->format('Y-m-d'),
            'avatar' => null,
            'is_active' => $this->faker->boolean(90), // 90% active
            'role' => $this->faker->randomElement(['admin', 'employee']),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function admin(): static {
        return $this->state(fn(array $attributes) => [
            'role'=> 'admin',
        ]);
    }

    public function employee(): static {
        return $this->state(fn(array $attributes) => [
            'role'=> 'employee',
        ]);
    }


    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
