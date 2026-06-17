<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->foreignId('membership_plan_id')->constrained('membership_plans');
            $table->decimal('amount', 10, 2);
            $table->enum('payment_method', ['cash', 'gcash', 'bank_transfer', 'card', 'other']);
            $table->date('payment_date');
            $table->enum('payment_status', ['paid', 'pending', 'cancelled'])->default('paid');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
