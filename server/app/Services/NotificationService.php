<?php

namespace App\Services;

use App\Models\Notification;

class NotificationService
{
    public function create(string $type, string $title, string $message, ?int $memberId = null): Notification
    {
        return Notification::create([
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'member_id' => $memberId,
            'is_read' => false,
        ]);
    }

    public function newMemberRegistered(string $memberName, int $memberId): Notification
    {
        return $this->create(
            'new_member',
            'New Member Registered',
            "New member {$memberName} has been registered.",
            $memberId
        );
    }

    public function membershipExpiringSoon(string $memberName, int $memberId, string $endDate): Notification
    {
        return $this->create(
            'expiring_soon',
            'Membership Expiring Soon',
            "Membership for {$memberName} expires on {$endDate}.",
            $memberId
        );
    }

    public function membershipExpired(string $memberName, int $memberId): Notification
    {
        return $this->create(
            'expired',
            'Membership Expired',
            "Membership for {$memberName} has expired.",
            $memberId
        );
    }

    public function paymentReceived(string $memberName, int $memberId, string $amount): Notification
    {
        return $this->create(
            'payment',
            'Payment Received',
            "Payment of {$amount} received from {$memberName}.",
            $memberId
        );
    }
}
