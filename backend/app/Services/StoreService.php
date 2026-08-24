<?php

namespace App\Services;

use App\Models\Store;
use Illuminate\Support\Facades\DB;

/**
 * خدمة إدارة المتجر الأساسي: نبدأ بمتجر واحد افتراضي.
 */
class StoreService
{
    /**
     * الحصول على المتجر الأساسي أو إنشاؤه.
     */
    public function getOrCreateDefaultStore(): Store
    {
        return DB::transaction(function () {
            return Store::firstOrCreate(
                ['name' => 'متجري'],
                [
                    'phone' => null,
                    'address' => null,
                    'tax_number' => null,
                    'currency' => 'SAR',
                    'is_active' => true,
                ]
            );
        });
    }
}
