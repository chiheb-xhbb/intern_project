<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ComptesBancaires extends Model
{
    use HasFactory;

    protected $fillable = ['client_id', 'numero_compte', 'type_compte', 'date_ouverture'];

    public function clients()
    {
        return $this->belongsTo(Clients::class);
    }
}