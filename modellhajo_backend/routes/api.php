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
    $result = UserModel::where($isEmail ? 'email' : 'felhasznalonev', $user)->whereRaw(
        "REGEXP_LIKE(jelszo, '^[A-Z]".$pwdhash."[A-Z]$')"
    )->get();
    return response()->json($result);
});