<?php

namespace App\Http\Controllers\client;

use App\Http\Controllers\Controller;
use App\Models\Attendances;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str as SupportStr;

class AttendanceController extends Controller
{
    // Hàm hỗ trợ lưu ảnh Base64
    private function saveBase64Image($base64String, $folder)
    {
        // Sử dụng Regex để loại bỏ phần đầu chuỗi Base64 bất kể định dạng jpeg/png
        $image = preg_replace('#^data:image/\w+;base64,#i', '', $base64String);
        $image = str_replace(' ', '+', $image);
        
        $fileName = $folder . '/' . SupportStr::random(10) . '_' . time() . '.jpg';
        Storage::disk('public')->put($fileName, base64_decode($image));
        return $fileName;
    }

    private function calculateDistance($lat1, $lon1, $lat2, $lon2) {
        $earthRadius = 6371000; // mét
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon/2) * sin($dLon/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        return $earthRadius * $c;
    }

    public function checkIn(Request $request)
    {
        // 1. Validate dữ liệu gửi từ Frontend (Sửa để khớp với Object location)
        $request->validate([
            'imageData' => 'required|string',
            'location'  => 'required|array',
            'location.latitude'  => 'required|numeric',
            'location.longitude' => 'required|numeric',
        ]);

        $user = $request->user();
        $department = $user->department;

        // 2. Lấy tọa độ từ 2 cột riêng biệt trong bảng departments
        $officeLat = $department->latitude;
        $officeLng = $department->longitude;

        if (!$officeLat || !$officeLng) {
            return response()->json(['message' => 'Văn phòng của bạn chưa cấu hình tọa độ!'], 400);
        }

        // 3. Tính khoảng cách
        $distance = $this->calculateDistance(
            $request->location['latitude'], 
            $request->location['longitude'], 
            $officeLat, 
            $officeLng
        );

        if ($distance > 200) { // Giới hạn 200 mét
            return response()->json([
                'message' => "Bạn ở quá xa văn phòng (" . round($distance) . "m). Vui lòng di chuyển lại gần!"
            ], 403);
        }

        // 4. Kiểm tra trạng thái trong ngày
        $today = Carbon::today()->toDateString();
        $attendance = Attendances::where('user_id', $user->id)->where('date', $today)->first();

        if ($attendance && $attendance->check_in) {
            return response()->json(['message' => 'Bạn đã check-in ngày hôm nay rồi!'], 400);
        }

        // 5. Lưu thông tin
        if (!$attendance) {
            $attendance = new Attendances();
            $attendance->user_id = $user->id;
            $attendance->date = $today;
        }

        $attendance->check_in = Carbon::now()->toTimeString();
        $attendance->check_in_image = $this->saveBase64Image($request->imageData, 'attendance/checkin');
        $attendance->check_in_location = $request->location['latitude'] . ',' . $request->location['longitude'];
        $attendance->status = 'present';
        $attendance->save();

        return response()->json(['status' => 'success', 'message' => 'Check-in thành công!', 'data' => $attendance]);
    }

    public function checkOut(Request $request)
    {
        // 1. Validate dữ liệu (khớp với cấu trúc object location từ Frontend)
        $request->validate([
            'imageData' => 'required|string',
            'location'  => 'required|array',
            'location.latitude'  => 'required|numeric',
            'location.longitude' => 'required|numeric',
        ]);

        $user = $request->user();
        $today = Carbon::today()->toDateString();
        $now = Carbon::now();

        // 2. Kiểm tra bản ghi điểm danh hôm nay
        $attendance = Attendances::where('user_id', $user->id)
                                ->where('date', $today)
                                ->first();

        if (!$attendance || !$attendance->check_in) {
            return response()->json(['message' => 'Bạn chưa check-in nên không thể check-out!'], 400);
        }

        if ($attendance->check_out) {
            return response()->json(['message' => 'Bạn đã check-out ngày hôm nay rồi!'], 400);
        }

        // 3. KIỂM TRA KHOẢNG CÁCH KHI CHECK-OUT (Ngăn chặn việc về nhà rồi mới bấm check-out)
        $department = $user->department;
        if ($department && $department->latitude && $department->longitude) {
            $distance = $this->calculateDistance(
                $request->location['latitude'], 
                $request->location['longitude'], 
                $department->latitude, 
                $department->longitude
            );

            if ($distance > 200) { // Giới hạn 200m
                return response()->json([
                    'message' => "Bạn đứng quá xa văn phòng (" . round($distance) . "m) để check-out!"
                ], 403);
            }
        }

        // 4. Lưu dữ liệu check-out
        $attendance->check_out = $now->toTimeString();
        $attendance->check_out_image = $this->saveBase64Image($request->imageData, 'attendance/checkout');
        $attendance->check_out_location = $request->location['latitude'] . ',' . $request->location['longitude'];

        // 5. Tính toán giờ làm việc (work_hours)
        // Chuyển đổi check_in từ string sang đối tượng Carbon để tính toán
        $checkInTime = Carbon::createFromFormat('H:i:s', $attendance->check_in);
        
        // Tính tổng số phút và đổi sang giờ (làm tròn 2 chữ số thập phân)
        $totalMinutes = $checkInTime->diffInMinutes($now);
        $attendance->work_hours = round($totalMinutes / 60, 2);

        $attendance->save();

        return response()->json([
            'status' => 'success', 
            'message' => 'Check-out thành công! Tổng giờ làm: ' . $attendance->work_hours . 'h',
            'data' => $attendance
        ]);
    }

    public function getTodayAttendance($userId)
    {
        $attendance = Attendances::where('user_id', $userId)
                                ->where('date', Carbon::today()->toDateString())
                                ->first();
        
        // Trả về mảng để khớp với logic .filter() ở Frontend
        return response()->json(['data' => $attendance ? [$attendance] : []]);
    }
}
