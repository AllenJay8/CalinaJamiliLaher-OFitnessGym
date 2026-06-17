<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Attendance::with('member');

        if ($search = $request->get('search')) {
            $query->whereHas('member', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('member_code', 'like', "%{$search}%");
            });
        }

        if ($date = $request->get('date')) {
            $query->whereDate('date', $date);
        }

        if ($memberId = $request->get('member_id')) {
            $query->where('member_id', $memberId);
        }

        $sortBy = $request->get('sort_by', 'date');
        $sortDir = $request->get('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        return response()->json($query->paginate($request->get('per_page', 10)));
    }

    public function checkIn(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
        ]);

        $member = Member::findOrFail($validated['member_id']);

        if ($member->membership_status === 'expired') {
            return response()->json(['message' => 'Member membership has expired.'], 422);
        }

        $today = now()->toDateString();
        $existing = Attendance::where('member_id', $member->id)->whereDate('date', $today)->first();

        if ($existing) {
            return response()->json(['message' => 'Member already checked in today.', 'attendance' => $existing], 422);
        }

        $attendance = Attendance::create([
            'member_id' => $member->id,
            'date' => $today,
            'time_in' => now()->format('H:i:s'),
            'status' => 'present',
        ]);

        return response()->json($attendance->load('member'), 201);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
            'date' => 'required|date',
            'time_in' => 'required|date_format:H:i',
            'status' => 'required|in:present,late,absent',
        ]);

        $attendance = Attendance::create($validated);

        return response()->json($attendance->load('member'), 201);
    }

    public function show(Attendance $attendance): JsonResponse
    {
        return response()->json($attendance->load('member'));
    }

    public function update(Request $request, Attendance $attendance): JsonResponse
    {
        $validated = $request->validate([
            'date' => 'sometimes|date',
            'time_in' => 'sometimes|date_format:H:i',
            'status' => 'sometimes|in:present,late,absent',
        ]);

        $attendance->update($validated);

        return response()->json($attendance->load('member'));
    }

    public function destroy(Attendance $attendance): JsonResponse
    {
        $attendance->delete();

        return response()->json(['message' => 'Attendance record deleted successfully']);
    }
}
