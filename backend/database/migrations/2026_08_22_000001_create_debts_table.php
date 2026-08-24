<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('debts', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->foreignId('store_id')->constrained()->onDelete('cascade');
            $blueprint->foreignId('customer_id')->constrained()->onDelete('cascade');
            $blueprint->string('business_code')->unique(); // الرمز المرجعي للعملية
            $blueprint->decimal('amount', 12, 3);
            $blueprint->date('due_date')->nullable(); // تاريخ الاستحقاق
            $blueprint->string('description')->nullable();
            $blueprint->enum('status', ['pending', 'partially_paid', 'paid'])->default('pending');
            $blueprint->foreignId('created_by')->constrained('users');
            $blueprint->timestamps();
            $blueprint->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('debts');
    }
};
