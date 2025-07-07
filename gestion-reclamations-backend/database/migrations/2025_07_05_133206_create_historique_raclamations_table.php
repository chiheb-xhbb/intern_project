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
            $table->unsignedBigInteger('reclamation_id');
            $table->unsignedBigInteger('admin_id')->nullable();
            $table->enum('ancienne_valeur', ['en attente', 'en cours', 'résolue', 'rejetée', 'clôturée']);
            $table->enum('nouvelle_valeur', ['en attente', 'en cours', 'résolue', 'rejetée', 'clôturée']);
            $table->text('commentaire')->nullable();
            $table->dateTime('created_at')->default(now());
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
