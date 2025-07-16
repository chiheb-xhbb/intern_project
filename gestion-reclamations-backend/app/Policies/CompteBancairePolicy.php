<?php

namespace App\Policies;

use App\Models\CompteBancaire;
use App\Models\Personne;
use Illuminate\Auth\Access\Response;

class CompteBancairePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(Personne $personne): bool
    {
        return $personne->admin()->exists();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(Personne $personne, CompteBancaire $compteBancaire): bool
    {
        return $personne->admin()->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(Personne $personne): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(Personne $personne, CompteBancaire $compteBancaire): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(Personne $personne, CompteBancaire $compteBancaire): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(Personne $personne, CompteBancaire $compteBancaire): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(Personne $personne, CompteBancaire $compteBancaire): bool
    {
        return false;
    }
}
