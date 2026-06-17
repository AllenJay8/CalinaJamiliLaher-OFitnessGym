<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->string('member_code')->unique();
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->date('birth_date');
            $table->string('contact_number');
            $table->text('address')->nullable();
            $table->string('email')->nullable();
            $table->string('profile_picture')->nullable();
            $table->enum('membership_category', ['student', 'regular']);
            $table->foreignId('membership_plan_id')->constrained('membership_plans');
            $table->enum('membership_status', ['active', 'expiring_soon', 'expired'])->default('active');
            $table->date('membership_start_date');
            $table->date('membership_end_date');
            $table->date('registration_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
