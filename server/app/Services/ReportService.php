<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Member;
use App\Models\MembershipPlan;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function build(string $type, string $startDate, string $endDate): array
    {
        $summary = $this->globalSummary($startDate, $endDate);

        $report = match ($type) {
            'student_revenue' => $this->categoryRevenueReport('student', 'Student Revenue Report', $startDate, $endDate),
            'regular_revenue' => $this->categoryRevenueReport('regular', 'Regular Revenue Report', $startDate, $endDate),
            'daily_pass' => $this->planTypeReport('daily', 'Daily Pass Report', $startDate, $endDate),
            'monthly_membership' => $this->planTypeReport('monthly', 'Monthly Membership Report', $startDate, $endDate),
            'yearly_membership' => $this->planTypeReport('yearly', 'Yearly Membership Report', $startDate, $endDate),
            'attendance' => $this->attendanceReport($startDate, $endDate),
            'members' => $this->memberReport($startDate, $endDate),
            'membership' => $this->membershipReport($startDate, $endDate),
            default => $this->revenueReport($startDate, $endDate),
        };

        $report['summary'] = array_merge($summary, $report['summary'] ?? []);

        return $report;
    }

    public function globalSummary(string $startDate, string $endDate): array
    {
        $totalMembers = Member::count();
        $activeMembers = Member::where('membership_status', 'active')->count();
        $expiredMembers = Member::where('membership_status', 'expired')->count();
        $expiringSoon = Member::where('membership_status', 'expiring_soon')->count();

        $totalRevenue = Payment::where('payment_status', 'paid')
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->sum('amount');

        $membershipBreakdown = Member::select('membership_category', DB::raw('COUNT(*) as count'))
            ->groupBy('membership_category')
            ->get()
            ->mapWithKeys(fn ($row) => [$row->membership_category => $row->count])
            ->toArray();

        $planBreakdown = Member::join('membership_plans', 'members.membership_plan_id', '=', 'membership_plans.id')
            ->select('membership_plans.name', DB::raw('COUNT(*) as count'))
            ->groupBy('membership_plans.name')
            ->get()
            ->map(fn ($row) => ['plan' => $row->name, 'count' => $row->count])
            ->values()
            ->toArray();

        return [
            'total_members' => $totalMembers,
            'active_members' => $activeMembers,
            'expired_members' => $expiredMembers,
            'expiring_soon' => $expiringSoon,
            'total_revenue' => (float) $totalRevenue,
            'membership_breakdown' => $membershipBreakdown,
            'plan_breakdown' => $planBreakdown,
        ];
    }

    private function revenueReport(string $startDate, string $endDate): array
    {
        $payments = Payment::with(['member', 'membershipPlan'])
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->orderByDesc('payment_date')
            ->get();

        return [
            'type' => 'revenue',
            'title' => 'Revenue Report',
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total' => (float) $payments->sum('amount'),
            'currency' => 'PHP',
            'data' => $payments,
            'summary' => ['record_count' => $payments->count()],
        ];
    }

    private function categoryRevenueReport(string $category, string $title, string $startDate, string $endDate): array
    {
        $payments = Payment::with(['member', 'membershipPlan'])
            ->whereHas('membershipPlan', fn ($q) => $q->where('category', $category))
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->orderByDesc('payment_date')
            ->get();

        return [
            'type' => "{$category}_revenue",
            'title' => $title,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total' => (float) $payments->sum('amount'),
            'currency' => 'PHP',
            'data' => $payments,
            'summary' => ['record_count' => $payments->count(), 'category' => $category],
        ];
    }

    private function planTypeReport(string $type, string $title, string $startDate, string $endDate): array
    {
        $payments = Payment::with(['member', 'membershipPlan'])
            ->whereHas('membershipPlan', fn ($q) => $q->where('type', $type))
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->orderByDesc('payment_date')
            ->get();

        return [
            'type' => $type,
            'title' => $title,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total' => (float) $payments->sum('amount'),
            'currency' => 'PHP',
            'data' => $payments,
            'summary' => ['record_count' => $payments->count(), 'plan_type' => $type],
        ];
    }

    private function attendanceReport(string $startDate, string $endDate): array
    {
        $attendances = Attendance::with('member')
            ->whereBetween('date', [$startDate, $endDate])
            ->orderByDesc('date')
            ->get();

        $dailySummary = Attendance::select('date', DB::raw('COUNT(*) as count'))
            ->whereBetween('date', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'type' => 'attendance',
            'title' => 'Attendance Report',
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total' => $attendances->count(),
            'data' => $attendances,
            'summary' => [
                'record_count' => $attendances->count(),
                'daily_summary' => $dailySummary,
            ],
        ];
    }

    private function memberReport(string $startDate, string $endDate): array
    {
        $members = Member::with('membershipPlan')
            ->whereBetween('registration_date', [$startDate, $endDate])
            ->orderByDesc('registration_date')
            ->get();

        return [
            'type' => 'members',
            'title' => 'Member Report',
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total' => $members->count(),
            'data' => $members,
            'summary' => ['record_count' => $members->count()],
        ];
    }

    private function membershipReport(string $startDate, string $endDate): array
    {
        $members = Member::with('membershipPlan')
            ->whereBetween('registration_date', [$startDate, $endDate])
            ->orderByDesc('registration_date')
            ->get();

        return [
            'type' => 'membership',
            'title' => 'Membership Report',
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total' => $members->count(),
            'data' => $members,
            'summary' => ['record_count' => $members->count()],
        ];
    }

    public function formatCurrency(float $amount): string
    {
        return '₱'.number_format($amount, 2);
    }

    public function getTableHeaders(string $type): array
    {
        return match ($type) {
            'attendance' => ['Member', 'Date', 'Time In', 'Status'],
            'members', 'membership' => ['Member ID', 'Name', 'Category', 'Plan', 'Status', 'Registered'],
            default => ['Reference #', 'Member', 'Plan', 'Amount', 'Date', 'Method'],
        };
    }

    public function getTableRows(string $type, Collection $data): array
    {
        return match ($type) {
            'attendance' => $data->map(fn ($a) => [
                $a->member?->full_name ?? '-',
                Carbon::parse($a->date)->format('M d, Y'),
                $a->time_in,
                ucfirst($a->status),
            ])->toArray(),
            'members', 'membership' => $data->map(fn ($m) => [
                $m->member_code,
                $m->full_name,
                ucfirst($m->membership_category),
                $m->membershipPlan?->name ?? '-',
                ucfirst(str_replace('_', ' ', $m->membership_status)),
                Carbon::parse($m->registration_date)->format('M d, Y'),
            ])->toArray(),
            default => $data->map(fn ($p) => [
                $p->reference_number,
                $p->member?->full_name ?? '-',
                $p->membershipPlan?->name ?? '-',
                $this->formatCurrency((float) $p->amount),
                Carbon::parse($p->payment_date)->format('M d, Y'),
                ucfirst($p->payment_method),
            ])->toArray(),
        };
    }
}
