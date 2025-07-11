<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HistoriqueReclamation extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'reclamation_id',
        'admin_id',
        'ancienne_valeur',
        'nouvelle_valeur',
        'commentaire',
        'created_at'
    ];//3ana created_at 5atr public $timestamps = false;

    public function reclamation()
    {
        return $this->belongsTo(Reclamation::class, 'reclamation_id');
    }

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'admin_id');
    }
}
