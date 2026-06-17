<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipPlan;
use App\Models\Payment;
use App\Services\MembershipService;
use App\Services\NotificationService;
use App\Services\WebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MembershipController extends Controller
{
    public function __construct(
        private MembershipService $membershipService,
        private NotificationService $notificationService,
        private WebhookService $webhookService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Membership::with(['member', 'membershipPlan']);

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($memberId = $request->get('member_id')) {
            $query->where('member_id', $memberId);
        }

        return response()->json($query->orderByDesc('created_at')->paginate($request->get('per_page', 10)));
    }

    public function renew(Request $request, Member $member): JsonResponse
    {
        $validated = $request->validate([
            'membership_plan_id' => 'required|exists:membership_plans,id',
            'payment_method' => 'required|in:cash,gcash,bank_transfer,card,other',
        ]);

        $plan = MembershipPlan::findOrFail($validated['membership_plan_id']);
        $dates = $this->membershipService->calculateDates($plan);

        return DB::transaction(function () use ($member, $plan, $dates, $validated) {
            $membership = Membership::create([
                'member_id' => $member->id,
                'membership_plan_id' => $plan->id,
                'start_date' => $dates['start_date'],
                'end_date' => $dates['end_date'],
                'status' => $dates['status'],
            ]);

            $member->update([
                'membership_plan_id' => $plan->id,
                'membership_category' => $plan->category,
                'membership_status' => $dates['status'],
                'membership_start_date' => $dates['start_date'],
                'membership_end_date' => $dates['end_date'],
            ]);

            $payment = Payment::create([
                'reference_number' => $this->membershipService->generateReferenceNumber(),
                'member_id' => $member->id,
                'membership_plan_id' => $plan->id,
                'amount' => $plan->price,
                'payment_method' => $validated['payment_method'],
                'payment_date' => now()->toDateString(),
                'payment_status' => 'paid',
            ]);

            $this->notificationService->paymentReceived($member->full_name, $member->id, '₱'.number_format($plan->price, 2));

            $this->webhookService->membershipRenewed($member->load('membershipPlan')->toArray());
            $this->webhookService->paymentRecorded([
                'reference_number' => $payment->reference_number,
                'member_name' => $member->full_name,
                'membership_category' => $plan->category,
                'membership_plan_type' => $plan->type,
                'amount' => $plan->price,
                'payment_method' => $validated['payment_method'],
            ]);

            return response()->json($membership->load(['member', 'membershipPlan']));
        });
    }
}
