<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Client extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'id',
        'numero_client',
        'adresse',
        'date_naissance',
        'segment_client',
    ];

    public function personne()
    {
        return $this->belongsTo(Personne::class, 'id');
    }

    public function comptes()
    {
        return $this->hasMany(CompteBancaire::class, 'client_id');
    }

    public function reclamations()
    {
        return $this->hasMany(Reclamation::class, 'client_id');
    }
}
