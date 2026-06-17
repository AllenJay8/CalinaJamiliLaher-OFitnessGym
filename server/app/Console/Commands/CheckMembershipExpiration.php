<?php

namespace App\Console\Commands;

use App\Models\Member;
use App\Services\MembershipService;
use App\Services\NotificationService;
use App\Services\WebhookService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CheckMembershipExpiration extends Command
{
    protected $signature = 'memberships:check-expiration';

    protected $description = 'Check and update membership expiration statuses';

    public function handle(
        MembershipService $membershipService,
        NotificationService $notificationService,
        WebhookService $webhookService
    ): int {
        $today = Carbon::today();

        Member::chunk(100, function ($members) use ($membershipService, $notificationService, $webhookService, $today) {
            foreach ($members as $member) {
                $endDate = Carbon::parse($member->membership_end_date);
                $newStatus = $membershipService->calculateStatus($endDate);

                if ($member->membership_status !== $newStatus) {
                    $oldStatus = $member->membership_status;
                    $member->update(['membership_status' => $newStatus]);

                    if ($newStatus === 'expiring_soon' && $oldStatus === 'active') {
                        $notificationService->membershipExpiringSoon(
                            $member->full_name,
                            $member->id,
                            $endDate->format('M d, Y')
                        );
                        $webhookService->membershipExpiringSoon($member->toArray());
                    }

                    if ($newStatus === 'expired') {
                        $notificationService->membershipExpired($member->full_name, $member->id);
                        $webhookService->membershipExpired($member->toArray());
                    }
                }
            }
        });

        $this->info('Membership expiration check completed.');

        return Command::SUCCESS;
    }
}
