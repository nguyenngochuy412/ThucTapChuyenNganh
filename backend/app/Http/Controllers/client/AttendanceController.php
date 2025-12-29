<?php

namespace App\Http\Controllers\client;

use App\Http\Controllers\Controller;
use App\Models\Attendances;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

    private function getStatusLabel($status)
    {
        $labels = [
            'present'     => 'Đúng giờ',
            'late'        => 'Đi muộn',
            'early_leave' => 'Về sớm',
            'late_early'  => 'Trễ & Sớm',
        ];

        return $labels[$status] ?? 'N/A';
    }

    private function transformAttendance($item)
    {
        return [
            'id'                 => $item->id,
            'date'               => $item->date->format('d/m/Y'),
            'check_in'           => $item->check_in ? Carbon::parse($item->check_in)->format('H:i') : null,
            'check_out'          => $item->check_out ? Carbon::parse($item->check_out)->format('H:i') : null,
            'check_in_location'  => $item->check_in_location,
            'check_out_location' => $item->check_out_location,
            // Tạo URL tuyệt đối cho ảnh
            'check_in_image'     => $item->check_in_image ? asset('storage/' . $item->check_in_image) : null,
            'check_out_image'    => $item->check_out_image ? asset('storage/' . $item->check_out_image) : null,
            'status'             => $item->status,
            'status_label'       => $this->getStatusLabel($item->status), // Dùng cái này để hiển thị tiếng Việt
            'work_hours'         => $item->work_hours,
        ];
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
        $now = Carbon::now();

        // 5. Lấy giờ bắt đầu làm việc (Mặc định 08:00:00)
        $startTimeStr = $department->start_time ?? '08:00:00';
        $officeStartTime = Carbon::createFromFormat('H:i:s', $startTimeStr)->setDate($now->year, $now->month, $now->day);

        // 6. Kiểm tra đã check-in hôm nay chưa
        $attendance = Attendances::where('user_id', $user->id)->where('date', $today)->first();

        if ($attendance && $attendance->check_in) {
            return response()->json(['message' => 'Bạn đã check-in ngày hôm nay rồi!'], 400);
        }

        // 7. Lưu thông tin
        if (!$attendance) {
            $attendance = new Attendances();
            $attendance->user_id = $user->id;
            $attendance->date = $today;
        }

         // 8. Xác định trạng thái "Đi trễ"
        // Cho phép trễ 15 phút (tùy chọn): $officeStartTime->addMinutes(15)
        $graceLimit = $officeStartTime->copy()->addMinutes(15);
        if ($now->greaterThan($graceLimit)) {
            $attendance->status = 'late';
        } else {
            $attendance->status = 'present';
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

        // 4. Lấy giờ tan làm (Mặc định 17:00:00)
        $endTimeStr = $department->end_time ?? '17:00:00';
        $officeEndTime = Carbon::createFromFormat('H:i:s', $endTimeStr)->setDate($now->year, $now->month, $now->day);

        // 5. Xác định trạng thái "Về sớm"
        if ($now->lessThan($officeEndTime)) {
            // Nếu sáng đã trễ thì ghi nhận 'late_early' (Cả trễ cả sớm)
            // Nếu sáng đúng giờ thì ghi nhận 'early_leave' (Về sớm)
            $attendance->status = ($attendance->status === 'late') ? 'late_early' : 'early_leave';
        }

        // 6. Lưu dữ liệu check-out
        $attendance->check_out = $now->toTimeString();
        $attendance->check_out_image = $this->saveBase64Image($request->imageData, 'attendance/checkout');
        $attendance->check_out_location = $request->location['latitude'] . ',' . $request->location['longitude'];

        // 7. Tính toán giờ làm việc (work_hours)
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

    public function getTodayAttendance()
    {
        $userId = Auth::id();
        $attendance = Attendances::where('user_id', $userId)
                                ->where('date', Carbon::today()->toDateString())
                                ->first();
        
        // Trả về mảng để khớp với logic .filter() ở Frontend
        $data = $attendance ? $this->transformAttendance($attendance) : null;
        return response()->json(['data' => $data]);
    }

    public function getHistory(Request $request)
    {
        $userId = Auth::id(); // Ưu tiên lấy ID từ Token để bảo mật
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');

        // KIỂM TRA LỖI: Nếu có ngày kết thúc mà không có ngày bắt đầu
        if (empty($startDate) && !empty($endDate)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vui lòng chọn "Ngày bắt đầu" trước khi chọn "Ngày kết thúc"!'
            ], 400); // Trả về mã lỗi 400 (Bad Request)
        }

        $query = Attendances::where('user_id', $userId);

        // Kiểm tra nếu có đầy đủ ngày bắt đầu và ngày kết thúc
        if (!empty($startDate)) {
            if (!empty($endDate)) {
                // Trường hợp: Có cả hai ngày
                $query->whereBetween('date', [$startDate, $endDate]);
            } else {
                // Trường hợp: Chỉ có startDate -> Lấy từ đó đến nay
                $query->where('date', '>=', $startDate);
            }
        } else {
            // Trường hợp: Cả 2 đều trống -> Lấy 7 cái cuối
            $query->limit(7);
        }

        // Lấy dữ liệu và sắp xếp mới nhất lên đầu
        $history = $query->orderBy('date', 'desc')->get();

        // Map lại dữ liệu để khớp với tên biến ở Frontend (nếu cần)
        $formattedData = $history->map(function ($item) {
            return $this->transformAttendance($item);
        });

        return response()->json([
            'status' => 'success',
            'data' => $formattedData
        ]);
    }
}
