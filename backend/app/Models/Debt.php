<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Debt extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'store_id', 'customer_id', 'business_code', 'amount', 
        'due_date', 'description', 'status', 'created_by'
    ];

    protected $casts = [
        'amount' => 'decimal:3',
        'due_date' => 'date',
    ];

    public function customer() {
        return $this->belongsTo(Customer::class);
    }

    public function creator() {
        return $this->belongsTo(User::class, 'created_by');
    }
}
