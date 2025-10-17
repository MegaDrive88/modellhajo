<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\UserModel;

Route::get('/',function () {
    return response()->json([
        'status' => 'ok',
    ]);
});

Route::get('/hello/{name}',function ($name) {
    return response()->json([
        "message" => "Hello, ".$name
    ]);
});

Route::get('/login/{user}/{isEmail}/{pwdhash}',function ($user, $isEmail, $pwdhash) {
    $column = $isEmail == "true" ? 'email' : 'felhasznalonev';
    $result = UserModel::where($column, $user)->whereRaw(
        "REGEXP_LIKE(jelszo, '^[A-Z]".$pwdhash."[A-Z]$')"
    )->take(1)->get();
    if (count($result) == 0){
         return response()->json([
            "success" => false,
        ]);
    }
    return response()->json([
        "success" => true,
        "user" => $result[0]
    ]);
});