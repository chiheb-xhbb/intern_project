<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Reclamations extends Model
{
    use HasFactory;

    protected $fillable = ['client_id', 'admin_id', 'type_reclamation', 'canal', 'description', 'date_reception', 'date_resolution', 'statut'];

    public function clients()
    {
        return $this->belongsTo(Clients::class);
    }

    public function admins()
    {
        return $this->belongsTo(Admins::class);
    }

    public function piecesJointes()
    {
        return $this->hasMany(PiecesJointes::class);
    }

    public function historiques()
    {
        return $this->hasMany(HistoriqueReclamation::class);
    }
}
