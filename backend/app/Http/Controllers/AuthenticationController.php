<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Position;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;

class AuthenticationController extends Controller
{
    public function authenticate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if($validator->fails()) {
            return response()->json([
                'status' => false,
                'erors' => $validator->errors()
            ]);
        } else {
            $credential = [
                'email' => $request->email,
                'password' => $request->password
            ];

            if(Auth::attempt($credential)) {
                $user = User::with(['department', 'position'])->find(Auth::id());
                $token = $user->createToken('token')->plainTextToken;

                return response()->json([
                    'status' => true,
                    'token' => $token,
                    'id' => Auth::user()->id,
                    'name' => Auth::user()->name,
                    'role' => $user->role,
                    'avatar' => $user->avatar,
                    'department_id' => Auth::user()->department_id,
                    'department' => Department::find(Auth::user()->department_id)->name,
                    'position' => Position::find(Auth::user()->position_id)->name,
                    'can_create_notification' => Position::find(Auth::user()->position_id)->can_create_notification,
                ]);

            } else {
                return response()->json([
                    'status' => false,
                    'message' => 'Email hoặc mật khẩu không đúng'
                ]);
            }
        }
    }

    public function logout(Request $request) {
        try {
            // Trong Sanctum, $request->user() đã chính là user đang login
            // Chúng ta gọi currentAccessToken() để xóa chính xác token đang dùng
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'status' => true,
                'message' => 'Đăng xuất thành công (Token đã bị hủy)'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }
}
