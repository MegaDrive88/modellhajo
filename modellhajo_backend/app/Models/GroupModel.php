<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GroupModel extends Model
{
    protected $table = 't_csoport';
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $fillable = [
        'versenyid',
        'kategoriaid',
        'sorszam',
        'junior',
    ];
}
