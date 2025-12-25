<?php

use App\Http\Controllers\admin\DashboardController;

use App\Http\Controllers\AuthenticationController;
use App\Http\Controllers\client\AttendanceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('authenticate', [AuthenticationController::class, 'authenticate']);
Route::post('logout', [AuthenticationController::class, 'logout']);

Route::group(['middleware' => ['auth:sanctum']], function() {
    //Protected routes
    Route::prefix('attendance')->group(function () {
        Route::post('check-in', [AttendanceController::class, 'checkIn']);
        Route::post('check-out', [AttendanceController::class, 'checkOut']);
        Route::get('today/{userId}', [AttendanceController::class, 'getTodayAttendance']);
        Route::post('location/validate', [AttendanceController::class, 'validateLocation']);
    });
});