<?php

// app/Models/Personne.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Personnes extends Model
{
    use HasFactory;

    protected $table = 'personnes';
    protected $fillable = ['nom', 'prenom', 'email', 'telephone', 'mot_de_passe'];

    public function clients()
    {
        return $this->hasOne(Clients::class, 'id');
    }

    public function admins()
    {
        return $this->hasOne(Admins::class, 'id');
    }
}
