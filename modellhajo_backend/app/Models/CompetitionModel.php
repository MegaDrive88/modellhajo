<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompetitionModel extends Model
{
    protected $table = 't_verseny';
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $fillable = [
        'letrehozo_id',
        'kezdet',
        'veg',
        'nev',
        'evszam',
        'helyszin',
        'megjelenik',
        'nevezesi_hatarido',
        'gps_x',
        'gps_y',
        'szervezo_egyesulet',
        'leiras',
        'nevezesi_dij_junior',
        'nevezesi_dij_normal',
        'nevezesi_dij_senior',
        'kep_url',
        'kep_fajlnev'
    ];
}
