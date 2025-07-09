<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Personne;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Gate;

class ClientController extends Controller
{
    /**
     * Get all clients (Admin only)
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Client::class);

        $query = Client::with('personne')
            ->orderBy('created_at', 'desc');

        return response()->json([
            'data' => $query->paginate(15)
        ]);
    }

    /**
     * Get client details
     */
    public function show(Client $client)
    {
        Gate::authorize('view', $client);

        return response()->json([
            'client' => $client->load([
                'personne',
                'comptes',
                'reclamations' => function($query) {
                    $query->orderBy('date_reception', 'desc')->limit(5);
                }
            ])
        ]);
    }

    /**
     * Update client profile
     */
    public function update(Request $request, Client $client)
    {
        Gate::authorize('update', $client);

        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'prenom' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('personnes')->ignore($client->personne->id)
            ],
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'date_naissance' => 'nullable|date',
            'segment_client' => 'sometimes|in:Particulier,PME,Entreprise,VIP'
        ]);

        return DB::transaction(function () use ($validated, $client) {
            // Update Personne
            $client->personne->update([
                'nom' => $validated['nom'] ?? $client->personne->nom,
                'prenom' => $validated['prenom'] ?? $client->personne->prenom,
                'email' => $validated['email'] ?? $client->personne->email,
                'telephone' => $validated['telephone'] ?? $client->personne->telephone
            ]);

            // Update Client
            $client->update([
                'adresse' => $validated['adresse'] ?? $client->adresse,
                'date_naissance' => $validated['date_naissance'] ?? $client->date_naissance,
                'segment_client' => $validated['segment_client'] ?? $client->segment_client
            ]);

            return response()->json([
                'message' => 'Client updated successfully',
                'client' => $client->fresh()->load('personne')
            ]);
        });
    }

    /**
     * Get client's bank accounts
     */
    public function comptes(Client $client)
    {
        Gate::authorize('view', $client);

        return response()->json([
            'data' => $client->comptes()->paginate(10)
        ]);
    }

    /**
     * Get client's reclamations (without backend filtering)
     */
    public function reclamations(Client $client)
    {
        Gate::authorize('view', $client);

        return response()->json([
            'data' => $client->reclamations()
                ->with(['piecesJointes', 'historiques'])
                ->orderBy('date_reception', 'desc')
                ->paginate(10)
        ]);
    }
}