<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RequestCategory extends Model
{
    protected $fillable = ['name', 'code'];

    public function requests():HasMany
    {
        return $this->hasMany(RequestForm::class, 'category_id');
    }
}
