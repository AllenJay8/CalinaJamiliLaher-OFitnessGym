<?php

namespace App\Services;

use App\Models\Member;
use App\Models\MembershipPlan;
use App\Models\Notification;
use Carbon\Carbon;

class MembershipService
{
    public function calculateStatus(Carbon $endDate): string
    {
        $today = Carbon::today();

        if ($endDate->lt($today)) {
            return 'expired';
        }

        if ($endDate->gt($today) && $endDate->lte($today->copy()->addDays(7))) {
            return 'expiring_soon';
        }

        return 'active';
    }

    public function calculateEndDate(MembershipPlan $plan, Carbon $startDate): Carbon
    {
        return $startDate->copy()->addDays($plan->duration_days - 1);
    }

    public function calculateDates(MembershipPlan $plan, ?Carbon $startDate = null): array
    {
        $start = $startDate ?? Carbon::today();
        $end = $this->calculateEndDate($plan, $start);

        return [
            'start_date' => $start,
            'end_date' => $end,
            'status' => $this->calculateStatus($end),
        ];
    }

    public function planMatchesCategory(MembershipPlan $plan, string $category): bool
    {
        return $plan->category === $category;
    }

    public function formatPrice(float|string|null $price): ?string
    {
        if ($price === null) {
            return null;
        }

        return '₱'.number_format((float) $price, 2);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function normalizeMembershipFields(Member $member, array $data): array
    {
        $category = $data['membership_category'] ?? $member->membership_category;
        $planId = $data['membership_plan_id'] ?? $member->membership_plan_id;
        $plan = MembershipPlan::findOrFail($planId);

        if (! $this->planMatchesCategory($plan, $category)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'membership_plan_id' => ['The selected plan does not match the membership category.'],
            ]);
        }

        $startDate = isset($data['membership_start_date'])
            ? Carbon::parse($data['membership_start_date'])
            : Carbon::parse($member->membership_start_date);

        $planOrStartChanged = isset($data['membership_plan_id']) || isset($data['membership_start_date']);

        if ($planOrStartChanged && ! isset($data['membership_end_date'])) {
            $endDate = $this->calculateEndDate($plan, $startDate);
        } elseif (isset($data['membership_end_date'])) {
            $endDate = Carbon::parse($data['membership_end_date']);
        } else {
            $endDate = Carbon::parse($member->membership_end_date);
        }

        if ($endDate->lt($startDate)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'membership_end_date' => ['The end date must be on or after the start date.'],
            ]);
        }

        $data['membership_category'] = $category;
        $data['membership_plan_id'] = $plan->id;
        $data['membership_start_date'] = $startDate->toDateString();
        $data['membership_end_date'] = $endDate->toDateString();
        $data['membership_status'] = $this->calculateStatus($endDate);

        return $data;
    }

    public function generateMemberCode(): string
    {
        $lastMember = Member::orderByDesc('id')->first();
        $nextId = $lastMember ? $lastMember->id + 1 : 1;

        return 'OFM-'.str_pad((string) $nextId, 5, '0', STR_PAD_LEFT);
    }

    public function generateReferenceNumber(): string
    {
        return 'PAY-'.Carbon::now()->format('YmdHis').'-'.random_int(1000, 9999);
    }

    public function updateMemberStatuses(): void
    {
        Member::chunk(100, function ($members) {
            foreach ($members as $member) {
                $status = $this->calculateStatus(Carbon::parse($member->membership_end_date));

                if ($member->membership_status !== $status) {
                    $member->update(['membership_status' => $status]);
                }
            }
        });
    }
}
