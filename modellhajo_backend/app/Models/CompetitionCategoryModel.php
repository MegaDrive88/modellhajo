<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompetitionCategoryModel extends Model
{
    protected $table = 't_verseny_kategoriak';
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $fillable = [
        'versenyid',
        'kategoriaid'
    ];
}
