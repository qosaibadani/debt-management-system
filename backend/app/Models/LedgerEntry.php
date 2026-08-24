<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LedgerEntry extends Model
{
    protected $fillable = [
        'store_id', 
        'customer_id', 
        'business_code', 
        'type', 
        'amount', 
        'running_balance', // هذا الحقل كان مفقوداً
        'reference_type', 
        'reference_id', 
        'description', 
        'created_by'
    ];

    protected $casts = [
        'amount' => 'decimal:3',
        'running_balance' => 'decimal:3',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
