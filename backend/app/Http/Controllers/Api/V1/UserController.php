<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    /**
     * عرض قائمة الموظفين (لصاحب المتجر فقط)
     */
    public function index(Request $request)
    {
        // التحقق من الصلاحية
        if (!Gate::allows('manage-system')) {
            return response()->json(['message' => 'غير مصرح لك بالوصول'], 403);
        }

        $users = User::where('store_id', $request->user()->store_id)
            ->where('id', '!=', $request->user()->id) // عدم إظهار صاحب المتجر نفسه في القائمة
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($users);
    }

    /**
     * إضافة موظف جديد
     */
    public function store(Request $request)
    {
        if (!Gate::allows('manage-system')) {
            return response()->json(['message' => 'غير مصرح لك بإضافة موظفين'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => ['required', Password::defaults()],
            'role' => 'required|in:employee,admin',
        ]);

        // توليد كود مستخدم فريد
        $userCode = 'USR-' . strtoupper(Str::random(6));

        $user = User::create([
            'store_id' => $request->user()->store_id,
            'user_code' => $userCode,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'تم إضافة الموظف بنجاح',
            'user' => $user
        ], 201);
    }

    /**
     * تحديث حالة الموظف (تفعيل/تعطيل)
     */
    public function toggleStatus(User $user)
    {
        if (!Gate::allows('manage-system')) {
            return response()->json(['message' => 'غير مصرح لك'], 403);
        }

        // التأكد أن الموظف ينتمي لنفس المتجر
        if ($user->store_id !== auth()->user()->store_id) {
            return response()->json(['message' => 'غير مصرح لك'], 403);
        }

        $user->is_active = !$user->is_active;
        $user->save();

        return response()->json([
            'message' => $user->is_active ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب',
            'is_active' => $user->is_active
        ]);
    }

    /**
     * حذف موظف
     */
    public function destroy(User $user)
    {
        if (!Gate::allows('manage-system')) {
            return response()->json(['message' => 'غير مصرح لك'], 403);
        }

        if ($user->store_id !== auth()->user()->store_id) {
            return response()->json(['message' => 'غير مصرح لك'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'تم حذف الموظف بنجاح']);
    }
}
