<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->string('numero_client')->unique();
            $table->string('adresse')->nullable();
            $table->date('date_naissance')->nullable();
            $table->enum('segment_client', ['Particulier', 'PME', 'Entreprise', 'VIP'])->default('Particulier')->nullable();
            $table->foreign('id')->references('id')->on('personnes')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
