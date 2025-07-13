<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;

class Personne extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'personnes';

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'telephone',
        'mot_de_passe'
    ];

    protected $hidden = [
        'mot_de_passe',
    ];

    /**
     * Permet à Laravel d'utiliser 'mot_de_passe' comme champ password.
     */
    public function getAuthPassword()
    {
        return $this->mot_de_passe;
    }

    public function client()
    {
        return $this->hasOne(Client::class, 'id');
    }

    public function admin()
    {
        return $this->hasOne(Admin::class, 'id');
    }
}
