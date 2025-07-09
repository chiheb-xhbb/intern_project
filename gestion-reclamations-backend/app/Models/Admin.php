<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Admin extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'id',
        'agence',
        'last_login',
    ];

    public function personne()
    {
        return $this->belongsTo(Personne::class, 'id');
    }

    public function reclamations()
    {
        return $this->hasMany(Reclamation::class, 'admin_id');
    }

    public function historiques()
    {
        return $this->hasMany(HistoriqueReclamation::class, 'admin_id');
    }
}
