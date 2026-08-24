<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            // إضافة الحقول الجديدة إذا لم تكن موجودة، وتعديل الموجود
            if (!Schema::hasColumn('customers', 'phone')) {
                $table->string('phone')->after('name');
            }
            if (!Schema::hasColumn('customers', 'address')) {
                $table->string('address')->nullable()->after('phone');
            }
            if (!Schema::hasColumn('customers', 'credit_limit')) {
                $table->decimal('credit_limit', 15, 3)->default(0)->after('address');
            }
            if (!Schema::hasColumn('customers', 'notes')) {
                $table->text('notes')->nullable()->after('credit_limit');
            }
            
            // جعل الاسم ورقم الهاتف إجباريين على مستوى القاعدة
            $table->string('name')->nullable(false)->change();
            $table->string('phone')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['phone', 'address', 'credit_limit', 'notes']);
        });
    }
};
