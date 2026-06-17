<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\MembershipPlan;
use App\Models\Payment;
use App\Services\MembershipService;
use App\Services\NotificationService;
use App\Services\WebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        private MembershipService $membershipService,
        private NotificationService $notificationService,
        private WebhookService $webhookService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Payment::with(['member', 'membershipPlan']);

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                    ->orWhereHas('member', function ($mq) use ($search) {
                        $mq->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                    });
            });
        }

        if ($status = $request->get('status')) {
            $query->where('payment_status', $status);
        }

        if ($method = $request->get('payment_method')) {
            $query->where('payment_method', $method);
        }

        $sortBy = $request->get('sort_by', 'payment_date');
        $sortDir = $request->get('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        return response()->json($query->paginate($request->get('per_page', 10)));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
            'membership_plan_id' => 'required|exists:membership_plans,id',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,gcash,bank_transfer,card,other',
            'payment_date' => 'required|date',
            'payment_status' => 'in:paid,pending,cancelled',
            'notes' => 'nullable|string',
        ]);

        $member = Member::findOrFail($validated['member_id']);
        $plan = MembershipPlan::findOrFail($validated['membership_plan_id']);

        $payment = Payment::create([
            'reference_number' => $this->membershipService->generateReferenceNumber(),
            'member_id' => $validated['member_id'],
            'membership_plan_id' => $validated['membership_plan_id'],
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'payment_date' => $validated['payment_date'],
            'payment_status' => $validated['payment_status'] ?? 'paid',
            'notes' => $validated['notes'] ?? null,
        ]);

        $this->notificationService->paymentReceived(
            $member->full_name,
            $member->id,
            '₱'.number_format($validated['amount'], 2)
        );

        $this->webhookService->paymentRecorded([
            'reference_number' => $payment->reference_number,
            'member_name' => $member->full_name,
            'membership_category' => $plan->category,
            'membership_plan_type' => $plan->type,
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
        ]);

        return response()->json($payment->load(['member', 'membershipPlan']), 201);
    }

    public function show(Payment $payment): JsonResponse
    {
        return response()->json($payment->load(['member', 'membershipPlan']));
    }

    public function update(Request $request, Payment $payment): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'sometimes|numeric|min:0',
            'payment_method' => 'sometimes|in:cash,gcash,bank_transfer,card,other',
            'payment_date' => 'sometimes|date',
            'payment_status' => 'sometimes|in:paid,pending,cancelled',
            'notes' => 'nullable|string',
        ]);

        $payment->update($validated);

        return response()->json($payment->load(['member', 'membershipPlan']));
    }

    public function destroy(Payment $payment): JsonResponse
    {
        $payment->delete();

        return response()->json(['message' => 'Payment deleted successfully']);
    }
}
