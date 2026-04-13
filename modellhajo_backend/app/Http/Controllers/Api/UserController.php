<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItemModel;
use App\Models\UserModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function update(int $id, Request $request): JsonResponse
    {
        $user = UserModel::find($id);
        if (!$user) {
            return response()->json(['success' => false, 'error' => 'USER_NOT_FOUND'], 404);
        }

        if ($request->input('megjeleno_nev') === '' || $request->input('felhasznalonev') === '' || $request->input('email') === '') {
            return response()->json(['success' => false, 'error' => 'EMPTY_FIELD'], 400);
        }

        $user->megjeleno_nev = $request->input('megjeleno_nev');

        $otherUsernames = UserModel::select('felhasznalonev')->where('id', '<>', $user->id)->pluck('felhasznalonev')->toArray();
        if (in_array($request->input('felhasznalonev'), $otherUsernames, true)) {
            return response()->json([
                'success' => false,
                'error' => 'USERNAME_NOT_UNIQUE',
            ]);
        }
        $user->felhasznalonev = $request->input('felhasznalonev');

        $otherEmails = UserModel::select('email')->where('id', '<>', $user->id)->pluck('email')->toArray();
        if (in_array($request->input('email'), $otherEmails, true)) {
            return response()->json([
                'success' => false,
                'error' => 'EMAIL_NOT_UNIQUE',
            ]);
        }
        $user->email = $request->input('email');

        if ($request->input('mmsz_id') !== null && $request->input('mmsz_id') !== '') {
            $otherMmszIds = UserModel::select('mmsz_id')->where('id', '<>', $user->id)->pluck('mmsz_id')->toArray();
            if (in_array($request->input('mmsz_id'), $otherMmszIds, true)) {
                return response()->json([
                    'success' => false,
                    'error' => 'MMSZID_NOT_UNIQUE',
                ]);
            }
            $user->mmsz_id = $request->input('mmsz_id');
        }

        try {
            $user->save();

            return response()->json([
                'success' => true,
                'user' => $user,
            ]);
        } catch (\Throwable $throwable) {
            return response()->json([
                'success' => false,
                'error' => $throwable->getMessage(),
            ], 400);
        }
    }

    public function updatePassword(int $id, Request $request): JsonResponse
    {
        $user = UserModel::find($id);
        if (!$user) {
            return response()->json(['success' => false, 'error' => 'USER_NOT_FOUND'], 404);
        }

        if ($request->input('old_password') === '' || $request->input('new_password') === '' || $request->input('conf_password') === '') {
            return response()->json(['success' => false, 'error' => 'EMPTY_FIELD'], 400);
        }

        if (!UserModel::matchesLegacyPassword((string) $request->input('old_password'), (string) $user->jelszo)) {
            return response()->json([
                'success' => false,
                'error' => 'INCORRECT_PASSWORD',
            ], 400);
        }

        if ($request->input('new_password') !== $request->input('conf_password')) {
            return response()->json([
                'success' => false,
                'error' => 'PASSWORD_MISMATCH',
            ], 400);
        }

        if ($request->input('new_password') === $request->input('old_password')) {
            return response()->json([
                'success' => false,
                'error' => 'PASSWORD_NOT_NEW',
            ], 400);
        }

        $user->jelszo = UserModel::createLegacyPasswordHash((string) $request->input('new_password'));

        try {
            $user->save();

            return response()->json([
                'success' => true,
                'user' => $user,
            ]);
        } catch (\Throwable $throwable) {
            return response()->json([
                'success' => false,
                'error' => $throwable->getMessage(),
            ], 400);
        }
    }

    public function menuItems(Request $request): JsonResponse
    {
        $roleId = 4;

        if ($request->user()->szerepkor_id == 1) {
            if ($request->user()->szerepkor_elfogadva) {
                $roleId = 1;
            }
        } else {
            $roleId = $request->user()->szerepkor_id;
        }

        $items = MenuItemModel::where('szerepkor_id', '=', $roleId)->get();

        return response()->json([
            'success' => true,
            'items' => $items,
        ]);
    }

    public function competitors(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'competitors' => UserModel::where('szerepkor_id', 2)->get(),
        ]);
    }
}
