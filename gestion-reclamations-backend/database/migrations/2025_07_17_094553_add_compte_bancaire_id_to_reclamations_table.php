<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('reclamations', function (Blueprint $table) {
            $table->foreignId('compte_bancaire_id')
                ->nullable()
                ->constrained('comptes_bancaires')
                ->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('reclamations', function (Blueprint $table) {
            $table->dropForeign(['compte_bancaire_id']);
            $table->dropColumn('compte_bancaire_id');
        });
    }
};
