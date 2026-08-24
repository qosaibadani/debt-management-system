<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CustomerRequest;
use App\Models\Customer;
use App\Services\CodeGeneratorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerController extends Controller
{
    public function __construct(
        private CodeGeneratorService $codeGenerator
    ) {}

    /**
     * عرض قائمة العملاء مع دعم البحث والفلترة
     */
    public function index(Request $request): JsonResponse
    {
        $storeId = auth()->user()->store_id;
        $search = $request->query('search');

        $customers = Customer::where('store_id', $storeId)
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ->orWhere('business_code', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->get();

        return response()->json($customers);
  }

    /**
     * إضافة عميل جديد
     */
    public function store(CustomerRequest $request): JsonResponse
    {
        $storeId = auth()->user()->store_id;

        return DB::transaction(function () use ($request, $storeId) {
            $businessCode = $this->codeGenerator->nextCode('customers', 'CUS');

            $customer = Customer::create([
                'store_id' => $storeId,
                'business_code' => $businessCode,
                'name' => $request->name,
                'phone' => $request->phone,
                'address' => $request->address,
                'credit_limit' => $request->creditLimit ?? '0',
                'notes' => $request->notes,
                'status' => 'active',
                'total_debts' => '0',
                'total_paid' => '0',
                'current_balance' => '0',
            ]);

            return response()->json([
                'message' => 'تم إضافة العميل بنجاح',
                'data' => $customer
            ], 201);
        });
    }

    /**
     * عرض تفاصيل العميل مع سجل العمليات (تم الإصلاح هنا)
     */
    public function show(string $businessCode): JsonResponse
    {
        $storeId = auth()->user()->store_id;
        
        // جلب العميل مع سجل العمليات المالي مرتباً من الأحدث للأقدم
        $customer = Customer::with(['ledgerEntries' => function($query) {
                $query->latest();
            }])
            ->where('store_id', $storeId)
            ->where('business_code', $businessCode)
            ->firstOrFail();

        return response()->json($customer);
    }

    /**
     * تحديث بيانات العميل
     */
    public function update(CustomerRequest $request, string $businessCode): JsonResponse
    {
        $storeId = auth()->user()->store_id;
        $customer = Customer::where('store_id', $storeId)
            ->where('business_code', $businessCode)
            ->firstOrFail();

        $customer->update([
            'name' => $request->name,
            'phone' => $request->phone,
            'address' => $request->address,
            'credit_limit' => $request->creditLimit,
            'notes' => $request->notes,
            'status' => $request->status ?? $customer->status,
        ]);

        return response()->json([
            'message' => 'تم تحديث بيانات العميل بنجاح',
            'data' => $customer
        ]);
    }

    /**
     * حذف عميل
     */
    public function destroy(string $businessCode): JsonResponse
    {
        $storeId = auth()->user()->store_id;
        $customer = Customer::where('store_id', $storeId)
            ->where('business_code', $businessCode)
            ->firstOrFail();

        // منع الحذف إذا كان هناك رصيد مستحق
        if ($customer->current_balance != 0) {
            return response()->json([
                'message' => 'لا يمكن حذف عميل لديه رصيد مستحق متبقي'
            ], 422);
        }

        $customer->delete();

        return response()->json([
            'message' => 'تم حذف العميل بنجاح'
        ]);
    }
}
