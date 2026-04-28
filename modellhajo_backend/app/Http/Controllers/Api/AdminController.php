<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RoleModel;
use App\Models\UserModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function roleRequests(): JsonResponse
    {
        return response()->json(
            UserModel::with('role')
                ->whereHas('role', function ($query) {
                    $query->where('szint', 2);
                })
                ->whereNull('szerepkort_elfogadta')
                ->get()
        );
    }

    public function decideRoleRequest(string $verdict, Request $request): JsonResponse
    {
        $user = UserModel::find($request->input('id'));

        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'USER_NOT_FOUND',
            ], 404);
        }

        $isApproved = filter_var($verdict, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        $isApproved = $isApproved ?? ($verdict === '1');

        if ($isApproved) {
            $user->szerepkort_elfogadta = $request->user()->id;
            $user->szerepkor_elfogadva = now();
        } else {
            $fallbackRole = RoleModel::where('szerepkor_nev', 'versenyző')->first();
            if (!$fallbackRole) {
                $fallbackRole = RoleModel::where('szint', 1)->first();
            }
            if ($fallbackRole) {
                $user->szerepkor_id = $fallbackRole->id;
            }
        }

        $user->save();

        return response()->json([
            'success' => true,
        ]);
    }
}
