<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Member;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();
        $startOfYear = Carbon::now()->startOfYear();

        $totalMembers = Member::count();
        $activeMembers = Member::where('membership_status', 'active')->count();
        $expiredMembers = Member::where('membership_status', 'expired')->count();
        $expiringSoon = Member::where('membership_status', 'expiring_soon')->count();
        $studentMembers = Member::where('membership_category', 'student')->count();
        $regularMembers = Member::where('membership_category', 'regular')->count();
        $todayAttendance = Attendance::whereDate('date', $today)->count();
        $newMembersThisMonth = Member::where('registration_date', '>=', $startOfMonth)->count();

        $dailyRevenue = Payment::whereDate('payment_date', $today)
            ->where('payment_status', 'paid')
            ->sum('amount');

        $monthlyRevenue = Payment::where('payment_date', '>=', $startOfMonth)
            ->where('payment_status', 'paid')
            ->sum('amount');

        $yearlyRevenue = Payment::where('payment_date', '>=', $startOfYear)
            ->where('payment_status', 'paid')
            ->sum('amount');

        $totalRevenue = Payment::where('payment_status', 'paid')->sum('amount');

        $monthlyRevenueChart = Payment::whereYear('payment_date', Carbon::now()->year)
            ->where('payment_status', 'paid')
            ->get()
            ->groupBy(fn ($p) => Carbon::parse($p->payment_date)->month)
            ->map(fn ($group, $month) => [
                'month' => Carbon::create()->month((int) $month)->format('M'),
                'revenue' => (float) $group->sum('amount'),
            ])
            ->sortKeys()
            ->values();

        $attendanceChart = Attendance::select(
            DB::raw('DATE(date) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->where('date', '>=', $today->copy()->subDays(6))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($item) => [
                'date' => Carbon::parse($item->date)->format('M d'),
                'count' => $item->count,
            ]);

        $membershipStatusChart = [
            ['status' => 'Active', 'count' => $activeMembers],
            ['status' => 'Expiring Soon', 'count' => $expiringSoon],
            ['status' => 'Expired', 'count' => $expiredMembers],
        ];

        return response()->json([
            'stats' => [
                'total_members' => $totalMembers,
                'active_members' => $activeMembers,
                'expired_members' => $expiredMembers,
                'expiring_soon' => $expiringSoon,
                'student_members' => $studentMembers,
                'regular_members' => $regularMembers,
                'today_attendance' => $todayAttendance,
                'new_members_this_month' => $newMembersThisMonth,
                'daily_revenue' => (float) $dailyRevenue,
                'monthly_revenue' => (float) $monthlyRevenue,
                'yearly_revenue' => (float) $yearlyRevenue,
                'total_revenue' => (float) $totalRevenue,
            ],
            'charts' => [
                'monthly_revenue' => $monthlyRevenueChart,
                'attendance' => $attendanceChart,
                'membership_status' => $membershipStatusChart,
            ],
        ]);
    }
}
