<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate; // إضافة هذا السطر
use App\Models\User; // إضافة هذا السطر

class AppServiceProvider extends ServiceProvider
{
    /**
     * تسجيل خدمات التطبيق.
     */
    public function register(): void
    {
        //
    }

    /**
     * تهيئة خدمات التطبيق.
     */
    public function boot(): void
    {
        /**
         * تعريف صلاحية "إدارة النظام" (manage-system)
         * تسمح فقط للمستخدم الذي يملك رتبة 'owner' بالوصول للمسارات الحساسة
         */
        Gate::define('manage-system', function (User $user) {
            return $user->role === 'owner';
        });
    }
}
