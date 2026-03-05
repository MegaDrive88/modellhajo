<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompetitionRegistryModel extends Model
{
    protected $table = 't_nevezes';
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $fillable = [
        'versenyzoid',
        'kategoriaid',
        'versenyid',
    ];
}
