<?php

namespace App\Http\Controllers;
use App\Http\Controllers\Controller;
use App\Models\Personne;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    /**
     * Register a new CLIENT only
     */
    public function register(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:personnes',
            'telephone' => 'nullable|string|max:20',
            'mot_de_passe' => ['required', Rules\Password::defaults()],
            'numero_client' => 'required|string|max:50|unique:clients',
            'adresse' => 'nullable|string|max:255',
            'date_naissance' => 'nullable|date',
        ]);

        return DB::transaction(function () use ($request) {
            // Create Personne
            $personne = Personne::create([
                'nom' => $request->nom,
                'prenom' => $request->prenom,
                'email' => $request->email,
                'telephone' => $request->telephone,
                'mot_de_passe' => Hash::make($request->mot_de_passe),
            ]);

            // Create Client record
            Client::create([
                'id' => $personne->id,
                'numero_client' => $request->numero_client,
                'adresse' => $request->adresse,
                'date_naissance' => $request->date_naissance,
                'segment_client' => 'Particulier', // Default value
                'created_at' => now()
            ]);

            // Generate token
            $token = $personne->createToken('auth_token')->plainTextToken;

            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $personne->load('client')
            ], 201);
        });
    }

    /**
     * Handle login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $personne = Personne::where('email', $request->email)->first();

        if (!$personne || !Hash::check($request->password, $personne->mot_de_passe)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $deviceName = 'web-client'; // Default device name

        // Update last login if admin
        if ($personne->admin) {
            $personne->admin->update(['last_login' => now()]);
        }

        // Revoke old tokens
        $personne->tokens()->where('name', $deviceName)->delete();

        // Generate new token
        $token = $personne->createToken($deviceName)->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $personne->load(['client', 'admin'])
        ]);
    }


    /**
     * Get authenticated user
     */
    public function me(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'user' => $user->load(['client', 'admin'])
        ]);
    }

    /**
     * Logout (revoke token)
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => ['required', Rules\Password::defaults(), 'different:current_password']
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->mot_de_passe)) {
            return response()->json([
                'message' => 'Current password is incorrect'
            ], 422);
        }

        $user->update([
            'mot_de_passe' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'message' => 'Password updated successfully'
        ]);
    }
}