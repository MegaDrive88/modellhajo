<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\UserModel;

// $output = new Symfony\Component\Console\Output\ConsoleOutput();


Route::get('/',function () {
    return response()->json([
        'status' => 'ok',
    ]);
});

// Route::get('/hello/{name}',function ($name) {
//     return response()->json([
//         "message" => "Hello, ".$name
//     ]);
// });

Route::post('/login', function (Request $request) {
    $column = $request->input("isEmail") ? 'email' : 'felhasznalonev';
    $result = UserModel::where($column, $request->input("user"))->whereRaw(
        "REGEXP_LIKE(jelszo, '^[A-Z]".$request->input("pwdHash")."[A-Z]$')"
    )->first();
    if (!$result){
         return response()->json([
            "success" => false,
            "error" => "LOGIN_FAILED"
        ]);
    }
    $token = $result->createToken('login-token', ["test11111"])->plainTextToken; // switch case
    //adatbazisba teszi
    return response()->json([
        "success" => true,
        "user" => $result,
        "access_token" => $token
    ]);
});

Route::patch('/updateUser/{id}', function ($id, Request $request){
    $user = UserModel::find($id);
    if (!$user) {
        return response()->json(['success' => false, 'error' => 'USER_NOT_FOUND']);
    }
    if($request->input("megjeleno_nev") == "" || $request->input("felhasznalonev") == "" || $request->input("email") == ""){
        return response()->json(['success' => false, 'error' => 'EMPTY_FIELD']);
    }
    $user->megjeleno_nev = $request->input("megjeleno_nev");
    $users = UserModel::select("felhasznalonev")->where('id', '<>', $user->id)->pluck('felhasznalonev')->toArray(); //kulon func
    if (!in_array($request->input("felhasznalonev"), $users)) {
        $user->felhasznalonev = $request->input("felhasznalonev");
    }
    else{
        return response()->json([
            "success" => false,
            "error" => "USERNAME_NOT_UNIQUE"
        ]);
    }
    $emails = UserModel::select("email")->where('id', '<>', $user->id)->pluck('email')->toArray();
    if (!in_array($request->input("email"), $emails)) {
        $user->email = $request->input("email");
    }
    else{
        return response()->json([
            "success" => false,
            "error" => "EMAIL_NOT_UNIQUE"
        ]);
    }
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
    if (!$user) { // token integ
        return response()->json(['success' => false, 'error' => 'USER_NOT_FOUND']);
    }
    if($request->input("old_password") == "" || $request->input("new_password") == "" || $request->input("conf_password") == ""){
        return response()->json(['success' => false, 'error' => 'EMPTY_FIELD']);
    }
    if (substr($user->jelszo, 1, -1) == md5("PasswordSalted".$request->input("old_password"))){
        if($request->input("new_password") == $request->input("conf_password")){
            if(!($request->input("new_password") == $request->input("old_password")))
                $user->jelszo = chr(rand(65, 90)).md5("PasswordSalted".$request->input("new_password")).chr(rand(65, 90));
            else{
                return response()->json([
                    'success' => false,
                    'error' => "PASSWORD_NOT_NEW"
                ]);
            }
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
        }
        else{
        return response()->json([
            'success' => false,
            'error' => "PASSWORD_MISMATCH"
        ]);
        }
    }
    else{
        return response()->json([
            'success' => false,
            'error' => "INCORRECT_PASSWORD"
        ]);
    }
});

Route::post('/createAccount', function (Request $request){
    $user = new UserModel();
    if($request->input("felhasznalonev") == "" || $request->input("megjeleno_nev") == "" || $request->input("email") == "" || $request->input("password") == "" || $request->input("conf_password") == "")
        return response()->json([
            "success" => false,
            "error" => "EMPTY_FIELD"
        ]);

    $users = UserModel::select("felhasznalonev")->pluck('felhasznalonev')->toArray();
    if (!in_array($request->input("felhasznalonev"), $users)) {
        $user->felhasznalonev = $request->input("felhasznalonev");
    }
    else{
        return response()->json([
            "success" => false,
            "error" => "USERNAME_NOT_UNIQUE"
        ]);
    }
    $user->megjeleno_nev = $request->input("megjeleno_nev");

    $emails = UserModel::select("email")->pluck('email')->toArray();
    if (!in_array($request->input("email"), $emails)) {
        $user->email = $request->input("email");
    }
    else{
        return response()->json([
            "success" => false,
            "error" => "EMAIL_NOT_UNIQUE"
        ]);
    }

    $user->szerepkor_id = 4;

    if ($request->input("password") == $request->input("conf_password")){
        $user->jelszo = chr(rand(65, 90)).md5("PasswordSalted".$request->input("password")).chr(rand(65, 90));
        $user->save();
        return response()->json([
            "success" => true,
            "user" => $user
        ]);
    }
    else return response()->json([
        "success" => false,
        "error" => "PASSWORD_MISMATCH"
    ]);
});


Route::middleware('auth:sanctum')->get('/testtt', function (Request $request) {

    // $request->validate([
    //     'email' => 'required|email',
    //     'password' => 'required',
    // ]);
    return response()->json([
        'success' => true
    ]);
});
//middleware(['auth:api', 'scopes:test'])->
//middleware('auth:sanctum')->