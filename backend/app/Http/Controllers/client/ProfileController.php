<?php

namespace App\Http\Controllers\client;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    private function transformUser($user)
    {
        return [
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'phone'      => $user->phone,
            'address'    => $user->address,
            'role'          => $user->role,
            // Format ngày để hiển thị ở các thẻ <div>
            'birth_date' => $user->birth_date ? Carbon::parse($user->birth_date)->format('Y-m-d') : null,
            'hire_date'  => $user->hire_date ? Carbon::parse($user->hire_date)->format('d/m/Y') : 'Chưa cập nhật',
            'avatar'     => $user->avatar, // Trả về path tương đối
            'position'      => $user->position ? $user->position->name : 'Nhân viên',
            'department'    => $user->department ? $user->department->name : 'N/A',
            'department_id' => $user->department_id,
            'can_create_notification' => $user->position ? $user->position->can_create_notification : 0,
        ];
    }

    public function show($id)
    {
        // Tìm user theo ID kèm theo các quan hệ
        $user = User::with(['department', 'position'])->find($id);

        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy người dùng'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $this->transformUser($user)
        ]);
    }

    // Cập nhật thông tin cá nhân
    public function update(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name'       => 'required|string|max:255',
            'phone'      => 'nullable|string|max:20',
            'address'    => 'nullable|string',
            'birth_date' => 'nullable|date',
            'avatar'     => 'nullable|string',
        ]);

        $data = $request->only(['name', 'phone', 'address', 'birth_date']);

        // Xử lý Avatar
        if ($request->avatar && str_contains($request->avatar, 'data:image')) {
            $image = preg_replace('#^data:image/\w+;base64,#i', '', $request->avatar);
            $image = str_replace(' ', '+', $image);
            $fileName = 'avatars/' . Str::random(10) . '_' . time() . '.jpg';
            Storage::disk('public')->put($fileName, base64_decode($image));
            
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $data['avatar'] = $fileName;
        }

        // Cập nhật Database
        $user->update($data);

        // QUAN TRỌNG: Load lại quan hệ và dùng transformUser để trả về dữ liệu sạch
        $user->load(['department', 'position']);

        return response()->json([
            'message' => 'Cập nhật thông tin thành công!',
            'user'    => $this->transformUser($user) // Trả về cấu hình y hệt hàm show
        ]);
    }

    // Đổi mật khẩu
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:6|confirmed',
        ]);

        $user = Auth::user();;

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Mật khẩu hiện tại không chính xác'], 400);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json(['message' => 'Đổi mật khẩu thành công!']);
    }
}
