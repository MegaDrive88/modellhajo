<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Model;

class RoleModel extends Model
{
    protected $table = 't_szerepkorok';
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $fillable = [
        'szerepkor_nev'
    ];
}
