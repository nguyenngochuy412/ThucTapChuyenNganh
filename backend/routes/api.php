<?php

use App\Events\MessageSent as EventsMessageSent;
use App\Http\Controllers\admin\DashboardController;
use App\Http\Controllers\admin\UserController;
use App\Http\Controllers\AuthenticationController;
use App\Http\Controllers\client\AttendanceController;
use App\Http\Controllers\client\NotificationController;
use App\Http\Controllers\client\ProfileController;
use App\Http\Controllers\client\RequestController;
use Illuminate\Support\Facades\Route;

Route::post('authenticate', [AuthenticationController::class, 'authenticate']);

Route::group(['middleware' => ['auth:sanctum']], function() {
    //Logout 
    Route::post('logout', [AuthenticationController::class, 'logout']);

    Route::prefix('profile')->group(function () {
        Route::get('{id}', [ProfileController::class, 'show']);
        Route::post('update', [ProfileController::class, 'update']);
        Route::post('change-password', [ProfileController::class, 'changePassword']);
    });

    //Protected routes
    Route::prefix('attendance')->group(function () {
        Route::post('check-in', [AttendanceController::class, 'checkIn']);
        Route::post('check-out', [AttendanceController::class, 'checkOut']);
        Route::get('today', [AttendanceController::class, 'getTodayAttendance']);
        Route::get('history', [AttendanceController::class, 'getHistory']);
        Route::post('location/validate', [AttendanceController::class, 'validateLocation']);
    });

    Route::prefix('notifications')->group(function () {
        Route::get('show', [NotificationController::class, 'index']);
        Route::post('create', [NotificationController::class, 'createNotifications']);
    });

    Route::prefix('requests')->group(function () {
        Route::get('categories', [RequestController::class, 'getCategories']);
        Route::get('users', [RequestController::class, 'getRecipients']);
        Route::get('receivers', [RequestController::class, 'getReceivedRequests']);
        Route::get('sent', [RequestController::class, 'getSentRequests']);
        Route::post('create', [RequestController::class, 'createRequest']);
        Route::post('{id}/status', [RequestController::class, 'updateStatus']);
    });

    Route::middleware(['role:admin'])->prefix('admin')->group(function () {
        Route::get('dashboard-stats', [DashboardController::class, 'getStats']);
        Route::get('getAttendanceTrend', [DashboardController::class, 'getAttendanceTrend']);
        Route::get('getSalaryByDepartment', [DashboardController::class, 'getSalaryByDepartment']);

        Route::prefix('users')->group(function () {
            Route::get('show', [UserController::class, 'index']);
            Route::get('showMetaData', [UserController::class, 'metaData']);
            Route::post('create', [UserController::class, 'create']);
            Route::put('{id}', [UserController::class, 'update']);
            Route::delete('{id}', [UserController::class, 'delete']);
        });
    });
});