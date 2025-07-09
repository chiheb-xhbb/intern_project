<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PieceJointe extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'reclamation_id',
        'fichier_url',
        'description',
        'taille_fichier',
        'type_fichier',
        'uploaded_at'
    ];

    public function reclamation()
    {
        return $this->belongsTo(Reclamation::class, 'reclamation_id');
    }
}
