<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuItemModel extends Model
{
    protected $table = 't_szerepkor_menuitems';
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $fillable = [
        'szerepkor_id',
        'menuitem_nev'
    ];
}
