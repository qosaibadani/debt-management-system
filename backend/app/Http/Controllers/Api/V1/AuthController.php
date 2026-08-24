<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * تسجيل الدخول (يدعم البريد أو الهاتف)
     */
    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string', // هذا الحقل يستقبل البريد أو الهاتف
            'password' => 'required|string',
        ]);

        // 1. البحث عن المستخدم بالبريد أو بالهاتف
        $user = User::where('email', $request->login)
                    ->orWhere('phone', $request->login)
                    ->first();

        // 2. التحقق من وجود المستخدم وصحة كلمة المرور
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['بيانات الاعتماد المقدمة غير صحيحة.'],
            ]);
        }

        // 3. التحقق مما إذا كان الحساب نشطاً
        if (isset($user->is_active) && !$user->is_active) {
            throw ValidationException::withMessages([
                'login' => ['هذا الحساب معطل حالياً، يرجى مراجعة المدير.'],
            ]);
        }

        // 4. تسجيل الدخول وتحميل بيانات المتجر
        Auth::login($user);
        $user->load('store');

        return response()->json([
            'message' => 'تم تسجيل الدخول بنجاح',
            'user' => $user
        ]);
    }

    /**
     * جلب بيانات المستخدم الحالي
     */
    public function me(Request $request)
    {
        $user = $request->user()->load('store');
        return response()->json($user);
    }

    /**
     * تسجيل الخروج
     */
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'تم تسجيل الخروج بنجاح']);
    }

    /**
     * معلومات الإعداد الأولية
     */
    public function setupInfo()
    {
        $userExists = User::exists();
        return response()->json([
            'is_installed' => $userExists,
            'version' => '1.0.0'
        ]);
    }
}
