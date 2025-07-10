<?php

namespace App\Http\Controllers;

use App\Models\PieceJointe;
use App\Models\Reclamation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PieceJointeController extends Controller
{
    /**
     * Upload attachment for a reclamation
     */
    public function upload(Request $request, Reclamation $reclamation)
    {
        Gate::authorize('upload-attachment', $reclamation);

        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx|max:5120', // 5MB max
            'description' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $filename = Str::uuid() . '.' . $extension;
        $path = $file->storeAs('pieces_jointes', $filename, 'private');

        $pieceJointe = PieceJointe::create([
            'reclamation_id' => $reclamation->id,
            'fichier_url' => $path,
            'description' => $request->description ?? $originalName,
            'taille_fichier' => $file->getSize(),
            'type_fichier' => strtoupper($extension),
            'nom_original' => $originalName,
        ]);

        return response()->json([
            'message' => 'File uploaded successfully',
            'attachment' => $pieceJointe
        ], 201);
    }

    /**
     * Download/view an attachment
     */
    public function download(PieceJointe $pieceJointe)
    {
        Gate::authorize('view-attachment', $pieceJointe);

        if (!Storage::disk('private')->exists($pieceJointe->fichier_url)) {
            abort(404, 'File not found');
        }

        $headers = [
            'Content-Type' => $this->getMimeType($pieceJointe->type_fichier),
            'Content-Disposition' => 'attachment; filename="' . $pieceJointe->nom_original . '"',
        ];

        return Response::stream(function() use ($pieceJointe) {
            $stream = Storage::disk('private')->readStream($pieceJointe->fichier_url);
            fpassthru($stream);
            fclose($stream);
        }, 200, $headers);
    }

    /**
     * Preview an attachment (inline)
     */
    public function preview(PieceJointe $pieceJointe)
    {
        Gate::authorize('view-attachment', $pieceJointe);

        if (!Storage::disk('private')->exists($pieceJointe->fichier_url)) {
            abort(404, 'File not found');
        }

        $headers = [
            'Content-Type' => $this->getMimeType($pieceJointe->type_fichier),
            'Content-Disposition' => 'inline; filename="' . $pieceJointe->nom_original . '"',
        ];

        return Response::stream(function() use ($pieceJointe) {
            $stream = Storage::disk('private')->readStream($pieceJointe->fichier_url);
            fpassthru($stream);
            fclose($stream);
        }, 200, $headers);
    }

    /**
     * Delete an attachment
     */
    public function destroy(PieceJointe $pieceJointe)
    {
        Gate::authorize('delete-attachment', $pieceJointe);

        DB::transaction(function () use ($pieceJointe) {
            Storage::disk('private')->delete($pieceJointe->fichier_url);
            $pieceJointe->delete();
        });

        return response()->json([
            'message' => 'Attachment deleted successfully'
        ]);
    }

    /**
     * Get all attachments for a reclamation
     */
    public function index(Reclamation $reclamation)
    {
        Gate::authorize('view-reclamation-attachments', $reclamation);

        return response()->json([
            'data' => $reclamation->piecesJointes()->orderBy('uploaded_at', 'desc')->get()
        ]);
    }

    /**
     * Helper to get MIME type from file extension
     */
    private function getMimeType(string $extension): string
    {
        return match(strtolower($extension)) {
            'pdf' => 'application/pdf',
            'jpg', 'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls' => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            default => 'application/octet-stream',
        };
    }
}