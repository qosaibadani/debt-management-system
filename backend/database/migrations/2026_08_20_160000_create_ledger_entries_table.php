<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            
            // الحقول المفقودة التي سببت المشكلة
            $table->string('business_code')->unique(); 
            $table->enum('type', ['debt', 'payment', 'reversal', 'opening_balance']);
            
            $table->decimal('amount', 12, 3);
            $table->decimal('running_balance', 12, 3); // الرصيد في لحظة العملية
            
            $table->string('reference_type'); // موديل العملية (Debt أو Payment)
            $table->unsignedBigInteger('reference_id');
            
            $table->string('description')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();

            // فهارس للبحث السريع
            $table->index(['customer_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ledger_entries');
    }
};
