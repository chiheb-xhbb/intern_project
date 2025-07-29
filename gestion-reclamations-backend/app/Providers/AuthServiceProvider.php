<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use App\Models\Reclamation;
use App\Models\Client;
use App\Models\CompteBancaire;
use App\Policies\ReclamationPolicy;
use App\Policies\ClientPolicy;
use App\Policies\CompteBancairePolicy;
use Illuminate\Support\Facades\Gate;


class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     */
    protected $policies = [
        Reclamation::class => ReclamationPolicy::class,
        CompteBancaire::class =>CompteBancairePolicy::class,
        Client::class => ClientPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot()
    {
        $this->registerPolicies();

    Gate::define('viewClientReclamations', function ($user, $client) {
        return $user->id === $client->id;
    });

        // Allow only admin users to access admin routes
        Gate::define('admin-access', function ($user) {
            return $user->admin !== null;
        });
    }
}
