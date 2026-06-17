<?php

use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\MembershipController;
use App\Http\Controllers\Api\MembershipPlanController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\WebhookLogController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::apiResource('members', MemberController::class);
    Route::post('/memberships/{member}/renew', [MembershipController::class, 'renew']);
    Route::get('/memberships', [MembershipController::class, 'index']);

    Route::get('/membership-plans', [MembershipPlanController::class, 'index']);
    Route::get('/membership-plans/{membership_plan}', [MembershipPlanController::class, 'show']);

    Route::middleware('role:admin')->group(function () {
        Route::post('/membership-plans', [MembershipPlanController::class, 'store']);
        Route::put('/membership-plans/{membership_plan}', [MembershipPlanController::class, 'update']);
        Route::patch('/membership-plans/{membership_plan}', [MembershipPlanController::class, 'update']);
        Route::delete('/membership-plans/{membership_plan}', [MembershipPlanController::class, 'destroy']);

        Route::get('/reports', [ReportController::class, 'index']);
        Route::get('/reports/export/pdf', [ReportController::class, 'exportPdf']);
        Route::get('/reports/export/docx', [ReportController::class, 'exportDocx']);
        Route::get('/webhook-logs', [WebhookLogController::class, 'index']);
        Route::get('/webhook-logs/{webhookLog}', [WebhookLogController::class, 'show']);
    });

    Route::get('/attendances', [AttendanceController::class, 'index']);
    Route::post('/attendances/check-in', [AttendanceController::class, 'checkIn']);
    Route::apiResource('attendances', AttendanceController::class)->except(['index']);

    Route::apiResource('payments', PaymentController::class);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
});
