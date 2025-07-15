<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\Personne;
use App\Models\User;
class ClientPolicy
{
    public function viewClientReclamations(\App\Models\Personne $user, \App\Models\Client $client)
    {
        return $user->id === $client->id;
    }
    public function viewAny(\App\Models\Personne $user)
    {
        return $user->admin !== null; // Only allow admins
    }


}
