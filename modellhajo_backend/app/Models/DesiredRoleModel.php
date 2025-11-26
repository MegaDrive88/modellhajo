<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Model;
use App\Models\UserModel;
use App\Models\RoleModel;

class DesiredRoleModel extends Model
{
    protected $table = 't_kivant_szerepkor';
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $fillable = [
        'felhasznalo_id',
        'kivant_szerepkor_id'
    ];
    public function user(){
        return $this->belongsTo(UserModel::class, 'felhasznalo_id', 'id');
    }
    public function desired_role(){
        return $this->belongsTo(RoleModel::class, 'kivant_szerepkor_id', 'id');
    }
}
