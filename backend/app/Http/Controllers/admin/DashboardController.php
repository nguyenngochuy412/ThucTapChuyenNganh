<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Attendances;
use App\Models\Department;
use App\Models\Notifications;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getStats() {
        return response()->json([
            'total_users' => User::where('is_active', 1)->count(),
            'today_attendance' => Attendances::whereDate('date', now())->count(),
            'department_active' => Department::where('is_active', 1)->count(),
            'total_notifications' => Notifications::count(),
        ]);
    }

    public function getAttendanceTrend() {
        $trend = [];
        
        // Lấy dữ liệu 7 ngày gần nhất
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $dateString = $date->format('Y-m-d'); // Dùng để query DB
            $displayDate = $date->format('d/m');  // Dùng để hiển thị lên biểu đồ

            // Đếm số lượng nhân viên check-in trong ngày đó
            $count = Attendances::whereDate('date', $dateString)
                        ->whereNotNull('check_in')
                        ->count();

            $trend[] = [
                'date' => $displayDate,
                'count' => $count
            ];
        }

        return response()->json($trend);
    }

    public function getSalaryByDepartment() {
         $salaries = DB::table('users')
        ->join('positions', 'users.position_id', '=', 'positions.id')
        ->join('departments', 'users.department_id', '=', 'departments.id')
        ->select(
            'departments.name as department', 
            DB::raw('SUM(positions.salary) as total_salary')
        )
        ->groupBy('departments.id', 'departments.name')
        ->get();

    return response()->json($salaries);
    }
}
