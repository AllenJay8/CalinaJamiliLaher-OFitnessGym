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

    public function calculateDates(MembershipPlan $plan, ?Carbon $startDate = null): array
    {
        $start = $startDate ?? Carbon::today();
        $end = $start->copy()->addDays($plan->duration_days - 1);

        return [
            'start_date' => $start,
            'end_date' => $end,
            'status' => $this->calculateStatus($end),
        ];
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
