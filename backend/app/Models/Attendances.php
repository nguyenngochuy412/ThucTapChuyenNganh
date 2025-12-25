<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Attendances extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'date',
        'check_in',
        'check_out',
        'work_hours',
        'overtime_hours',
        'status',
        'check_in_location',
        'check_out_location',
        'check_in_image',
        'check_out_image'
    ];

    protected $casts = [
        'date' => 'date',
        'work_hours' => 'decimal:2',
        'overtime_hours' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    //Relationships
    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }
}
