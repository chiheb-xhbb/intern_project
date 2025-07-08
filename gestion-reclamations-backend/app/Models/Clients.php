<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Clients extends Model
{
    use HasFactory;

    protected $table = 'clients';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'numero_client',
        'adresse',
        'date_naissance',
        'segment_client',
    ];

    public function personnes()
    {
        return $this->belongsTo(Personnes::class, 'id');
    }

    public function comptes()
    {
        return $this->hasMany(ComptesBancaires::class);
    }

    public function reclamations()
    {
        return $this->hasMany(Reclamations::class);
    }
}
