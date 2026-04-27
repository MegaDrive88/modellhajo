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
        'szerepkor_elfogadva',
        'isadmin',
        'egyesulet'
    ];
    public function role(){
        return $this->belongsTo(RoleModel::class, 'szerepkor_id', 'id');
    }

    public static function createLegacyPasswordHash(string $rawPassword): string
    {
        return chr(rand(65, 90)).md5('PasswordSalted'.$rawPassword).chr(rand(65, 90));
    }

    public static function matchesLegacyPassword(string $rawPassword, string $storedHash): bool
    {
        return substr($storedHash, 1, -1) === md5('PasswordSalted'.$rawPassword);
    }
}
