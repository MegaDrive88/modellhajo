<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\CompetitionModel;


class CompetitionEntryModel extends Model
{
    protected $table = 't_nevezes';
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $fillable = [
        'versenyzoid',
        'kategoriaid',
        'versenyid',
        'egyesulet',
        'rajtszam',
    ];
    public function competition()
    {
        return $this->belongsTo(CompetitionModel::class, 'versenyid', 'id');
    }

    public function competitor()
    {
        return $this->belongsTo(UserModel::class, 'versenyzoid', 'id');
    }

    public function category()
    {
        return $this->belongsTo(CategoryModel::class, 'kategoriaid', 'id');
    }
}
