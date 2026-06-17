<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipPlan;
use App\Models\Payment;
use App\Services\MembershipService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MemberSeeder extends Seeder
{
    private array $filipinoMembers = [
        ['Juan', 'Santos', 'Dela Cruz', 'male'],
        ['Maria', 'Lopez', 'Santos', 'female'],
        ['Jose', null, 'Reyes', 'male'],
        ['Anna', 'Garcia', 'Lopez', 'female'],
        ['Mark', 'Torres', 'Lopez', 'male'],
        ['Angela', 'Cruz', 'Mendoza', 'female'],
        ['Carlo', 'Ramos', 'Villanueva', 'male'],
        ['Patricia', null, 'Bautista', 'female'],
        ['Miguel', 'Flores', 'Gonzales', 'male'],
        ['Grace', 'Rivera', 'Aquino', 'female'],
        ['Rafael', null, 'Fernandez', 'male'],
        ['Sophia', 'Castillo', 'Domingo', 'female'],
        ['Paolo', 'Navarro', 'Silva', 'male'],
        ['Isabella', 'Morales', 'Romero', 'female'],
        ['Daniel', null, 'Herrera', 'male'],
        ['Camille', 'Santiago', 'Perez', 'female'],
        ['Gabriel', 'Valdez', 'Cruz', 'male'],
        ['Nicole', null, 'Gutierrez', 'female'],
        ['Adrian', 'Mercado', 'Salazar', 'male'],
        ['Hannah', 'Ocampo', 'Tan', 'female'],
        ['Christian', null, 'Lim', 'male'],
        ['Bianca', 'Chua', 'Sy', 'female'],
        ['Jerome', 'Go', 'Co', 'male'],
        ['Katrina', null, 'Yu', 'female'],
        ['Vincent', 'Tan', 'Ng', 'male'],
        ['Elaine', 'Wong', 'Lee', 'female'],
        ['Francis', null, 'Chan', 'male'],
        ['Michelle', 'Ho', 'Lin', 'female'],
        ['Kevin', 'Zhang', 'Wu', 'male'],
        ['Joyce', null, 'Kim', 'female'],
    ];

    public function run(): void
    {
        $membershipService = app(MembershipService::class);
        $plans = MembershipPlan::all()->keyBy(fn ($p) => $p->category.'_'.$p->type);

        DB::transaction(function () use ($membershipService, $plans) {
            foreach ($this->filipinoMembers as $index => [$firstName, $middleName, $lastName, $gender]) {
                $category = fake()->randomElement(['student', 'regular']);
                $planType = fake()->randomElement(['daily', 'monthly', 'yearly']);
                $planKey = $category.'_'.$planType;
                $plan = $plans->get($planKey);

                if (! $plan) {
                    continue;
                }

                $registrationDate = Carbon::now()->subDays(fake()->numberBetween(1, 120));
                $dates = $membershipService->calculateDates($plan, $registrationDate->copy());

                $member = Member::create([
                    'member_code' => 'OFM-'.str_pad((string) ($index + 1), 5, '0', STR_PAD_LEFT),
                    'first_name' => $firstName,
                    'middle_name' => $middleName,
                    'last_name' => $lastName,
                    'gender' => $gender,
                    'birth_date' => fake()->dateTimeBetween('-45 years', '-18 years')->format('Y-m-d'),
                    'contact_number' => '09'.fake()->numerify('#########'),
                    'address' => fake()->randomElement([
                        '123 Rizal Street, Quezon City',
                        '456 Bonifacio Avenue, Makati',
                        '789 Mabini Road, Manila',
                        '321 Aguinaldo Highway, Cavite',
                        '654 Del Pilar Street, Pasig',
                        '987 Luna Street, Taguig',
                    ]),
                    'email' => null,
                    'profile_picture' => null,
                    'membership_category' => $category,
                    'membership_plan_id' => $plan->id,
                    'membership_status' => $dates['status'],
                    'membership_start_date' => $dates['start_date'],
                    'membership_end_date' => $dates['end_date'],
                    'registration_date' => $registrationDate->toDateString(),
                ]);

                Membership::create([
                    'member_id' => $member->id,
                    'membership_plan_id' => $plan->id,
                    'start_date' => $dates['start_date'],
                    'end_date' => $dates['end_date'],
                    'status' => $dates['status'],
                ]);

                Payment::create([
                    'reference_number' => $membershipService->generateReferenceNumber(),
                    'member_id' => $member->id,
                    'membership_plan_id' => $plan->id,
                    'amount' => $plan->price,
                    'payment_method' => fake()->randomElement(['cash', 'gcash', 'bank_transfer']),
                    'payment_date' => $registrationDate->toDateString(),
                    'payment_status' => 'paid',
                ]);
            }
        });
    }
}
