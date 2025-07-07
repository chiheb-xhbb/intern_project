<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Personnes;

class PersonneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Personnes::create([
            'nom' => 'Chhebddine',
            'prenom' => 'Selmi',
            'email' => 'chiheb@gmail.com',
            'telephone' => '23917709',
            'mot_de_passe' => bcrypt('password123'), // hash le mot de passe
        ]);
    }
}
