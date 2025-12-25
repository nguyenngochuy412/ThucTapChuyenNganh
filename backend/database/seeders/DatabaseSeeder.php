<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Position;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // $departments = Department::factory(5)->create();

        // $positions = Position::factory(7)->create();

        User::factory()->admin()->create([   
            'name' => 'Huy Admin',
            'email' => 'phung@gmail.com',
            'password' => '15032004',
            'department_id' => 1,
            'position_id' => 1,
        ]);
    }
}
