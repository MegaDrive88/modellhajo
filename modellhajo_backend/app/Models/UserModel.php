<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class UserModel extends Authenticatable
{
    use HasApiTokens;
    protected $table = 't_felhasznalok';
    public $timestamps = false;
    protected $fillable = [
        'felhasznalonev',
        'email',
        'jelszo',
        'megjeleno_nev'
    ];
}
