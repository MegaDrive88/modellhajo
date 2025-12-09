<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CategoryModel extends Model
{
    protected $table = 't_kategoria';
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $fillable = [
        'nev'
    ];
}
