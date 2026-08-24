<?php

namespace App\Services;

use App\Models\Customer;
use Illuminate\Support\Facades\DB;

/**
 * منطق عمل العملاء: توليد الرمز التجاري وإعادة حساب الأرصدة من دفتر الحساب.
 */
class CustomerService
{
    public function __construct(
        private CodeGeneratorService $codeGenerator,
        private LedgerService $ledgerService,
    ) {}

    /**
     * إنشاء عميل جديد مع رمز تجاري تلقائي.
     */
    public function create(int $storeId, array $data): Customer
    {
        return DB::transaction(function () use ($storeId, $data) {
            $businessCode = $this->codeGenerator->nextCode('customers', 'CUS');

            return Customer::create(array_merge($data, [
                'store_id' => $storeId,
                'business_code' => $businessCode,
            ]));
        });
    }

    /**
     * تحديث بيانات العميل الأساسية.
     */
    public function update(Customer $customer, array $data): Customer
    {
        $customer->update($data);

        return $customer->fresh();
    }

    /**
     * إعادة حساب الأرصدة المشتقة من دفتر الحساب (مصدر الحقيقة).
     */
    public function recalcBalance(Customer $customer): Customer
    {
        $totals = $this->ledgerService->getCustomerTotals($customer->id);

        $customer->update([
            'total_debts' => $totals['total_debts'],
            'total_paid' => $totals['total_paid'],
            'current_balance' => $totals['current_balance'],
        ]);

        return $customer->fresh();
    }

    /**
     * هل تجاوز العميل حده الائتماني؟
     */
    public function isOverCreditLimit(Customer $customer): bool
    {
        if (!$customer->credit_limit || $customer->credit_limit <= 0) {
            return false;
        }

        return bccomp((string) $customer->current_balance, (string) $customer->credit_limit, 3) > 0;
    }
}
