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
    public function viewAny(Personne $user)
    {
        return $user->admin !== null; // Only allow admins
    }
    public function view(Personne $personne, Client $client)
    {
        // Allow if user is admin
        if ($personne->admin()->exists()) {
            return true;
        }
        // Allow if user is the owner of the client account
        return $personne->id === $client->personne_id;
    }


}
