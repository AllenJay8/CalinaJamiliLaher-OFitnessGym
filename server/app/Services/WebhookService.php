<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\WebhookLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebhookService
{
    public function dispatch(string $event, array $payload): WebhookLog
    {
        $url = config('services.webhook.url', env('WEBHOOK_URL', 'https://webhook.site/test'));

        try {
            $response = Http::timeout(10)->post($url, [
                'event' => $event,
                'timestamp' => now()->toIso8601String(),
                'data' => $payload,
            ]);

            return WebhookLog::create([
                'event' => $event,
                'payload' => $payload,
                'url' => $url,
                'status_code' => $response->status(),
                'response_body' => $response->body(),
                'success' => $response->successful(),
            ]);
        } catch (\Exception $e) {
            Log::error('Webhook dispatch failed: '.$e->getMessage());

            return WebhookLog::create([
                'event' => $event,
                'payload' => $payload,
                'url' => $url,
                'status_code' => null,
                'response_body' => $e->getMessage(),
                'success' => false,
            ]);
        }
    }

    public function memberRegistered(array $memberData): WebhookLog
    {
        return $this->dispatch('new_member_registered', $memberData);
    }

    public function paymentRecorded(array $paymentData): WebhookLog
    {
        $event = $this->getPaymentEvent(
            $paymentData['membership_category'] ?? '',
            $paymentData['membership_plan_type'] ?? ''
        );

        return $this->dispatch($event, $paymentData);
    }

    public function membershipExpiringSoon(array $memberData): WebhookLog
    {
        return $this->dispatch('membership_expiring_soon', $memberData);
    }

    public function membershipExpired(array $memberData): WebhookLog
    {
        return $this->dispatch('membership_expired', $memberData);
    }

    public function membershipRenewed(array $memberData): WebhookLog
    {
        return $this->dispatch('membership_renewed', $memberData);
    }

    private function getPaymentEvent(string $category, string $type): string
    {
        $categoryLabel = ucfirst($category);
        $typeLabel = match ($type) {
            'daily' => 'Daily Pass Purchased',
            'monthly' => 'Monthly Membership Purchased',
            'yearly' => 'Yearly Membership Purchased',
            default => 'Payment Recorded',
        };

        return strtolower(str_replace(' ', '_', "{$categoryLabel} {$typeLabel}"));
    }
}
