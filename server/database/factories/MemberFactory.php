<?php

namespace Database\Factories;

use App\Models\Member;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Member>
 */
class MemberFactory extends Factory
{
    protected $model = Member::class;

    public function definition(): array
    {
        return [
            'member_code' => 'OFM-'.fake()->unique()->numerify('#####'),
            'first_name' => fake()->firstName(),
            'middle_name' => fake()->optional()->firstName(),
            'last_name' => fake()->lastName(),
            'gender' => fake()->randomElement(['male', 'female']),
            'birth_date' => fake()->dateTimeBetween('-45 years', '-18 years')->format('Y-m-d'),
            'contact_number' => '09'.fake()->numerify('#########'),
            'address' => fake()->address(),
            'email' => fake()->optional()->safeEmail(),
            'profile_picture' => null,
            'membership_category' => fake()->randomElement(['student', 'regular']),
            'membership_plan_id' => 1,
            'membership_status' => fake()->randomElement(['active', 'expiring_soon', 'expired']),
            'membership_start_date' => now()->subDays(fake()->numberBetween(0, 30)),
            'membership_end_date' => now()->addDays(fake()->numberBetween(1, 365)),
            'registration_date' => now()->subDays(fake()->numberBetween(0, 90)),
        ];
    }
}
