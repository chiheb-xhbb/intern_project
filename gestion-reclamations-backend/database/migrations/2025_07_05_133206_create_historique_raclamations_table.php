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
        Schema::create('historique_reclamations', function (Blueprint $table) {
            $table->id();
            
            // Références à d'autres tables
            $table->unsignedBigInteger('reclamation_id');
            $table->unsignedBigInteger('admin_id')->nullable();
    
            // Enums
            $table->enum('ancienne_valeur', ['en attente', 'en cours', 'résolue', 'rejetée', 'clôturée']);
            $table->enum('nouvelle_valeur', ['en attente', 'en cours', 'résolue', 'rejetée', 'clôturée']);
    
            // Champ optionnel
            $table->text('commentaire')->nullable();
    
            // Date de création avec valeur par défaut
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
    
            // Contraintes de clés étrangères
            $table->foreign('reclamation_id')->references('id')->on('reclamations')->onDelete('cascade');
            $table->foreign('admin_id')->references('id')->on('admins')->onDelete('set null');
        });
    }
    

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historique_reclamations');
    }
};
