<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MembershipPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MembershipPlanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MembershipPlan::query();

        if ($category = $request->get('category')) {
            $query->where('category', $category);
        }

        if ($type = $request->get('type')) {
            $query->where('type', $type);
        }

        if ($request->get('active_only')) {
            $query->where('is_active', true);
        }

        return response()->json($query->orderBy('category')->orderBy('type')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|in:student,regular',
            'type' => 'required|in:daily,monthly,yearly',
            'price' => 'required|numeric|min:0',
            'duration_days' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $plan = MembershipPlan::create($validated);

        return response()->json($plan, 201);
    }

    public function show(MembershipPlan $membershipPlan): JsonResponse
    {
        return response()->json($membershipPlan);
    }

    public function update(Request $request, MembershipPlan $membershipPlan): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'category' => 'sometimes|in:student,regular',
            'type' => 'sometimes|in:daily,monthly,yearly',
            'price' => 'sometimes|numeric|min:0',
            'duration_days' => 'sometimes|integer|min:1',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $membershipPlan->update($validated);

        return response()->json($membershipPlan);
    }

    public function destroy(MembershipPlan $membershipPlan): JsonResponse
    {
        $membershipPlan->delete();

        return response()->json(['message' => 'Membership plan deleted successfully']);
    }
}
