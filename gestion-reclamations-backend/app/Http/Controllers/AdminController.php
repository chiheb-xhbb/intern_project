<?php

namespace App\Http\Controllers;

use App\Models\Reclamation;
use App\Models\HistoriqueReclamation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

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
}