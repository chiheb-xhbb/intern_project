<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Clients;

class ClientsSeeder extends Seeder
{
    public function run(): void
    {
        Clients::create([
            'id' => 1, 
            'numero_client' => 'CLT0001',
            'adresse' => 'Sidi Thabet, Cité monji Slim',
            'date_naissance' => '2004/05/21',
            'segment_client' => 'Particulier',
        ]);


    }
}
