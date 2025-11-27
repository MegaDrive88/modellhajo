<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class UserModel extends Authenticatable
{
    use HasApiTokens;
    protected $table = 't_felhasznalok';
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $fillable = [
        'felhasznalonev',
        'email',
        'jelszo',
        'megjeleno_nev',
        'mmsz_id',
        'szerepkort_elfogadta',
        'szerepkor_elfogadva'
    ];
    public function role(){
        return $this->belongsTo(RoleModel::class, 'szerepkor_id', 'id');
    }
}
