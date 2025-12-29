<?php

namespace App\Http\Controllers\client;

use App\Events\NotificationCreated;
use App\Http\Controllers\Controller;
use App\Models\Notifications;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    // 1. Lấy danh sách thông báo dành cho user hiện tại
    public function index(Request $request)
    {
        $user = Auth::user();

        // Chỉ lấy thông báo thuộc phòng ban của user đó
        $notifications = Notifications::with('sender:id,name') // Lấy thêm tên người gửi cho đẹp UI
            ->where('department_id', $user->department_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notifications);
    }

    // 2. Trưởng phòng tạo thông báo mới
    public function createNotifications(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:info,success,warning,danger'
        ]);

        $notification = Notifications::create([
            'title' => $request->title,
            'content' => $request->content,
            'type' => $request->type,
            'sender_id' => $user->id, // Tự động lấy ID của trưởng phòng đang login
            'department_id' => $user->department_id // Tự động lấy phòng ban của trưởng phòng
        ]);

        // Phát sự kiện thông báo mới
        event(new NotificationCreated($notification));

        return response()->json([
            'message' => 'Gửi thông báo thành công!',
            'data' => $notification
        ], 201);    
    }
}
