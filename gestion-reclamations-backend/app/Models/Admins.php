<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Admins extends Model
{
    use HasFactory;

    protected $fillable = ['id', 'agence', 'last_login'];

    public function personnes()
    {
        return $this->belongsTo(Personnes::class, 'id');
    }

    public function reclamations()
    {
        return $this->hasMany(Reclamations::class);
    }

    public function historiques()
    {
        return $this->hasMany(HistoriqueReclamation::class);
    }
}
