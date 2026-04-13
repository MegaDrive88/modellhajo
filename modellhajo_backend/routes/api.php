<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\UserModel; 
use App\Models\RoleModel;
use App\Models\AssociationModel;
use App\Models\Email;
use App\Models\CompetitionModel;
use App\Models\MenuItemModel;
use App\Models\CompetitionCategoryModel;
use App\Models\CategoryModel;
use App\Models\CompetitionEntryModel;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

// $output = new Symfony\Component\Console\Output\ConsoleOutput();


Route::get('/',function () {
    return response()->json([
        'status' => 'ok',
    ]);
});

$queuePasswordResetEmail = function (UserModel $user, string $token): void {
    $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:4200'), '/');
    $resetUrl = $frontendUrl.'/reset_password?token='.urlencode($token).'&email='.urlencode($user->email);

    $email = Email::create([
        'cimzett_email' => $user->email,
        'targy' => 'Modellhajó - Elfelejtett jelszó',
        'tartalom_html' => htmlspecialchars(
            '<p>Kedves '.e($user->megjeleno_nev).'!</p>' .
            '<p>Jelszó-visszaállítási kérelmet kaptunk a fiókjához.</p>' .
            '<p>A jelszó visszaállításához kattintson az alábbi linkre:</p>' .
            '<p><a href="'.e($resetUrl).'">Jelszó visszaállítása</a></p>' .
            '<p>Ha nem Ön kezdeményezte ezt a kérést, hagyja figyelmen kívül ezt az e-mailt.</p>'
        ),
        'letrehozva' => now(),
        'elkuldve' => null,
    ]);

    Notification::route('mail', $user->email)
        ->notify(new ResetPasswordNotification($user->megjeleno_nev, $resetUrl));

    $email->update(['elkuldve' => now()]);
};


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
        return response()->json(['success' => false, 'error' => 'USER_NOT_FOUND'], 404);
    }
    if($request->input("megjeleno_nev") == "" || $request->input("felhasznalonev") == "" || $request->input("email") == ""){
        return response()->json(['success' => false, 'error' => 'EMPTY_FIELD'], 400);
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
    if($request->input("mmsz_id") !== null && $request->input("mmsz_id") != ""){
        $mmszids = UserModel::select("mmsz_id")->where('id', '<>', $user->id)->pluck('mmsz_id')->toArray();
        if (!in_array($request->input("mmsz_id"), $mmszids)) {
            $user->mmsz_id = $request->input("mmsz_id");
        }
        else{
            return response()->json([
                "success" => false,
                "error" => "MMSZID_NOT_UNIQUE"
            ]);
        }
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
        ], 400);
    }
});

Route::middleware("auth:sanctum")->patch('/updatePassword/{id}', function ($id, Request $request) {
    $user = UserModel::find($id);
    if (!$user) {
        return response()->json(['success' => false, 'error' => 'USER_NOT_FOUND'], 404);
    }
    if($request->input("old_password") == "" || $request->input("new_password") == "" || $request->input("conf_password") == ""){
        return response()->json(['success' => false, 'error' => 'EMPTY_FIELD'], 400);
    }
    if (substr($user->jelszo, 1, -1) == md5("PasswordSalted".$request->input("old_password"))){
        if($request->input("new_password") == $request->input("conf_password")){
            if(!($request->input("new_password") == $request->input("old_password")))
                $user->jelszo = chr(rand(65, 90)).md5("PasswordSalted".$request->input("new_password")).chr(rand(65, 90));
            else{
                return response()->json([
                    'success' => false,
                    'error' => "PASSWORD_NOT_NEW"
                ], 400);
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
                ], 400);
            }
        }
        else{
        return response()->json([
            'success' => false,
            'error' => "PASSWORD_MISMATCH"
        ], 400);
        }
    }
    else{
        return response()->json([
            'success' => false,
            'error' => "INCORRECT_PASSWORD"
        ], 400);
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
    $user->mmsz_id = $request->input("mmszid"); // unique ez is..

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

Route::post('/forgotPassword', function (Request $request) use ($queuePasswordResetEmail) {
    $request->validate([
        'email' => 'required|email',
    ]);

    $normalizedEmail = mb_strtolower(trim((string) $request->input('email')));
    $user = UserModel::whereRaw('LOWER(email) = ?', [$normalizedEmail])->first();

    if (!$user) {
        return response()->json([
            'success' => false,
            'error' => 'USER_NOT_FOUND',
        ], 404);
    }

    $token = Str::random(64);
    $table = config('auth.passwords.users.table', 'password_reset_tokens');

    DB::table($table)->updateOrInsert(
        ['email' => $user->email],
        [
            'token' => Hash::make($token),
            'created_at' => now(),
        ]
    );

    $queuePasswordResetEmail($user, $token);

    return response()->json([
        'success' => true,
        'message' => 'Elküldtük a visszaállító linket.',
    ]);
});

Route::post('/resetPassword', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'token' => 'required|string',
        'new_password' => 'required|string',
        'conf_password' => 'required|string',
    ]);

    if ($request->input('new_password') !== $request->input('conf_password')) {
        return response()->json([
            'success' => false,
            'error' => 'PASSWORD_MISMATCH',
        ], 400);
    }

    $table = config('auth.passwords.users.table', 'password_reset_tokens');
    $tokenRow = DB::table($table)->where('email', $request->input('email'))->first();

    if (!$tokenRow) {
        return response()->json([
            'success' => false,
            'error' => 'INVALID_OR_EXPIRED_TOKEN',
        ], 400);
    }

    $expiryInMinutes = (int) config('auth.passwords.users.expire', 60);
    $expired = !$tokenRow->created_at || Carbon::parse($tokenRow->created_at)->addMinutes($expiryInMinutes)->isPast();

    if ($expired || !Hash::check($request->input('token'), $tokenRow->token)) {
        if ($expired) {
            DB::table($table)->where('email', $request->input('email'))->delete();
        }

        return response()->json([
            'success' => false,
            'error' => 'INVALID_OR_EXPIRED_TOKEN',
        ], 400);
    }

    $user = UserModel::where('email', $request->input('email'))->first();

    if (!$user) {
        return response()->json([
            'success' => false,
            'error' => 'INVALID_OR_EXPIRED_TOKEN',
        ], 400);
    }

    $user->jelszo = chr(rand(65, 90)).md5('PasswordSalted'.$request->input('new_password')).chr(rand(65, 90));
    $user->save();

    DB::table($table)->where('email', $request->input('email'))->delete();

    return response()->json([
        'success' => true,
    ]);
});

Route::middleware("auth:sanctum")->get('/checkAdmin', function (Request $request){
    return $request->user()->isadmin;
});

Route::middleware(["auth:sanctum", "ability:admin"])->get('/getRoleRequests', function (Request $request){
    return response()->json(
        UserModel::with("role")->whereRaw('szerepkor_id = 1 AND szerepkort_elfogadta IS NULL')->get()
    );
});

Route::middleware(["auth:sanctum", "ability:admin"])->patch('/decideRoleRequest/{verdict}', function ($verdict, Request $request){
    $user = UserModel::find($request->input("id"));
    if($verdict){
        $user->szerepkort_elfogadta = $request->user()->id;
        $user->szerepkor_elfogadva = now();
        $user->save();
    } else {
        $user->szerepkor_id = 4;
        $user->save();
    }
    return response()->json([
        "success" => true
    ]);
});

Route::middleware(["auth:sanctum"])->get('checkTokenExpired', function (Request $request){
    return true;
});

Route::middleware(["auth:sanctum", "ability:organizer"])->post('/uploadCompetitionThumbnail', function (Request $request) {
    $path = $request->file('thumbnail')->store('thumbnails', 'public');
    $url = Storage::url($path);
    return response()->json([
        'success' => true,
        'path' => $path, // /storage/thumbnails/...
        'url' => $url, // thumbnails/..
        'filename' => basename($path), // xyz.png, valami hash
    ]);
});

Route::middleware(["auth:sanctum", "ability:organizer"])->post('/createCompetition', function (Request $request){
    $evszam = $request->input("evszam");
    if ($request->input("evszam") == ""){
        $evszam = explode('-', $request->input("kezdet"))[0];
    }
    $data = $request->validate([
        'nev' => 'required',
        'helyszin' => 'required',
        'nevezesi_dij_junior' => 'required|min:0',
        'nevezesi_dij_normal' => 'required|min:0',
        'szervezo_egyesulet' => 'min:1',
    ]);
    $competition = CompetitionModel::create([
        ...$request->all(),
        'evszam' => $evszam,
        'letrehozo_id' => $request->user()->id,
    ]);
    return response()->json([
        'success' => true,
        'compId' => $competition->id
    ]);
});

Route::get('/getAssociationsAndCategories', function (){
    return response()->json([
        'success' => true,
        'associations' => cache()->remember('associations', 3600, fn() => AssociationModel::all()),
        'categories' => cache()->remember('categories', 3600, fn() => CategoryModel::all()),
    ]);
});

Route::get('/getAllCompetitions', function (Request $request){
    return response()->json([
        'success' => true,
        'data' => CompetitionModel::all()
    ]);
});

Route::middleware(["auth:sanctum", "ability:organizer"])->get('/getUserCompetitions', function (Request $request){
    return response()->json([
        'success' => true,
        'data' => CompetitionModel::where('letrehozo_id', '=', $request->user()->id)->get()
    ]);
});

Route::get('/getCompetition/{id}', function ($id, Request $request){
    if(CompetitionModel::where('id', '=', $id)->get()->count() != 0)
        return response()->json([
            'success' => true,
            'data' => CompetitionModel::where('id', '=', $id)->first()
        ]);
    return response()->json([
        'success' => false,
        'error' => 'NO_SUCH_COMPETITION'
    ], 404);
});

Route::middleware(["auth:sanctum", "ability:organizer"])->post('/createCompetitionCategories', function (Request $request){
    $compid = $request->input("compId");
    foreach ($request->input("categs") as $value) {
        CompetitionCategoryModel::create([
            'versenyid' => $compid,
            'kategoriaid' => $value
        ]);
    }
    return response()->json([
        'success' => true,
    ]);
});

Route::get('/getCompetitionCategories', function (Request $request){
    return response()->json([
        'success' => true,
        'categories' => CompetitionCategoryModel::with("category")->get()
    ]);
});

Route::middleware(["auth:sanctum", "ability:organizer"])->delete('/deleteCompetition/{compid}', function ($compid, Request $request){
    CompetitionCategoryModel::where('versenyid', '=', $compid)->delete();
    CompetitionModel::find($compid)->delete();
    return response()->json([
        'success' => true,
    ]);
});

Route::middleware(["auth:sanctum"])->get('/getMenuItems', function (Request $request){
    $roleId = 4;
    if($request->user()->szerepkor_id == 1){
        if($request->user()->szerepkor_elfogadva) $roleId = 1;
    }
    else $roleId = $request->user()->szerepkor_id;
    $data = MenuItemModel::where('szerepkor_id', '=', $roleId)->get(); 
    return response()->json([
        'success' => true,
        'items' => $data
    ]);
});

Route::post('/logout', function (Request $request) {
    $request->user()->currentAccessToken()->delete();
    return response()->json([
        "success" => true
    ]);
})->middleware('auth:sanctum'); // unauthorized, ha lejar a token -- kitorolni manually

// , 'ability:competitor,supporter'
Route::middleware(['auth:sanctum', 'abilities:competitor,supporter'])->
post('/enterCompetition/{id}', function ($id, Request $request) {
    $assoc = $request->input("assocId") == -1 ? null : $request->input("assocId");
    $skip = [];
    $request->user()->mmsz_id = $request->input("mmszid");
    $request->user()->save();
    foreach ($request->input("entry") as $cat) {
        if (CompetitionEntryModel::whereRaw("versenyzoid = ".$request->user()->id." AND kategoriaid = ".$cat." AND versenyid = ".$id)->get()->count() != 0){
            array_push($skip, $cat);
            continue;
        }
        $registry = new CompetitionEntryModel();
        $registry->versenyzoid = $request->user()->id;
        $registry->kategoriaid = $cat;
        $registry->versenyid = $id;
        $registry->egyesulet = $assoc;
        $registry->save();
    }
    return response()->json([
        'success' => true,
        'skipped' => $skip,
        'delta' => count($request->input("entry")) - count($skip)
    ], 201);
});
Route::middleware(['auth:sanctum', 'abilities:competitor,supporter'])->get('/getEntriesByUserId/{id}', function($id){
    $my_entries = CompetitionEntryModel::where("versenyzoid", $id)->orderBy('versenyid', 'desc')->get()->groupBy('versenyid');
    return response()->json([
        'success' => true,
        'entries' => $my_entries
    ]);
});

Route::middleware(['auth:sanctum', 'abilities:organizer'])->get('/getEntriesByOrganizerId', function(Request $request){
    $entries = CompetitionEntryModel::whereHas('competition', function ($query) use ($request) {
        $query->where('letrehozo_id', $request->user()->id);
    })->orderBy('versenyid', 'desc')->get()->groupBy('versenyid');
    //vagy hozza van adva az illeto rendezokent -- uj felvetelnel/szerkesztesnel lehessen megadni, szerkeszteni csak a letrehozo tudjon
    return response()->json([
        'success' => true,
        'entries' => $entries
    ]);
});

Route::get('/getEntriesByCompetitionId/{id}', function($id){
    $entries = CompetitionEntryModel::whereHas('competition', function ($query) use($id) {
        $query->where('versenyid', $id);
    })->get()->groupBy('versenyid');
    return response()->json([
        'success' => true,
        'entries' => $entries
    ]);
});

Route::middleware(['auth:sanctum', 'abilities:competitor,supporter,organizer'])->delete('/cancelEntry/{id}', function($id, Request $request){
//csak sajatot -- tobbi vegpontnal is lehet problema? -- verseny torlesenel majd az osszes rendezo kozott kell lennie
//ugy is lesz backend rework
//nevezesi hataridot nezni
    $entry = CompetitionEntryModel::where("id", $id)->first();
    if (!$entry){
        return response()->json([
            'success' => false,
            'error' => "No such entry"
        ]);
    }
    // if ($entry->versenyzoid != $request->user()->id){
    //     return response()->json(['success' => false, 'error' => "Competitor ID-s do not match"], 403);
    // }
    // organizer miatt commentelve
    $entry->delete();
    return response()->json([
        'success' => true,
    ]);
});

Route::middleware(["auth:sanctum"])->get('/getCompetitors', function (Request $request){
    return response()->json([
        'success' => true,
        'competitors' => UserModel::where("szerepkor_id", 2)->get()
    ]);
});

// Route::middleware(["auth:sanctum", "ability:organizer"])->put('/editCompetition/{id}', function ($id, Request $request){
//     $evszam = $request->input("evszam");
//     if ($request->input("evszam") == ""){
//         $evszam = explode('-', $request->input("kezdet"))[0];
//     }
//     $data = $request->validate([
//         'nev' => 'required',
//         'helyszin' => 'required',
//         'nevezesi_dij_junior' => 'required|min:0',
//         'nevezesi_dij_normal' => 'required|min:0',
//         'szervezo_egyesulet' => 'min:1',
//     ]);
//     $competition = CompetitionModel::where('id', '=', $id)->first();
//     if (!$competition) {
//         return response()->json([
//             'error' => 'NO_SUCH_COMPETITION'
//         ], 404);
//     }
//     $competition->update([
//         ...$request->all(),
//         'evszam' => $evszam,
//     ]);
//     return response()->json([
//         'success' => true,
//     ]);
// });

// Route::middleware(["auth:sanctum", "ability:organizer"])->delete('/deleteCompetitionCategories/{id}', function($id, Request $request){

// });

Route::post('/storeEmail', function(Request $request) use ($queuePasswordResetEmail){
    $request->validate([
        'to' => 'required|email',
    ]);

    $user = UserModel::where('email', $request->input('to'))->first();

    if ($user) {
        $token = Str::random(64);
        $table = config('auth.passwords.users.table', 'password_reset_tokens');

        DB::table($table)->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => Hash::make($token),
                'created_at' => now(),
            ]
        );

        $queuePasswordResetEmail($user, $token);
    }

    return response()->json([
        'success' => true,
    ]);
});
