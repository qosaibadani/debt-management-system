<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * الجداول الأساسية: المتاجر، المستخدمون، العملاء.
 */
return new class extends Migration
{
    public function up(): void
    {
        // ─── المتاجر ───
        Schema::create('stores', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone', 30)->nullable();
            $table->string('address')->nullable();
            $table->string('tax_number', 50)->nullable();
            $table->string('currency', 10)->default('SAR');
            $table->string('logo')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // ─── المستخدمون ───
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores')->cascadeOnUpdate();
            $table->string('name');
            $table->string('email')->nullable()->unique();
            $table->string('phone', 30)->nullable()->unique();
            $table->string('password');
            $table->enum('role', ['owner', 'manager', 'cashier', 'accountant'])->default('cashier');
            $table->string('user_code', 20)->unique();      // رمز الموظف: USR-0001
            $table->boolean('is_active')->default(true);
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['store_id', 'role']);
        });

        // ─── العملاء ───
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores')->cascadeOnUpdate();
            $table->string('name');
            $table->string('phone', 30)->nullable();
            $table->string('national_id', 30)->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->string('business_code', 20)->unique();  // CUS-0001
            $table->string('notes', 500)->nullable();
            $table->enum('status', ['active', 'blocked', 'inactive'])->default('active');
            $table->decimal('credit_limit', 12, 3)->default(0);
            $table->decimal('total_debts', 12, 3)->default(0);
            $table->decimal('total_paid', 12, 3)->default(0);
            $table->decimal('current_balance', 12, 3)->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['store_id', 'status']);
            $table->index('phone');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
        Schema::dropIfExists('users');
        Schema::dropIfExists('stores');
    }
};
