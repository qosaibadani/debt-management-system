<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'store_id', 'customer_id', 'business_code', 'amount', 
        'payment_method', 'reference_number', 'description', 'created_by'
    ];

    protected $casts = [
        'amount' => 'decimal:3',
    ];

    public function customer() {
        return $this->belongsTo(Customer::class);
    }

    public function creator() {
        return $this->belongsTo(User::class, 'created_by');
    }
}
