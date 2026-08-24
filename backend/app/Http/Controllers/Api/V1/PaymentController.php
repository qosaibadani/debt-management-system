<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Customer;
use App\Services\LedgerService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    protected $ledgerService;

    public function __construct(LedgerService $ledgerService)
    {
        $this->ledgerService = $ledgerService;
    }

    /**
     * تسجيل سداد جديد وإرجاع بيانات الواتساب للتأكيد
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_business_code' => 'required|exists:customers,business_code',
            'amount' => 'required|numeric|min:0.001',
            'payment_method' => 'required|string|max:50',
            'reference_number' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
        ]);

        return DB::transaction(function () use ($request, $validated) {
            // جلب العميل مع قفل لضمان دقة الحسابات المالية أثناء السداد
            $customer = Customer::where('business_code', $validated['customer_business_code'])
                ->where('store_id', auth()->user()->store_id)
                ->lockForUpdate()
                ->firstOrFail();

            // 1. إنشاء سجل السداد
            $payment = Payment::create([
                'store_id' => $customer->store_id,
                'customer_id' => $customer->id,
                'business_code' => 'PAY-' . strtoupper(Str::random(8)),
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'reference_number' => $request->input('reference_number'),
                'description' => $request->input('description'),
                'created_by' => auth()->id(),
            ]);

            // 2. تسجيل العملية في دفتر الأستاذ (تحديث أرصدة العميل تلقائياً)
            $this->ledgerService->recordEntry(
                $customer,
                'payment',
                $validated['amount'],
                Payment::class,
                $payment->id,
                $request->input('description')
            );

            // 3. جلب البيانات المحدثة للرسالة
            $updatedCustomer = $customer->fresh();
            $store = auth()->user()->store;

            return response()->json([
                'message' => 'تم تسجيل الدفعة بنجاح',
                'data' => $payment,
                'current_balance' => (float)$updatedCustomer->current_balance,
                'customer_name' => $updatedCustomer->name,
                'customer_phone' => $updatedCustomer->phone,
                'store_name' => $store->name ?? 'متجرنا'
            ], 201);
        });
    }

    /**
     * عرض قائمة المدفوعات
     */
    public function index(Request $request)
    {
        $query = Payment::with('customer')
            ->where('store_id', auth()->user()->store_id);

        if ($request->has('customer_code')) {
            $query->whereHas('customer', function($q) use ($request) {
                $q->where('business_code', $request->customer_code);
            });
        }

        return response()->json($query->latest()->paginate(20));
    }
}
