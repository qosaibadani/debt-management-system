<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes, HasApiTokens;

    /**
     * الحقول المسموح بتعبئتها (Mass Assignment)
     */
    protected $fillable = [
        'store_id', 
        'user_code', 
        'name', 
        'email', 
        'phone', 
        'password', 
        'role', 
        'is_active',
    ];

    /**
     * الحقول المخفية عند تحويل الكائن إلى JSON
     */
    protected $hidden = [
        'password', 
        'remember_token',
    ];

    /**
     * تحويل أنواع البيانات تلقائياً
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * التحقق من دور المستخدم
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin' || $this->role === 'owner';
    }

    /**
     * علاقة المستخدم بالمتجر (كل مستخدم ينتمي لمتجر واحد)
     */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }
}
