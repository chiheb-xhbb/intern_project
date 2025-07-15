<?php

namespace App\Policies;

use App\Models\Reclamation;
use App\Models\Personne;

class ReclamationPolicy
{
    public function viewAny(Personne $user)
    {
        return $user->admin !== null;
    }

    public function view(Personne $user, Reclamation $reclamation)
    {
        return $user->admin !== null || $user->client?->id === $reclamation->client_id;
    }

    public function create(Personne $user)
    {
        return $user->client !== null || $user->admin !== null;
    }


    public function update(Personne $user, Reclamation $reclamation)
    {
        return $user->admin !== null;
    }

    public function delete(Personne $user, Reclamation $reclamation)
    {
        return $user->admin !== null;
    }
}
