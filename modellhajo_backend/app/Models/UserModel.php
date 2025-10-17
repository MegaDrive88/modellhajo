<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserModel extends Model
{
    protected $table = 't_felhasznalok';
    protected $fillable = [
        'felhasznalonev',
        'email',
        'jelszo',
        'megjeleno_nev'
    ];
}
