<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->foreignId('store_id')->constrained()->onDelete('cascade');
            $blueprint->foreignId('customer_id')->constrained()->onDelete('cascade');
            $blueprint->string('business_code')->unique();
            $blueprint->decimal('amount', 12, 3);
            $blueprint->string('payment_method')->default('cash'); // cash, bank_transfer, etc.
            $blueprint->string('reference_number')->nullable(); // رقم الحوالة أو السند
            $blueprint->string('description')->nullable();
            $blueprint->foreignId('created_by')->constrained('users');
            $blueprint->timestamps();
            $blueprint->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
