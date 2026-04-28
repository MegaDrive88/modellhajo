<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserModel;
use App\Services\PasswordResetService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $column = $request->input('isEmail') ? 'email' : 'felhasznalonev';
        $user = UserModel::where($column, $request->input('user'))
            ->whereRaw("REGEXP_LIKE(jelszo, '^[A-Z]".$request->input('pwdHash')."[A-Z]$')")
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'LOGIN_FAILED',
            ]);
        }

        $user->load('role');
        $originalRoleLevel = (int) ($user->role->szint ?? 0);

        // If the user's role requires approval (organizer or above) but hasn't been accepted,
        // downgrade their effective role to competitor level for abilities.
        $roleAccepted = !empty($user->szerepkor_elfogadva);
        $roleLevel = $originalRoleLevel;
        if ($originalRoleLevel >= 2 && !$roleAccepted) {
            $roleLevel = 1; // treat as competitor until approved
        }

        $abilities = match (true) {
            $roleLevel >= 3 => ['admin', 'organizer', 'competitor', 'supporter'],
            $roleLevel >= 2 => ['organizer', 'competitor', 'supporter'],
            $roleLevel >= 1 => ['competitor', 'supporter'],
            default => [],
        };

        $token = $user->createToken(
            'modellhajo-login-token',
            $abilities
        )->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => $user,
            'access_token' => $token,
            'role_accepted' => $roleAccepted,
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $user = new UserModel();

        if (
            $request->input('felhasznalonev') === '' ||
            $request->input('megjeleno_nev') === '' ||
            $request->input('email') === '' ||
            $request->input('password') === '' ||
            $request->input('conf_password') === ''
        ) {
            return response()->json([
                'success' => false,
                'error' => 'EMPTY_FIELD',
            ]);
        }

        $usernames = UserModel::select('felhasznalonev')->pluck('felhasznalonev')->toArray();
        if (in_array($request->input('felhasznalonev'), $usernames, true)) {
            return response()->json([
                'success' => false,
                'error' => 'USERNAME_NOT_UNIQUE',
            ]);
        }

        $emails = UserModel::select('email')->pluck('email')->toArray();
        if (in_array($request->input('email'), $emails, true)) {
            return response()->json([
                'success' => false,
                'error' => 'EMAIL_NOT_UNIQUE',
            ]);
        }

        if ($request->input('password') !== $request->input('conf_password')) {
            return response()->json([
                'success' => false,
                'error' => 'PASSWORD_MISMATCH',
            ]);
        }

        $user->felhasznalonev = $request->input('felhasznalonev');
        $user->megjeleno_nev = $request->input('megjeleno_nev');
        $user->email = $request->input('email');
        $user->szerepkor_id = $request->input('szerepkor_id');
        $user->mmsz_id = $request->input('mmszid');
        $user->jelszo = UserModel::createLegacyPasswordHash((string) $request->input('password'));
        $user->save();
        $user->load('role');

        return response()->json([
            'success' => true,
            'user' => $user,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['success' => true]);
    }

    public function checkAdmin(Request $request): JsonResponse
    {
        $request->user()->loadMissing('role');

        return response()->json((int) ($request->user()->role->szint ?? 0) >= 3);
    }

    public function checkToken(): JsonResponse
    {
        return response()->json(true);
    }

    public function forgotPassword(Request $request, PasswordResetService $passwordResetService): JsonResponse
    {
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

        $passwordResetService->queueResetEmail($user, $token);

        return response()->json([
            'success' => true,
            'message' => 'Elküldtük a visszaállító linket.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
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

        $user->jelszo = UserModel::createLegacyPasswordHash((string) $request->input('new_password'));
        $user->save();

        DB::table($table)->where('email', $request->input('email'))->delete();

        return response()->json([
            'success' => true,
        ]);
    }
}
