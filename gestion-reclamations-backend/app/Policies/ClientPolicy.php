<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\Personne;
use App\Models\User;
class ClientPolicy
{
    public function viewClientReclamations(Personne $user, Client $client)
    {
        return $user->client_id === $client->id;
    }
}
