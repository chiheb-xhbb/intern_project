<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PiecesJointes extends Model
{
    use HasFactory;

    protected $fillable = ['reclamation_id', 'fichier_url', 'description', 'taille_fichier', 'type_fichier', 'uploaded_at'];

    public function reclamations()
    {
        return $this->belongsTo(Reclamations::class);
    }
}
