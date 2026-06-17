<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportExportService;
use App\Services\ReportService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ReportController extends Controller
{
    public function __construct(
        private ReportService $reportService,
        private ReportExportService $exportService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $type = $request->get('type', 'revenue');
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->get('end_date', Carbon::now()->toDateString());

        return response()->json($this->reportService->build($type, $startDate, $endDate));
    }

    public function exportPdf(Request $request): Response
    {
        $report = $this->buildFromRequest($request);

        return $this->exportService->exportPdf($report);
    }

    public function exportDocx(Request $request): Response
    {
        $report = $this->buildFromRequest($request);

        return $this->exportService->exportDocx($report);
    }

    private function buildFromRequest(Request $request): array
    {
        $request->validate([
            'type' => 'required|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $type = $request->get('type', 'revenue');
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->get('end_date', Carbon::now()->toDateString());

        return $this->reportService->build($type, $startDate, $endDate);
    }
}
