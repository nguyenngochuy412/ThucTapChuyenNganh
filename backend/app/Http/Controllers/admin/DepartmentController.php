<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index()
    {
        // Lấy danh sách kèm số lượng nhân viên
        $depts = Department::withCount('users')->orderBy('id', 'desc')->get();
        return response()->json($depts);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_active' => 'boolean'
        ]);

        $dept = Department::create($data);
        return response()->json($dept, 201);
    }

    public function update(Request $request, $id)
    {
        $dept = Department::findOrFail($id);
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_active' => 'boolean'
        ]);

        $dept.update($data);
        return response()->json($dept);
    }

    public function destroy($id)
    {
        $dept = Department::findOrFail($id);
        $dept->delete();
        return response()->json(['message' => 'Xóa thành công']);
    }
}
