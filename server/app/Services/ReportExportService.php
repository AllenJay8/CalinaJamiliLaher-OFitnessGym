<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;
use Symfony\Component\HttpFoundation\Response;

class ReportExportService
{
    public function __construct(private ReportService $reportService) {}

    public function exportPdf(array $report): Response
    {
        $html = view('reports.export', ['report' => $report, 'reportService' => $this->reportService])->render();

        $pdf = Pdf::loadHTML($html)->setPaper('a4', 'landscape');

        $filename = $this->filename($report, 'pdf');

        return $pdf->download($filename);
    }

    public function exportDocx(array $report): Response
    {
        $phpWord = new PhpWord;
        $section = $phpWord->addSection();

        $section->addTitle('OFitness Gym Management System', 1);
        $section->addText($report['title'], ['bold' => true, 'size' => 14]);
        $section->addText(
            'Period: '.date('M d, Y', strtotime($report['start_date'])).' - '.date('M d, Y', strtotime($report['end_date']))
        );
        $section->addTextBreak(1);

        if (! empty($report['summary'])) {
            $section->addText('Summary', ['bold' => true, 'size' => 12]);
            $summary = $report['summary'];
            $section->addText('Total Members: '.($summary['total_members'] ?? 0));
            $section->addText('Active Members: '.($summary['active_members'] ?? 0));
            $section->addText('Expired Members: '.($summary['expired_members'] ?? 0));
            if (isset($summary['total_revenue'])) {
                $section->addText('Total Revenue: '.$this->reportService->formatCurrency((float) $summary['total_revenue']));
            }
            $section->addText('Report Total: '.($this->isPaymentReport($report['type'])
                ? $this->reportService->formatCurrency((float) $report['total'])
                : ($report['total'].' records')));
            $section->addTextBreak(1);
        }

        $headers = $this->reportService->getTableHeaders($report['type']);
        $rows = $this->reportService->getTableRows($report['type'], collect($report['data']));

        $table = $section->addTable(['borderSize' => 6, 'borderColor' => 'FACC15', 'cellMargin' => 80]);
        $table->addRow();
        foreach ($headers as $header) {
            $table->addCell(2000, ['bgColor' => 'FACC15'])->addText($header, ['bold' => true]);
        }

        foreach ($rows as $row) {
            $table->addRow();
            foreach ($row as $cell) {
                $table->addCell(2000)->addText((string) $cell);
            }
        }

        $tempFile = tempnam(sys_get_temp_dir(), 'report_').'.docx';
        IOFactory::createWriter($phpWord, 'Word2007')->save($tempFile);

        $filename = $this->filename($report, 'docx');

        return response()->download($tempFile, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ])->deleteFileAfterSend(true);
    }

    private function filename(array $report, string $ext): string
    {
        return str_replace(' ', '_', strtolower($report['title'])).'_'.date('Ymd').'.'.$ext;
    }

    private function isPaymentReport(string $type): bool
    {
        return in_array($type, ['revenue', 'student_revenue', 'regular_revenue', 'daily_pass', 'monthly_membership', 'yearly_membership']);
    }
}
