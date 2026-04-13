<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AssociationModel;
use App\Models\CategoryModel;
use App\Models\UserModel;
use App\Services\PasswordResetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MetaController extends Controller
{
    public function health(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
        ]);
    }

    public function associationsAndCategories(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'associations' => cache()->remember('associations', 3600, fn () => AssociationModel::all()),
            'categories' => cache()->remember('categories', 3600, fn () => CategoryModel::all()),
        ]);
    }

    public function storeEmail(Request $request, PasswordResetService $passwordResetService): JsonResponse
    {
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

            $passwordResetService->queueResetEmail($user, $token);
        }

        return response()->json([
            'success' => true,
        ]);
    }
}
