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
use Illuminate\Support\Facades\Storage;

class MemberController extends Controller
{
    public function __construct(
        private MembershipService $membershipService,
        private NotificationService $notificationService,
        private WebhookService $webhookService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Member::with('membershipPlan');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('member_code', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('contact_number', 'like', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->where('membership_status', $status);
        }

        if ($category = $request->get('category')) {
            $query->where('membership_category', $category);
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $members = $query->paginate($request->get('per_page', 10));

        return response()->json($members);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'gender' => 'required|in:male,female,other',
            'birth_date' => 'required|date',
            'contact_number' => 'required|string|max:20',
            'address' => 'nullable|string',
            'email' => 'nullable|email|max:255',
            'membership_category' => 'required|in:student,regular',
            'membership_plan_id' => 'required|exists:membership_plans,id',
            'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'payment_method' => 'required|in:cash,gcash,bank_transfer,card,other',
        ]);

        $plan = MembershipPlan::findOrFail($validated['membership_plan_id']);

        if (! $this->membershipService->planMatchesCategory($plan, $validated['membership_category'])) {
            return response()->json([
                'message' => 'The selected plan does not match the membership category.',
                'errors' => ['membership_plan_id' => ['The selected plan does not match the membership category.']],
            ], 422);
        }

        $dates = $this->membershipService->calculateDates($plan);

        return DB::transaction(function () use ($request, $validated, $plan, $dates) {
            $profilePath = null;
            if ($request->hasFile('profile_picture')) {
                $profilePath = $request->file('profile_picture')->store('members', 'public');
            }

            $member = Member::create([
                'member_code' => $this->membershipService->generateMemberCode(),
                'first_name' => $validated['first_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'last_name' => $validated['last_name'],
                'gender' => $validated['gender'],
                'birth_date' => $validated['birth_date'],
                'contact_number' => $validated['contact_number'],
                'address' => $validated['address'] ?? null,
                'email' => $validated['email'] ?? null,
                'profile_picture' => $profilePath,
                'membership_category' => $validated['membership_category'],
                'membership_plan_id' => $plan->id,
                'membership_status' => $dates['status'],
                'membership_start_date' => $dates['start_date'],
                'membership_end_date' => $dates['end_date'],
                'registration_date' => now()->toDateString(),
            ]);

            Membership::create([
                'member_id' => $member->id,
                'membership_plan_id' => $plan->id,
                'start_date' => $dates['start_date'],
                'end_date' => $dates['end_date'],
                'status' => $dates['status'],
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

            $memberData = $member->load('membershipPlan')->toArray();

            $this->notificationService->newMemberRegistered($member->full_name, $member->id);
            $this->notificationService->paymentReceived($member->full_name, $member->id, '₱'.number_format($plan->price, 2));

            $this->webhookService->memberRegistered($memberData);
            $this->webhookService->paymentRecorded([
                'reference_number' => $payment->reference_number,
                'member_name' => $member->full_name,
                'membership_category' => $plan->category,
                'membership_plan_type' => $plan->type,
                'amount' => $plan->price,
                'payment_method' => $validated['payment_method'],
            ]);

            return response()->json($member->load('membershipPlan'), 201);
        });
    }

    public function show(Member $member): JsonResponse
    {
        return response()->json($member->load(['membershipPlan', 'memberships', 'payments', 'attendances']));
    }

    public function update(Request $request, Member $member): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'gender' => 'sometimes|in:male,female,other',
            'birth_date' => 'sometimes|date|before_or_equal:today',
            'contact_number' => 'sometimes|string|max:20',
            'address' => 'nullable|string',
            'email' => 'nullable|string|max:255',
            'membership_category' => 'sometimes|in:student,regular',
            'membership_plan_id' => 'sometimes|exists:membership_plans,id',
            'membership_start_date' => 'sometimes|date',
            'membership_end_date' => 'sometimes|date',
            'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if (array_key_exists('email', $validated)) {
            $email = trim((string) ($validated['email'] ?? ''));
            $validated['email'] = $email === '' ? null : $email;

            if ($validated['email'] !== null && ! filter_var($validated['email'], FILTER_VALIDATE_EMAIL)) {
                return response()->json([
                    'message' => 'The email must be a valid email address.',
                    'errors' => ['email' => ['The email must be a valid email address.']],
                ], 422);
            }
        }

        $membershipFields = array_intersect_key($validated, array_flip([
            'membership_category',
            'membership_plan_id',
            'membership_start_date',
            'membership_end_date',
        ]));

        if (! empty($membershipFields)) {
            $validated = array_merge($validated, $this->membershipService->normalizeMembershipFields($member, $validated));
        }

        if ($request->hasFile('profile_picture')) {
            if ($member->profile_picture) {
                Storage::disk('public')->delete($member->profile_picture);
            }
            $validated['profile_picture'] = $request->file('profile_picture')->store('members', 'public');
        }

        $member->update($validated);

        return response()->json($member->fresh()->load('membershipPlan'));
    }

    public function destroyPhoto(Member $member): JsonResponse
    {
        if ($member->profile_picture) {
            Storage::disk('public')->delete($member->profile_picture);
            $member->update(['profile_picture' => null]);
        }

        return response()->json($member->fresh()->load('membershipPlan'));
    }

    public function destroy(Member $member): JsonResponse
    {
        if ($member->profile_picture) {
            Storage::disk('public')->delete($member->profile_picture);
        }

        $member->delete();

        return response()->json(['message' => 'Member deleted successfully']);
    }
}
