<?php

namespace App\Services;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

/**
 * خدمة توليد الأكواد الفريدة للنظام.
 * تم التحديث لاستخدام رموز عشوائية فريدة لمنع تكرار الأكواد عند تعدد المتاجر.
 */
class CodeGeneratorService
{
    /**
     * توليد كود مستخدم فريد (مثل USR-A7B2C9)
     */
    public function nextUserCode(): string
    {
        do {
            // توليد كود عشوائي بطول 6 أحرف وأرقام
            $code = 'USR-' . strtoupper(Str::random(6));
            
            // التأكد من أن الكود غير موجود مسبقاً في قاعدة البيانات بالكامل
            $exists = DB::table('users')->where('user_code', $code)->exists();
        } while ($exists);

        return $code;
    }

    /**
     * توليد كود تجاري فريد (للعملاء مثلاً: CUS-X1Y2Z3)
     */
    public function nextCode(string $table, string $prefix): string
    {
        do {
            // توليد كود عشوائي بالبادئة المطلوبة
            $code = $prefix . '-' . strtoupper(Str::random(6));
            
            // التأكد من أن الكود غير موجود في الجدول المحدد
            $exists = DB::table($table)->where('business_code', $code)->exists();
        } while ($exists);

        return $code;
    }
}
