<?php

namespace App\Http\Controllers;

use App\Models\Reclamation;
use App\Models\HistoriqueReclamation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ReclamationController extends Controller
{
    use AuthorizesRequests;

    /**
     * Get all reclamations (Admin only)
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Reclamation::class);


        $query = Reclamation::with(['client.personne', 'piecesJointes', 'historiques.admin.personne'])
            ->orderBy('date_reception', 'desc');

        return response()->json([
            'data' => $query->paginate(15)
        ]);
    }

    /**
     * Get client's own reclamations
     */
    public function clientReclamations(Request $request)
    {
        $client = $request->user()->client;
        Gate::authorize('viewClientReclamations', $client);

        return response()->json([
            'data' => $client->reclamations()
                ->with(['piecesJointes', 'historiques.admin.personne'])
                ->orderBy('date_reception', 'desc')
                ->paginate(10)
        ]);
    }

    /**
     * Create a new reclamation
     */
    public function store(Request $request)
    {
        $this->authorize('create', Reclamation::class);

        $user = $request->user();

        $rules = [
            'type_reclamation' => [
                'required',
                Rule::in(['Carte bloquée', 'Erreur de virement', 'Retard crédit', 'Autre']),
            ],
            'canal' => [
                'nullable',
                Rule::in(['email', 'téléphone', 'agence', 'application_web']),
            ],
            'description' => 'required|string|max:1000',
        ];

        // Si l'utilisateur est un admin, il DOIT spécifier le client concerné
        if ($user->admin) {
            $rules['client_id'] = 'required|exists:clients,id';
        }

        $validated = $request->validate($rules);

        $reclamation = Reclamation::create([
            'client_id' => $user->admin ? $validated['client_id'] : $user->client->id,
            'admin_id' => $user->admin ? $user->admin->id : null,
            'type_reclamation' => $validated['type_reclamation'],
            'canal' => $validated['canal'] ?? 'application_web',
            'description' => $validated['description'],
            'date_reception' => now(),
            'statut' => 'en attente',
        ]);

        return response()->json([
            'message' => 'Réclamation créée avec succès',
            'reclamation' => $reclamation->load(['client.personne']),
        ], 201);
    }


    /**
     * Get specific reclamation details
     */
    public function show(Reclamation $reclamation)
    {
        Gate::authorize('view', $reclamation);

        return response()->json([
            'reclamation' => $reclamation->load([
                'client.personne',
                'admin.personne',
                'piecesJointes',
                'historiques.admin.personne'
            ])
        ]);
    }

    /**
     * Update reclamation status (Admin only)
     */
    public function updateStatus(Request $request, Reclamation $reclamation)
    {
        Gate::authorize('update', $reclamation);

        $validated = $request->validate([
            'statut' => [
                'required',
                Rule::in(['en attente', 'en cours', 'résolue', 'rejetée', 'clôturée'])
            ],
            'commentaire' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($reclamation, $validated) {
            // Log status change
            HistoriqueReclamation::create([
                'reclamation_id' => $reclamation->id,
                'admin_id' => auth()->id(),
                'ancienne_valeur' => $reclamation->statut,
                'nouvelle_valeur' => $validated['statut'],
                'commentaire' => $validated['commentaire'],
            ]);

            // Update reclamation
            $updateData = ['statut' => $validated['statut']];
            
            if ($validated['statut'] === 'résolue') {
                $updateData['date_resolution'] = now();
            }

            $reclamation->update($updateData);
        });

        return response()->json([
            'message' => 'Statut mis à jour avec succès',
            'reclamation' => $reclamation->fresh(['historiques.admin.personne'])
        ]);
    }

    /**
     * Delete a reclamation (Admin only)
     */
    public function destroy(Reclamation $reclamation)
    {
        Gate::authorize('delete', $reclamation);

        $reclamation->delete();

        return response()->json([
            'message' => 'Réclamation supprimée avec succès'
        ]);
    }
}