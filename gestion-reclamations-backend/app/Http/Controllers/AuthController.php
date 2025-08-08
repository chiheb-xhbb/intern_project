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
                'message' => 'Invalid email or password'
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
                'message' => ' Le mot de passe actuel est incorrect'
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