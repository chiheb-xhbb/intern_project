<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Clients extends Model
{
    protected $table = 'clients';
    public $timestamps = false; // 🔥 empêche Laravel de chercher created_at & updated_at
}
