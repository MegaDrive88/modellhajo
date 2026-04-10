<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Email extends Model
{
    protected $table = 't_emailek';

    public $timestamps = false;

    protected $fillable = [
        'felado_email',
        'cimzett_email',
        'targy',
        'tartalom_html',
        'letrehozva',
        'elkuldve'
    ];
}
