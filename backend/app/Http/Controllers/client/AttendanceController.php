<?php

namespace App\Http\Controllers\client;

use App\Exports\SalaryExport;
use App\Http\Controllers\Controller;
use App\Models\Attendances;
use App\Models\User;
use App\Services\FaceRecognitionService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str as SupportStr;
use Maatwebsite\Excel\Excel;

class AttendanceController extends Controller
{
    protected $faceService;

    public function __construct(FaceRecognitionService $faceService)
    {
        $this->faceService = $faceService;
    }

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

            // KIỂM TRA KHUÔN MẶT
        if (!$user->avatar) {
            return response()->json([
                'message' => 'Bạn chưa cập nhật ảnh đại diện!'
            ], 400);
        }

        try {
            $result = $this->faceService->verifyWithBase64(
                $request->imageData,
                $user->avatar
            );

            if (!$result['success']) {
                return response()->json([
                    'message' => 'Lỗi xác thực: ' . ($result['message'] ?? 'Không thể xử lý ảnh')
                ], 500);
            }

            if (!$result['is_match']) {
                // Sử dụng similarity thay vì confidence
                $similarity = round($result['similarity'] * 100, 2);
                return response()->json([
                    'message' => "Khuôn mặt không khớp với avatar (độ chính xác: {$similarity}%)"
                ], 403);
            }

            // Log thành công - sử dụng similarity
            Log::info('Face verification passed', [
                'user_id' => $user->id,
                'similarity' => $result['similarity']
            ]);

        } catch (\Exception $e) {
            Log::error('Face verification error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Lỗi xác thực khuôn mặt: ' . $e->getMessage()
            ], 500);
        }

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
            $attendance->status = 'late'; // Đi muộn
        } else {
            $attendance->status = 'present'; // Đúng giờ
        }

        $attendance->check_in = Carbon::now()->toTimeString();
        $attendance->check_in_image = $this->saveBase64Image($request->imageData, 'attendance/checkin');
        $attendance->check_in_location = $request->location['latitude'] . ',' . $request->location['longitude'];
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

        // KIỂM TRA KHUÔN MẶT
        if (!$user->avatar) {
            return response()->json([
                'message' => 'Bạn chưa cập nhật ảnh đại diện!'
            ], 400);
        }

        try {
            $result = $this->faceService->verifyWithBase64(
                $request->imageData,
                $user->avatar
            );

            if (!$result['success']) {
                return response()->json([
                    'message' => 'Lỗi xác thực: ' . ($result['message'] ?? 'Không thể xử lý ảnh')
                ], 500);
            }

            if (!$result['is_match']) {
                // Sử dụng similarity thay vì confidence
                $similarity = round($result['similarity'] * 100, 2);
                return response()->json([
                    'message' => "Khuôn mặt không khớp với avatar (độ chính xác: {$similarity}%)"
                ], 403);
            }

            // Log thành công - sử dụng similarity
            Log::info('Face verification passed', [
                'user_id' => $user->id,
                'similarity' => $result['similarity']
            ]);

        } catch (\Exception $e) {
            Log::error('Face verification error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Lỗi xác thực khuôn mặt: ' . $e->getMessage()
            ], 500);
        }

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
            if ($attendance->status === 'late') {
                // Sáng đã trễ, chiều lại về sớm -> Lỗi kép
                $attendance->status = 'late_early';
            } else {
                // Sáng đúng giờ, nhưng chiều về sớm
                $attendance->status = 'early'; 
            }
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

    public function getSalaryReport(Request $request) {
        $month = $request->month ?? date('m');
        $year = $request->year ?? date('Y');

        $users = User::with(['position', 'department', 'attendances' => function($q) use ($month, $year) {
            $q->whereMonth('date', $month)->whereYear('date', $year);
        }])->get();

        $report = $users->map(function($user) {
            $baseSalary = $user->position->salary ?? 0;
            
            // 1. Số lần đi làm đầy đủ (Present cả in và out)
            $fullAttendance = $user->attendances->where('status', 'present')->count();

            // 2. Số lần đi muộn HOẶC về sớm (Chỉ bị 1 trong 2)
            $lateOrEarly = $user->attendances->whereIn('status', ['late', 'early'])->count();

            // 3. Số lần VỪA đi muộn VỪA về sớm (Giả sử bạn có status riêng hoặc logic check)
            // Nếu database lưu status là 'late_early':
            $lateAndEarly = $user->attendances->where('status', 'late_early')->count();

            // Tính tiền phạt (Ví dụ: 1 lỗi = 50k, 2 lỗi cùng lúc = 120k)
            $penaltyAmount = ($lateOrEarly * 50000) + ($lateAndEarly * 120000);

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'position_name' => $user->position->name ?? 'N/A',
                'department_name' => $user->department->name ?? 'N/A',
                'base_salary' => $baseSalary,
                'full_attendance_count' => $fullAttendance,
                'late_or_early_count' => $lateOrEarly,
                'late_and_early_count' => $lateAndEarly,
                'penalty_amount' => $penaltyAmount,
                'final_salary' => $baseSalary - $penaltyAmount
            ];
        });

        return response()->json($report);
    }

    // public function exportSalaryExcel(Request $request) 
    // {
    //     // Lấy dữ liệu báo cáo (Dùng chung logic với hàm hiển thị)
    //     $reportData = $this->getSalaryReport($request)->original; 
        
    //     $fileName = 'Bang_Luong_' . date('m_Y') . '.xlsx';
        
    //     return Excel::download(new SalaryExport($reportData), $fileName);
    // }
}
