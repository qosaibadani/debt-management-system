<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class SettingsController extends Controller
{
    // جلب إعدادات المتجر والمستخدم الحالية
    public function index()
    {
        $user = auth()->user()->load('store');
        return response()->json([
            'user' => $user,
            'store' => $user->store
        ]);
    }

    // تحديث بيانات المتجر
    public function updateStore(Request $request)
    {
        $store = auth()->user()->store;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
        ]);

        $store->update($validated);

        return response()->json(['message' => 'تم تحديث بيانات المتجر بنجاح', 'store' => $store]);
    }

    // تغيير كلمة المرور
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|current_password',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        auth()->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json(['message' => 'تم تغيير كلمة المرور بنجاح']);
    }
}
