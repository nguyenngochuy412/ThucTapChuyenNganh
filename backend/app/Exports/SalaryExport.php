<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class SalaryExport implements FromCollection, WithHeadings, WithMapping
{
    protected $data;

    public function __construct($data)
    {
        // Nhận dữ liệu từ Controller truyền sang
        $this->data = $data;
    }

    public function collection()
    {
        return collect($this->data);
    }

    public function headings(): array
    {
        return [
            'ID', 'Họ Tên', 'Email', 'Chức Vụ', 'Phòng Ban', 
            'Lương Cơ Bản', 'Ngày Công Đầy Đủ', 'Muộn/Sớm Lẻ', 
            'Lỗi Kép', 'Tiền Phạt', 'Lương Thực Nhận'
        ];
    }

    public function map($row): array
    {
        return [
            $row['id'],
            $row['name'],
            $row['email'],
            $row['position_name'],
            $row['department_name'],
            number_format($row['base_salary']) . ' VND',
            $row['full_attendance_count'],
            $row['late_or_early_count'],
            $row['late_and_early_count'],
            number_format($row['penalty_amount']) . ' VND',
            number_format($row['final_salary']) . ' VND',
        ];
    }
}