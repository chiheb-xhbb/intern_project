<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HistoriqueReclamation extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $fillable = ['reclamation_id', 'admin_id', 'ancienne_valeur', 'nouvelle_valeur', 'commentaire', 'created_at'];

    public function reclamations()
    {
        return $this->belongsTo(Reclamations::class);
    }

    public function admins()
    {
        return $this->belongsTo(Admins::class);
    }
}
