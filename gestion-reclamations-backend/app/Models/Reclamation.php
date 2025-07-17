<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Reclamation extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'admin_id',
        'compte_bancaire_id',
        'type_reclamation',
        'canal',
        'description',
        'date_reception',
        'date_resolution',
        'statut'
    ];

    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'admin_id');
    }

    public function piecesJointes()
    {
        return $this->hasMany(PieceJointe::class, 'reclamation_id');
    }

    public function historiques()
    {
        return $this->hasMany(HistoriqueReclamation::class, 'reclamation_id');
    }

    public function compteBancaire()
    {
        return $this->belongsTo(CompteBancaire::class);
    }

    
}
