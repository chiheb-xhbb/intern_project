<?php

namespace App\Http\Controllers;
use Illuminate\Validation\Rules\Password;
use App\Models\Reclamation;
use App\Models\HistoriqueReclamation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use App\Models\Client;
use App\Models\Personne;
use Illuminate\Support\Facades\Hash;



class AdminController extends Controller
{
    /**
     * Get admin dashboard statistics
     */
    public function dashboard()
    {
        Gate::authorize('admin-access');

        $stats = [
            'pending_count' => Reclamation::where('statut', 'en attente')->count(),
            'in_progress_count' => Reclamation::where('statut', 'en cours')->count(),
            'resolved_today' => Reclamation::where('statut', 'résolue')
                                        ->whereDate('date_resolution', today())
                                        ->count(),
            'total_clients' => DB::table('clients')->count(),
        ];

        return response()->json([
            'stats' => $stats,
            'last_updated' => now()->toDateTimeString()
        ]);
    }

    /**
     * List all pending complaints
     */
    public function pendingReclamations(Request $request)
    {
        Gate::authorize('view-pending-reclamations');

        $reclamations = Reclamation::with(['client.personne', 'piecesJointes'])
            ->where('statut', 'en attente')
            ->orderBy('date_reception', 'asc') // Oldest first
            ->paginate(15);

        return response()->json([
            'data' => $reclamations,
            'total_pending' => Reclamation::where('statut', 'en attente')->count()
        ]);
    }

    /**
     * Process/update a complaint
     */
    public function updateReclamation(Request $request, Reclamation $reclamation)
    {
        Gate::authorize('process-reclamation');

        $validated = $request->validate([
            'action' => 'required|in:assign,resolve,reject',
            'admin_id' => 'required_if:action,assign|exists:admins,id',
            'comment' => 'nullable|string|max:500'
        ]);

        return DB::transaction(function () use ($reclamation, $validated) {
            $newStatus = match($validated['action']) {
                'assign' => 'en cours',
                'resolve' => 'résolue',
                'reject' => 'rejetée',
            };

            // Log the change
            HistoriqueReclamation::create([
                'reclamation_id' => $reclamation->id,
                'admin_id' => auth()->id(),
                'ancienne_valeur' => $reclamation->statut,
                'nouvelle_valeur' => $newStatus,
                'commentaire' => $validated['comment'] ?? null,
            ]);

            // Update the reclamation
            $updateData = [
                'statut' => $newStatus,
                'admin_id' => ($validated['action'] === 'assign') ? $validated['admin_id'] : $reclamation->admin_id
            ];

            if ($validated['action'] === 'resolve') {
                $updateData['date_resolution'] = now();
            }

            $reclamation->update($updateData);

            return response()->json([
                'message' => "Réclamation marquée comme {$newStatus}",
                'reclamation' => $reclamation->fresh(['client.personne', 'historiques.admin.personne'])
            ]);
        });
    }

    /**
     * Register a new CLIENT
     */
    public function register(Request $request)
    {
        // Autorisation : seul un admin peut créer un client
        if (!$request->user() || !$request->user()->admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:personnes',
            'telephone' => 'nullable|string|max:20',
            'mot_de_passe' => ['required', Password::defaults()],
            'numero_client' => 'required|string|max:50|unique:clients',
            'adresse' => 'nullable|string|max:255',
            'date_naissance' => 'nullable|date',
        ]);

        return DB::transaction(function () use ($request) {
            $personne = Personne::create([
                'nom' => $request->nom,
                'prenom' => $request->prenom,
                'email' => $request->email,
                'telephone' => $request->telephone,
                'mot_de_passe' => Hash::make($request->mot_de_passe),
            ]);

            Client::create([
                'id' => $personne->id,
                'numero_client' => $request->numero_client,
                'adresse' => $request->adresse,
                'date_naissance' => $request->date_naissance,
                'segment_client' => 'Particulier',
                'created_at' => now()
            ]);

            return response()->json([
                'message' => 'Client créé avec succès',
                'client' => $personne->load('client')
            ], 201);
        });
    }

}