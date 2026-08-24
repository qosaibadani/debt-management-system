<?php

namespace App\Http\Resources;

use App\Services\CustomerService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * تنسيق استجابة العميل حسب عقد API — نستخدم businessCode بدل Database ID.
 */
class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'businessCode' => $this->business_code,
            'name' => $this->name,
            'phone' => $this->phone,
            'nationalId' => $this->national_id,
            'email' => $this->email,
            'address' => $this->address,
            'status' => $this->status,
            'notes' => $this->notes,
            'creditLimit' => $this->credit_limit,
            'totalDebts' => $this->total_debts,
            'totalPaid' => $this->total_paid,
            'currentBalance' => $this->current_balance,
            'overCreditLimit' => app(CustomerService::class)->isOverCreditLimit($this->resource),
            'createdAt' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
