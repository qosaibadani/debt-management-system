<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Debt;
use App\Models\Customer;
use App\Services\LedgerService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class DebtController extends Controller
{
    protected $ledgerService;

    public function __construct(LedgerService $ledgerService)
    {
        $this->ledgerService = $ledgerService;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_business_code' => 'required|exists:customers,business_code',
            'amount' => 'required|numeric|min:0.001',
            'description' => 'nullable|string|max:500',
            'date' => 'nullable|date', // دعم حقل التاريخ المرسل من الواجهة
        ]);

        $customer = Customer::where('business_code', $validated['customer_business_code'])->firstOrFail();

        // --- 🛡️ حماية سقف الدين (Credit Limit Check) ---
        if ($customer->credit_limit > 0) {
            $currentBalance = (float) $customer->current_balance;
            $newAmount = (float) $validated['amount'];
            $limit = (float) $customer->credit_limit;

            if (($currentBalance + $newAmount) > $limit) {
                return response()->json([
                    'message' => 'عفواً، تم تجاوز سقف الدين المسموح به لهذا العميل',
                    'errors' => [
                        'amount' => [
                            "سقف دين العميل هو " . number_format($limit) . 
                            " ر.س، والرصيد الحالي " . number_format($currentBalance) . 
                            " ر.س. العملية المرفوضة ستجعل الرصيد " . number_format($currentBalance + $newAmount) . " ر.س"
                        ]
                    ]
                ], 422);
            }
        }
        // --------------------------------------------

        return DB::transaction(function () use ($request, $validated, $customer) {
            $debt = Debt::create([
                'store_id' => $customer->store_id,
                'customer_id' => $customer->id,
                'business_code' => 'DBT-' . strtoupper(Str::random(8)),
                'amount' => $validated['amount'],
                'description' => $request->input('description'),
                'due_date' => $request->input('date'), // استخدام التاريخ المختار
                'status' => 'pending',
                'created_by' => auth()->id(),
            ]);

            $this->ledgerService->recordEntry(
                $customer,
                'debt',
                $validated['amount'],
                Debt::class,
                $debt->id,
                $request->input('description')
            );

            return response()->json([
                'message' => 'تم تسجيل الدين بنجاح',
                'data' => $debt
            ], 201);
        });
    }

    public function index(Request $request)
    {
        $query = Debt::with('customer')
            ->where('store_id', auth()->user()->store_id);

        if ($request->has('customer_code')) {
            $query->whereHas('customer', function($q) use ($request) {
                $q->where('business_code', $request->customer_code);
            });
        }

        return response()->json($query->latest()->paginate(20));
    }
}
