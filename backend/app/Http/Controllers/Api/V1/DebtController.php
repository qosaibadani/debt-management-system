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

    /**
     * تسجيل دين جديد مع التحقق من سقف الدين وإرجاع بيانات الواتساب
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_business_code' => 'required|exists:customers,business_code',
            'amount' => 'required|numeric|min:0.001',
            'description' => 'nullable|string|max:500',
            'due_date' => 'nullable|date',
        ]);

        return DB::transaction(function () use ($request, $validated) {
            // جلب العميل مع قفل للتحديث لضمان دقة الحسابات المالية
            $customer = Customer::where('business_code', $validated['customer_business_code'])
                ->where('store_id', auth()->user()->store_id)
                ->lockForUpdate()
                ->firstOrFail();

            // 1. التحقق من سقف الدين (Credit Limit)
            if ($customer->credit_limit > 0) {
                $currentBalance = (float)$customer->current_balance;
                $newAmount = (float)$validated['amount'];
                $limit = (float)$customer->credit_limit;

                if (($currentBalance + $newAmount) > $limit) {
                    return response()->json([
                        'message' => "تعذر تسجيل الدين. الرصيد الجديد سيصبح (" . number_format($currentBalance + $newAmount) . ") وهو يتجاوز سقف الدين المسموح به لهذا العميل (" . number_format($limit) . ")."
                    ], 422);
                }
            }

            // 2. إنشاء سجل الدين
            $debt = Debt::create([
                'store_id' => $customer->store_id,
                'customer_id' => $customer->id,
                'business_code' => 'DBT-' . strtoupper(Str::random(8)),
                'amount' => $validated['amount'],
                'description' => $request->input('description'),
                'due_date' => $request->input('due_date'),
                'status' => 'pending',
                'created_by' => auth()->id(),
            ]);

            // 3. تسجيل العملية في دفتر الأستاذ (تحديث أرصدة العميل تلقائياً)
            $this->ledgerService->recordEntry(
                $customer,
                'debt',
                $validated['amount'],
                Debt::class,
                $debt->id,
                $request->input('description')
            );

            // 4. جلب البيانات المحدثة للرسالة
            $updatedCustomer = $customer->fresh();
            $store = auth()->user()->store;

            return response()->json([
                'message' => 'تم تسجيل الدين بنجاح',
                'data' => $debt,
                'current_balance' => (float)$updatedCustomer->current_balance,
                'customer_name' => $updatedCustomer->name,
                'customer_phone' => $updatedCustomer->phone,
                'store_name' => $store->name ?? 'متجرنا'
            ], 201);
        });
    }

    /**
     * عرض قائمة الديون
     */
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
