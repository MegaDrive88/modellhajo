<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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