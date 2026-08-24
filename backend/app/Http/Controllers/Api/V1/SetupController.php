<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\User;
use App\Services\CodeGeneratorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

/**
 * نظام الإعداد المتعدد: يسمح بإنشاء متاجر وحسابات ملاك جدد بشكل مستقل.
 */
class SetupController extends Controller
{
    public function __construct(
        private CodeGeneratorService $codeGenerator,
    ) {}

    /**
     * إنشاء متجر جديد وصاحب متجر جديد.
     */
    public function createFirstUser(Request $request): JsonResponse
    {
        // التحقق من البيانات (مع التأكد من عدم تكرار الهاتف)
        $request->validate([
            'storeName' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30', 'unique:users,phone'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
            'currency' => ['nullable', 'string', 'max:10'],
        ]);

        return DB::transaction(function () use ($request) {
            // 1. إنشاء سجل متجر جديد بالكامل
            $store = Store::create([
                'name' => $request->storeName,
                'currency' => $request->currency ?? 'SAR',
                'phone' => $request->phone,
                'is_active' => true,
            ]);

            // 2. توليد كود مستخدم فريد
            $userCode = $this->codeGenerator->nextUserCode();

            // 3. إنشاء صاحب المتجر وربطه بالمتجر الجديد
            $user = User::create([
                'store_id' => $store->id,
                'name' => $request->name,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'role' => 'owner',
                'user_code' => $userCode,
                'is_active' => true,
            ]);

            // تسجيل الدخول آلياً للمستخدم الجديد
            auth()->login($user);

            return response()->json([
                'message' => 'تم إنشاء المتجر والحساب بنجاح',
                'user' => $user->load('store')
            ], 201);
        });
    }
}
