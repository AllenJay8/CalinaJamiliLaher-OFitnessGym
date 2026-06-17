<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['username' => 'admin@fitness'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['username' => 'staff@fitness'],
            [
                'name' => 'Staff Member',
                'password' => Hash::make('admin123'),
                'role' => 'staff',
            ]
        );
    }
}
