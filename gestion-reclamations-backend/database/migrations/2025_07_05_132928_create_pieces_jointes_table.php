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
        Schema::create('pieces_jointes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reclamation_id');
            $table->string('fichier_url');
            $table->string('description')->nullable();
            $table->float('taille_fichier');
            $table->enum('type_fichier', ['PDF', 'JPEG', 'PNG', 'DOC', 'Autre'])->default('Autre');
            $table->dateTime('uploaded_at')->default(now());
            $table->timestamps();

            $table->foreign('reclamation_id')->references('id')->on('reclamations')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pieces_jointes');
    }
};
