<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notifications extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'type',
        'sender_id',
        'department_id'
    ];

    // Quan hệ với User (Người gửi)
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    // Quan hệ với Department (Phòng ban nhận)
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class,);
    }
}
