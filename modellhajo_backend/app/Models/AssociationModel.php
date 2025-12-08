<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssociationModel extends Model
{
    protected $table = 't_egyesulet';
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $fillable = [
        'nev'
    ];
}
