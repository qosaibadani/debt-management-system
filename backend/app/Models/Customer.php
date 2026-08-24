<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * الحقول القابلة للتعبئة (Fillable)
     * تم إضافة الحقول الجديدة: phone, address, credit_limit, notes
     */
    protected $fillable = [
        'store_id', 
        'business_code',
        'name', 
        'phone', 
        'address',
        'credit_limit',
        'notes',
        'status', 
        'total_debts', 
        'total_paid', 
        'current_balance',
    ];

    /**
     * تحويل أنواع البيانات (Casting)
     * نستخدم 'string' للمبالغ المالية لضمان الدقة العالية مع BCMath
     */
    protected function casts(): array
    {
        return [
            'credit_limit' => 'string',
            'total_debts' => 'string',
            'total_paid' => 'string',
            'current_balance' => 'string',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * علاقة العميل بالمتجر
     */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    /**
     * علاقة العميل بالسجل المالي (Ledger)
     */
    public function ledgerEntries(): HasMany
    {
        return $this->hasMany(LedgerEntry::class);
    }

    /**
     * علاقة العميل بالديون التفصيلية
     */
    public function debts(): HasMany
    {
        return $this->hasMany(Debt::class);
    }
}
