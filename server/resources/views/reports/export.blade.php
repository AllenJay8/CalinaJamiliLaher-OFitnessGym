<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $report['title'] }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #111827; }
        h1 { color: #111827; font-size: 20px; margin-bottom: 4px; }
        h2 { color: #EAB308; font-size: 16px; margin-top: 0; }
        .meta { color: #6b7280; margin-bottom: 16px; }
        .summary { background: #FEF9C3; padding: 12px; border-radius: 8px; margin-bottom: 16px; }
        .summary-grid { display: table; width: 100%; }
        .summary-item { display: table-cell; padding: 4px 12px 4px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { background: #FACC15; color: #111827; padding: 8px; text-align: left; font-size: 10px; }
        td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
        tr:nth-child(even) td { background: #f9fafb; }
        .footer { margin-top: 20px; font-size: 9px; color: #9ca3af; text-align: center; }
    </style>
</head>
<body>
    <h1>OFitness Gym Management System</h1>
    <h2>{{ $report['title'] }}</h2>
    <p class="meta">
        Period: {{ date('M d, Y', strtotime($report['start_date'])) }} -
        {{ date('M d, Y', strtotime($report['end_date'])) }} |
        Generated: {{ now()->format('M d, Y h:i A') }}
    </p>

    @if(!empty($report['summary']))
    <div class="summary">
        <strong>Summary</strong><br>
        Total Members: {{ $report['summary']['total_members'] ?? 0 }} |
        Active: {{ $report['summary']['active_members'] ?? 0 }} |
        Expired: {{ $report['summary']['expired_members'] ?? 0 }} |
        @if(isset($report['summary']['total_revenue']))
        Revenue: {{ $reportService->formatCurrency((float) $report['summary']['total_revenue']) }} |
        @endif
        Report Total:
        @if(in_array($report['type'], ['revenue','student_revenue','regular_revenue','daily_pass','monthly_membership','yearly_membership']))
            {{ $reportService->formatCurrency((float) $report['total']) }}
        @else
            {{ $report['total'] }} records
        @endif
    </div>
    @endif

    <table>
        <thead>
            <tr>
                @foreach($reportService->getTableHeaders($report['type']) as $header)
                    <th>{{ $header }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($reportService->getTableRows($report['type'], collect($report['data'])) as $row)
            <tr>
                @foreach($row as $cell)
                    <td>{{ $cell }}</td>
                @endforeach
            </tr>
            @endforeach
        </tbody>
    </table>

    <p class="footer">OFitness Gym — All amounts in Philippine Peso (₱)</p>
</body>
</html>
