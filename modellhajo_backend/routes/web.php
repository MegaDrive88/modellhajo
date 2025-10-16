<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    response()->json(['status' => 'ok']);
});
