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

Route::patch('/updateUser/{id}', function ($id, Request $request){
    $user = UserModel::find($id);
    if (!$user) {
        return response()->json(['success' => false, 'error' => 'user not found']);
    }
    $user->megjeleno_nev = $request->input("megjeleno_nev");
    $user->felhasznalonev = $request->input("felhasznalonev");
    $user->email = $request->input("email");

    try{
        $user->save();
        return response()->json([
            'success' => true,
            'user' => $user
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e
        ]);
    }
});

Route::patch('/updatePassword/{id}', function ($id, Request $request) {
    $user = UserModel::find($id);
    if (!$user) {
        return response()->json(['success' => false, 'error' => 'user not found']);
    }
    if (rtrim(ltrim($user->jelszo, 1), 1) == md5($request->input("old_password"))){
        if($request->input("new_password") == $request->input("conf_password")){
            $user->jelszo = chr(rand(65, 90)).md5("PasswordSalted".$request->input("new_password")).chr(rand(65, 90));
        }
        else{
        return response()->json([
            'success' => false,
            'error' => "passwords dont match"
        ]);
        }
    }
    else{
        return response()->json([
            'success' => false,
            'error' => "incorrect password"
        ]);
    }
});