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
        'gps_lat',
        'gps_lon',
        'szervezo_egyesulet',
        'leiras',
        'nevezesi_dij_junior',
        'nevezesi_dij_normal',
        'kep_url',
        'kep_fajlnev'
    ];

    public function categories()
    {
        return $this->hasMany(CompetitionCategoryModel::class, 'versenyid', 'id');
    }

    public function entries()
    {
        return $this->hasMany(CompetitionEntryModel::class, 'versenyid', 'id');
    }
}
