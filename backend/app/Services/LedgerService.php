<?php

namespace App\Services;

use App\Models\LedgerEntry;
use App\Models\Customer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LedgerService
{
    public function recordEntry(Customer $customer, string $type, float|string $amount, string $referenceType, int $referenceId, ?string $description = null)
    {
        return DB::transaction(function () use ($customer, $type, $amount, $referenceType, $referenceId, $description) {
            // 1. قفل سجل العميل وتحديث الأرصدة الإجمالية
            $customer = Customer::where('id', $customer->id)->lockForUpdate()->first();

            if ($type === 'debt') {
                $customer->total_debts = bcadd($customer->total_debts, $amount, 3);
            } else {
                $customer->total_paid = bcadd($customer->total_paid, $amount, 3);
            }

            // 2. حساب الرصيد الحالي الجديد للعميل
            $customer->current_balance = bcsub($customer->total_debts, $customer->total_paid, 3);
            $customer->save();

            // 3. إنشاء قيد الدفتر مع حفظ "الرصيد الجاري" في تلك اللحظة
            return LedgerEntry::create([
                'store_id' => $customer->store_id,
                'customer_id' => $customer->id,
                'business_code' => 'TRX-' . strtoupper(Str::random(8)),
                'type' => $type,
                'amount' => $amount,
                'running_balance' => $customer->current_balance, // حفظ الرصيد بعد العملية
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'description' => $description,
                'created_by' => auth()->id() ?? $customer->store->owner_id,
            ]);
        });
    }
}
