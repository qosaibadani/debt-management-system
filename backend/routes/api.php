<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\SetupController;
use App\Http\Controllers\Api\V1\DebtController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\LedgerController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\SettingsController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\BackupController;
use App\Http\Controllers\Api\V1\ReportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// 1. مسارات المصادقة (عامة)
Route::get('/setup-info', [AuthController::class, 'setupInfo']);
Route::post('/setup/first-user', [SetupController::class, 'createFirstUser']);
Route::post('/auth/login', [AuthController::class, 'login']);

// 2. المسارات المحمية بـ Sanctum
Route::middleware('auth:sanctum')->group(function () {
    
    // معلومات المستخدم الحالي (متاحة للجميع)
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // العمليات اليومية (متاحة للـ Owner والـ Employee)
    Route::apiResource('customers', CustomerController::class)->parameters(['customers' => 'businessCode']);
    Route::get('debts', [DebtController::class, 'index']);
    Route::post('debts', [DebtController::class, 'store']);
    Route::get('payments', [PaymentController::class, 'index']);
    Route::post('payments', [PaymentController::class, 'store']);
    Route::get('ledger', [LedgerController::class, 'index']);
    Route::get('dashboard-stats', [DashboardController::class, 'index']);
    
    // مسار التقارير المجمعة
    Route::get('reports', [ReportController::class, 'index']);

    // مسارات خاصة بالـ Owner فقط (إدارة النظام)
    Route::middleware('can:manage-system')->group(function () {
        // إدارة المستخدمين
        Route::apiResource('users', UserController::class);
        Route::post('users/{user}/toggle-status', [UserController::class, 'toggleStatus']);
        
        // الإعدادات المتقدمة
        Route::get('settings', [SettingsController::class, 'index']);
        Route::put('settings/store', [SettingsController::class, 'updateStore']);
        
        // النسخ الاحتياطي
        Route::get('backup/download', [BackupController::class, 'download']);
    });

    // تغيير كلمة المرور (متاح للجميع لحماية حساباتهم)
    Route::put('settings/password', [SettingsController::class, 'updatePassword']);
});
