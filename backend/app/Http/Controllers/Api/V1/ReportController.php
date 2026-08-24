<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LedgerEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $storeId = auth()->user()->store_id;
        
        // تحديد الفترة الزمنية (بداية اليوم ونهاية اليوم لضمان الدقة)
        $startDate = $request->query('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->query('end_date', now()->toDateString());
        
        $startDateTime = $startDate . ' 00:00:00';
        $endDateTime = $endDate . ' 23:59:59';

        // 1. إجمالي الديون (استخدام البحث المباشر في العمود أسرع بكثير)
        $totalDebts = LedgerEntry::where('store_id', $storeId)
            ->where('type', 'debt')
            ->whereBetween('created_at', [$startDateTime, $endDateTime])
            ->sum('amount');

        // 2. إجمالي التحصيلات
        $totalPayments = LedgerEntry::where('store_id', $storeId)
            ->where('type', 'payment')
            ->whereBetween('created_at', [$startDateTime, $endDateTime])
            ->sum('amount');

        // 3. ملخص يومي محسن
        $dailySummary = LedgerEntry::where('store_id', $storeId)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw("SUM(CASE WHEN type = 'debt' THEN amount ELSE 0 END) as debts"),
                DB::raw("SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END) as payments")
            )
            ->whereBetween('created_at', [$startDateTime, $endDateTime])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'summary' => [
                'total_debts' => $totalDebts,
                'total_payments' => $totalPayments,
                'net_change' => $totalDebts - $totalPayments,
                'period' => ['start' => $startDate, 'end' => $endDate]
            ],
            'daily_details' => $dailySummary
        ]);
    }
}
