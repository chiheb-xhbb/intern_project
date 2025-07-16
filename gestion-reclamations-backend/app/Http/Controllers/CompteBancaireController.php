<?php

namespace App\Http\Controllers;

use App\Models\CompteBancaire;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CompteBancaireController extends Controller
{
    /**
     * Lister les comptes d'un client (pour ses réclamations)
     */
    public function index(Request $request)
    {
        // Pour les clients: seulement leurs propres comptes
        if ($request->user()->client) {
            return response()->json([
                'data' => $request->user()->client->comptes()
                    ->orderBy('date_ouverture', 'desc')
                    ->get()
            ]);
        }

        // Pour les admins: tous les comptes avec filtre client
        Gate::authorize('viewAny', CompteBancaire::class);

        $query = CompteBancaire::with('client.personne');

        if ($request->has('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        return response()->json([
            'data' => $query->paginate(20)
        ]);
    }

    /**
     * Détails d'un compte (pour association avec réclamation)
     */
    public function show(CompteBancaire $compteBancaire)
    {
        Gate::authorize('view', $compteBancaire);

        return response()->json([
            'compte' => $compteBancaire->only([
                'id', 
                'numero_compte',
                'type_compte',
                'date_ouverture'
            ]),
            'client' => $compteBancaire->client->personne->only([
                'nom',
                'prenom',
                'numero_client'
            ])
        ]);
    }

    /**
     * Recherche de comptes (pour association avec réclamation)
     */
    public function search(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:3'
        ]);

        Gate::authorize('search', CompteBancaire::class);

        return CompteBancaire::with('client.personne')
            ->where('numero_compte', 'like', '%'.$request->query.'%')
            ->orWhereHas('client.personne', function($q) use ($request) {
                $q->where('nom', 'like', '%'.$request->query.'%')
                  ->orWhere('prenom', 'like', '%'.$request->query.'%');
            })
            ->limit(10)
            ->get()
            ->map(function($compte) {
                return [
                    'id' => $compte->id,
                    'numero_compte' => $compte->numero_compte,
                    'type_compte' => $compte->type_compte,
                    'client' => $compte->client->personne->only(['nom', 'prenom'])
                ];
            });
    }

    /**
     * Créer un nouveau compte bancaire
     */
    // Autorisation : seul un admin peut créer un compte
    public function store(Request $request)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'numero_compte' => 'required|string|max:50|unique:comptes_bancaires',
            'type_compte' => 'required|in:Compte courant,Compte épargne,Compte professionnel,Compte joint',
            'date_ouverture' => 'nullable|date'
        ]);

        $compte = CompteBancaire::create([
            'client_id' => $request->client_id,
            'numero_compte' => $request->numero_compte,
            'type_compte' => $request->type_compte,
            'date_ouverture' => $request->date_ouverture // Add this line
        ]);

        return response()->json([
            'message' => 'Compte bancaire créé avec succès',
            'compte' => $compte->load('client.personne')
        ], 201);
    }
    


}