<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\UserModel;
use App\Models\DesiredRoleModel;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

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
    $ROLE_ABILITIES = [
        ["organizer"],
        ["competitor"],
        ["helper"],
        ["guest"],
        ["supporter"]
    ];

    $token = $result->createToken('modellhajo-login-token', array_merge($ROLE_ABILITIES[$result->szerepkor_id-1], $result->isadmin ? ["admin"] : []))->plainTextToken;

    return response()->json([
        "success" => true,
        "user" => $result,
        "access_token" => $token
    ]);
});

Route::middleware("auth:sanctum")->patch('/updateUser/{id}', function ($id, Request $request){
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

Route::middleware("auth:sanctum")->patch('/updatePassword/{id}', function ($id, Request $request) {
    $user = UserModel::find($id);
    if (!$user) {
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

    $user->szerepkor_id = $request->input("szerepkor_id");

    if ($request->input("password") == $request->input("conf_password")){
        $user->jelszo = chr(rand(65, 90)).md5("PasswordSalted".$request->input("password")).chr(rand(65, 90));
    }
    else return response()->json([
        "success" => false,
        "error" => "PASSWORD_MISMATCH"
    ]);
    $user->save();
    return response()->json([
        "success" => true,
        "user" => $user
    ]);
});

Route::middleware("auth:sanctum")->get('/checkAdmin', function (Request $request){
    return $request->user()->isadmin;
});

Route::middleware(["auth:sanctum", "ability:admin"])->get('/getRoleRequests', function (Request $request){
    return response()->json(
        UserModel::with("role")->whereRaw('szerepkor_id <> 4 AND szerepkort_elfogadta IS NULL')->get()
    );
});

Route::middleware(["auth:sanctum", "ability:admin"])->patch('/decideRoleRequest/{verdict}', function ($verdict, Request $request){
    $user = UserModel::find($request->input("id"));
    if($verdict){
        $user->szerepkort_elfogadta = $request->user()->id;
        $user->szerepkor_elfogadva = now();
        $user->save();
    } else {
        $user->szerepkor_id = 4; // vagy valahogy jelenlegi szerepkor utolagos valtas eseten
        $user->save();
    }
    return response()->json([
        "success" => true
    ]);
});
