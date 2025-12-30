<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Kiểm tra xem user đã đăng nhập và có đúng role không
        if (!$request->user() || auth()->user()->role !== $role) {
            return response()->json([
                'message' => 'Bạn không có quyền truy cập chức năng này!'
            ], 403);
        }

        return $next($request);
    }
}
