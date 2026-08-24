<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $blueprint) {
            // إضافة الأعمدة إذا لم تكن موجودة
            if (!Schema::hasColumn('users', 'user_code')) {
                $blueprint->string('user_code')->unique()->after('id');
            }
            if (!Schema::hasColumn('users', 'role')) {
                $blueprint->string('role')->default('employee')->after('password');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $blueprint) {
            $blueprint->dropColumn(['user_code', 'role']);
        });
    }
};
