<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Position;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request) {
        $query = User::with(['department', 'position']);

        // Tìm kiếm
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'LIKE', "%{$request->search}%")
                ->orWhere('email', 'LIKE', "%{$request->search}%");
            });
        }

        // Lọc theo phòng ban
        if ($request->department_id) {
            $query->where('department_id', $request->department_id);
        }

        // Lọc theo chức vụ
        if ($request->position_id) {
            $query->where('position_id', $request->position_id);
        }

        return response()->json($query->get());
    }

    public function metaData() {
        return response()->json([
            'departments' => Department::select('id', 'name')->get(),
            'positions' => Position::select('id', 'name')->get(),
        ]);
    }

     public function create(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'department_id' => 'required|exists:departments,id',
            'position_id' => 'required|exists:positions,id',
            'role' => 'required|in:admin,employee',
        ], [
            'email.unique' => 'Email này đã được đăng ký trong hệ thống.',
            'department_id.required' => 'Vui lòng chọn phòng ban.',
        ]);

        try {
            DB::beginTransaction();
            $user = User::create([
                ...$validated,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'birth_date' => $request->birth_date,
                'address' => $request->address,
                'hire_date' => $request->hire_date ?? now(),
                'is_active' => $request->is_active ?? true,
                'email_verified_at' => now(),
            ]);
            DB::commit();

            return response()->json(['success' => true, 'message' => 'Thêm nhân viên thành công'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi server'], 500);
        }
    }

    public function update(Request $request, int $id)
    {
        $user = User::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'department_id' => 'required|exists:departments,id',
            'position_id' => 'required|exists:positions,id',
        ]);

        try {
            $data = $request->all();
            if ($request->filled('password')) {
                $data['password'] = Hash::make($request->password);
            } else {
                unset($data['password']);
            }

            $user->update($data);
            return response()->json(['success' => true, 'message' => 'Cập nhật thành công']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi khi cập nhật'], 500);
        }
    }

    public function delete(int $id)
    {
        $user = User::find($id);
        if (!$user) return response()->json(['message' => 'Không tìm thấy'], 404);
        
        if ($user->role === 'super_admin') {
            return response()->json(['message' => 'Không thể xóa Admin hệ thống'], 403);
        }

        $user->delete();
        return response()->json(['success' => true, 'message' => 'Xóa thành công']);
    }
}
