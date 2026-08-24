<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Debt;
use App\Models\Payment;
use App\Models\LedgerEntry;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $storeId = auth()->user()->store_id;

        // 1. إجمالي الديون القائمة (مجموع أرصدة العملاء الحالية)
        $totalOutstanding = Customer::where('store_id', $storeId)->sum('current_balance');

        // 2. إجمالي التحصيلات (كل ما تم دفعه في المتجر)
        $totalCollected = Payment::where('store_id', $storeId)->sum('amount');

        // 3. عدد العملاء
        $customersCount = Customer::where('store_id', $storeId)->count();

        // 4. آخر 5 عمليات في الدفتر
        $recentTransactions = LedgerEntry::with('customer')
            ->where('store_id', $storeId)
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'stats' => [
                'total_outstanding' => (float)$totalOutstanding,
                'total_collected' => (float)$totalCollected,
                'customers_count' => $customersCount,
            ],
            'recent_transactions' => $recentTransactions
        ]);
    }
}
