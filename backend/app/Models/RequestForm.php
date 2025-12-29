<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestForm extends Model
{
    protected $fillable = ['category_id', 'from_date', 'to_date', 'reason', 'sender_id', 'recipient_id', 'status'];

    public function category():BelongsTo
    {
        return $this->belongsTo(RequestCategory::class, 'category_id');
    }

    public function sender(): BelongsTo
    {
        // Giả sử Model User nằm trong App\Models\User
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Quan hệ với người nhận/duyệt đơn (Quản lý/Sếp)
     */
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }
}
