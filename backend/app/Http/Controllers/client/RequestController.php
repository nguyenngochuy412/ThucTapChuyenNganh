<?php

namespace App\Http\Controllers\client;

use App\Http\Controllers\Controller;
use App\Models\RequestCategory;
use App\Models\RequestForm;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RequestController extends Controller
{
    public function getCategories(Request $request) {
        return response()->json(RequestCategory::all());
    }

    public function getRecipients() {
        $userId = Auth::id();
        $currentUser = User::find($userId);

        if (!$currentUser) {
            return response()->json(['message' => 'Không tìm thấy người dùng'], 404);
        }

        $recipients = User::where('department_id', $currentUser->department_id)
        ->where('id', '!=', $userId)
        ->whereHas('position', function($query) {
            $query->where('can_create_notification', true)
                  ->where('is_active', true);
        })
        ->with('position:id,name') 
        ->get(['id', 'name', 'position_id'])
        ->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'position_name' => $user->position->name ?? 'N/A', // Lấy tên chức vụ
            ];
        });

        return response()->json($recipients);
    }

    public function getReceivedRequests() {
       $user = Auth::user();
        $userId = $user->id;

        // Truy cập vào thông tin position của user
        // Lưu ý: Đảm bảo Model User đã có relationship 'position'
        $canCreateNoti = $user->position ? $user->position->can_create_notification : 0;

        $query = RequestForm::query();

        if ($canCreateNoti == 1) {
            // TRƯỜNG HỢP QUẢN LÝ: Lấy đơn người khác gửi ĐẾN mình (recipient_id)
            $query->where('recipient_id', $userId);
        } else {
            // TRƯỜNG HỢP NHÂN VIÊN: Lấy đơn CHÍNH MÌNH gửi đi (sender_id)
            $query->where('sender_id', $userId);
        }

        $requests = $query->with([
                'sender:id,name',           // Thông tin người làm đơn
                'recipient:id,name',        // Thông tin người nhận đơn (để nhân viên biết mình gửi cho ai)
                'category:id,name'          // Loại đơn (Nghỉ phép, đi muộn...)
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($requests);
    }

    public function getSentRequests()
    {
        // Lấy ID người đang login
        $userId = Auth::id();

        // Lấy các đơn mình đã gửi
        $requests = RequestForm::where('sender_id', $userId)
            ->with([
                'recipient:id,name', // Lấy tên người nhận đơn (Sếp/Quản lý)
                'category:id,name'   // Lấy loại đơn
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($requests);
    }

    public function createRequest(Request $request) {
        $validated = $request->validate([
            'category_id'  => 'required|exists:request_categories,id',
            'recipient_id' => 'required|exists:users,id',
            'from_date'    => 'required|date|after_or_equal:today',
            'to_date'      => 'required|date|after_or_equal:from_date',
            'reason'       => 'required|string',
        ], [
            'from_date.after_or_equal' => 'Ngày bắt đầu không được ở quá khứ.',
            'to_date.after_or_equal'   => 'Ngày kết thúc không được trước ngày bắt đầu.',
        ]);

        try {
            // Sử dụng Transaction để đảm bảo an toàn dữ liệu
            $newRequest = DB::transaction(function () use ($validated) {
                return RequestForm::create([
                    'sender_id'      => Auth::id(), // ID người gửi (người đang login)
                    'category_id'  => $validated['category_id'],
                    'recipient_id' => $validated['recipient_id'],
                    'from_date'    => $validated['from_date'],
                    'to_date'      => $validated['to_date'],
                    'reason'       => $validated['reason'],
                    'status'       => 'pending', // Mặc định trạng thái chờ duyệt
                ]);
            });

            return response()->json([
                'message' => 'Tạo yêu cầu thành công',
                'data' => $newRequest
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Có lỗi xảy ra khi lưu dữ liệu',
                'error' => $e->getMessage()
            ], 500);
        }

        return response()->json(['message' => 'Tạo yêu cầu thành công']);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected' // Chỉ chấp nhận 2 giá trị này
        ]);

        // Tìm đơn theo ID
        $requestForm = RequestForm::find($id);

        if (!$requestForm) {
            return response()->json(['message' => 'Không tìm thấy đơn yêu cầu'], 404);
        }

        // Bảo mật: Chỉ người nhận đơn (recipient_id) mới có quyền duyệt đơn này
        if ($requestForm->recipient_id !== Auth::id()) {
            return response()->json(['message' => 'Bạn không có quyền duyệt đơn này'], 403);
        }

        // Cập nhật trạng thái
        $requestForm->status = $validated['status'];
        $requestForm->save();

        return response()->json([
            'status' => true,
            'message' => 'Cập nhật trạng thái thành công',
            'data' => $requestForm
        ]);
    }
}
