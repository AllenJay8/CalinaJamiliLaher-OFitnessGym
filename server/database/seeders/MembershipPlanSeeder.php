<?php

namespace Database\Seeders;

use App\Models\MembershipPlan;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MembershipPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            ['name' => 'Student Daily Pass', 'category' => 'student', 'type' => 'daily', 'price' => 29.00, 'duration_days' => 1],
            ['name' => 'Student Monthly Membership', 'category' => 'student', 'type' => 'monthly', 'price' => 300.00, 'duration_days' => 30],
            ['name' => 'Student Yearly Membership', 'category' => 'student', 'type' => 'yearly', 'price' => 3000.00, 'duration_days' => 365],
            ['name' => 'Regular Daily Pass', 'category' => 'regular', 'type' => 'daily', 'price' => 39.00, 'duration_days' => 1],
            ['name' => 'Regular Monthly Membership', 'category' => 'regular', 'type' => 'monthly', 'price' => 400.00, 'duration_days' => 30],
            ['name' => 'Regular Yearly Membership', 'category' => 'regular', 'type' => 'yearly', 'price' => 4000.00, 'duration_days' => 365],
        ];

        foreach ($plans as $plan) {
            MembershipPlan::updateOrCreate(
                ['category' => $plan['category'], 'type' => $plan['type']],
                array_merge($plan, ['description' => $plan['name'], 'is_active' => true])
            );
        }
    }
}
