<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LedgerEntry;
use Illuminate\Http\Request;

class LedgerController extends Controller
{
    public function index(Request $request)
    {
        $query = LedgerEntry::with('customer')
            ->where('store_id', auth()->user()->store_id);

        // فلترة حسب العميل
        if ($request->has('customer_code')) {
            $query->whereHas('customer', function($q) use ($request) {
                $q->where('business_code', $request->customer_code);
            });
        }

        // فلترة حسب النوع (دين/سداد)
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        // فلترة حسب التاريخ (من)
        if ($request->has('start_date') && $request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        // فلترة حسب التاريخ (إلى)
        if ($request->has('end_date') && $request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        return response()->json($query->latest()->get());
    }
}
