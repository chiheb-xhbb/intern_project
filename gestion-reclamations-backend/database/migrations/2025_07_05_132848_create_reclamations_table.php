<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('reclamations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('client_id');
            $table->unsignedBigInteger('admin_id')->nullable();
            $table->enum('type_reclamation', ['Carte bloquée', 'Erreur de virement', 'Retard crédit', 'Autre']);
            $table->enum('canal', ['email', 'téléphone', 'agence', 'application_web']);
            $table->text('description');
            $table->dateTime('date_reception')->default(now());
            $table->dateTime('date_resolution')->nullable();
            $table->enum('statut', ['en attente', 'en cours', 'résolue', 'rejetée', 'clôturée'])->default('en attente');
            $table->timestamps();

            $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');
            $table->foreign('admin_id')->references('id')->on('admins')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reclamations');
    }
};
