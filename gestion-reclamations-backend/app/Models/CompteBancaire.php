<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CompteBancaire extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $table = 'comptes_bancaires';

    protected $fillable = [
        'client_id',
        'numero_compte',
        'type_compte',
        'date_ouverture'
    ];

    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }
}
