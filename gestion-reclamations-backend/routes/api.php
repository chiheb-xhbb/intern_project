<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ReclamationController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CompteBancaireController;
use App\Http\Controllers\PieceJointeController;

Route::get('/test-api', function () {
    return response()->json(['message' => 'API OK']);
});

// AUTH
Route::post('/login', [AuthController::class, 'login']);//done

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);//done
    Route::post('/logout', [AuthController::class, 'logout']);//done
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Clients
    Route::get('/clients', [ClientController::class, 'index']);//done
    Route::get('/clients/{client}', [ClientController::class, 'show']);
    Route::put('/clients/{client}', [ClientController::class, 'update']);
    Route::get('/clients/{client}/comptes', [ClientController::class, 'comptes']);//done
    Route::get('/clients/{client}/reclamations', [ClientController::class, 'reclamations']);

    // Réclamations
    Route::get('/reclamations', [ReclamationController::class, 'index']);//done
    Route::get('/reclamations/mine', [ReclamationController::class, 'clientReclamations']);//done
    Route::post('/reclamations', [ReclamationController::class, 'store']);//done
    Route::get('/reclamations/{reclamation}', [ReclamationController::class, 'show']);//done
    Route::put('/reclamations/{reclamation}/statut', [ReclamationController::class, 'updateStatus']);
    Route::delete('/reclamations/{reclamation}', [ReclamationController::class, 'destroy']);

    // Admin
    Route::post('/register', [AdminController::class, 'register']);//done
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/admin/pending', [AdminController::class, 'pendingReclamations']);
    Route::put('/admin/reclamations/{reclamation}', [AdminController::class, 'updateReclamation']);

    // Comptes bancaires
    Route::post('/comptes', [CompteBancaireController::class, 'store']);//done
    Route::get('/comptes', [CompteBancaireController::class, 'index']);//done
    Route::get('/comptes/{compteBancaire}', [CompteBancaireController::class, 'show']);//done
    Route::get('/comptes/client/{client_id}', [CompteBancaireController::class, 'showByClient']);//done
    Route::get('/comptes/search', [CompteBancaireController::class, 'search']);

    // Pièces jointes
    Route::post('/reclamations/{reclamation}/upload', [PieceJointeController::class, 'upload']);
    Route::get('/pieces/{piece}', [PieceJointeController::class, 'download']);
});
