<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $storeId = auth()->user()->store_id;
        $customer = $this->route('customer'); // للحصول على الكود عند التحديث

        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => [
                'required', 
                'digits:9', // فرض أن يكون الرقم مكوناً من 9 خانات بالضبط
                // التحقق من عدم تكرار الهاتف داخل نفس المتجر فقط
                Rule::unique('customers')->where(function ($query) use ($storeId) {
                    return $query->where('store_id', $storeId);
                })->ignore($customer, 'business_code')
            ],
            'address' => ['nullable', 'string', 'max:500'],
            'creditLimit' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'اسم العميل مطلوب إجبارياً.',
            'phone.required' => 'رقم الهاتف مطلوب للتواصل مع العميل.',
            'phone.digits' => 'يجب أن يتكون رقم الهاتف من 9 أرقام فقط.',
            'phone.unique' => 'رقم الهاتف هذا مسجل مسبقاً لعميل آخر في متجرك.',
            'creditLimit.numeric' => 'سقف الدين يجب أن يكون رقماً صحيحاً.',
        ];
    }
}
