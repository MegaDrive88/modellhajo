<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CompetitionCategoryModel;
use App\Models\CompetitionEntryModel;
use App\Models\CompetitionModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CompetitionController extends Controller
{
    public function uploadThumbnail(Request $request): JsonResponse
    {
        $path = $request->file('thumbnail')->store('thumbnails', 'public');
        $url = Storage::url($path);

        return response()->json([
            'success' => true,
            'path' => $path,
            'url' => $url,
            'filename' => basename($path),
        ]);
    }

    public function create(Request $request): JsonResponse
    {
        $evszam = $request->input('evszam');
        if ($request->input('evszam') === '') {
            $evszam = explode('-', $request->input('kezdet'))[0];
        }

        $request->validate([
            'nev' => 'required',
            'helyszin' => 'required',
            'nevezesi_dij_junior' => 'required|min:0',
            'nevezesi_dij_normal' => 'required|min:0',
            'szervezo_egyesulet' => 'required|string|max:255',
        ]);

        $competition = CompetitionModel::create([
            ...$request->all(), 
            'evszam' => $evszam,
            'letrehozo_id' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'compId' => $competition->id,
        ]);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $evszam = $request->input('evszam');
        if ($request->input('evszam') === '') {
            $evszam = explode('-', $request->input('kezdet'))[0];
        }

        $request->validate([
            'nev' => 'required',
            'helyszin' => 'required',
            'nevezesi_dij_junior' => 'required|min:0',
            'nevezesi_dij_normal' => 'required|min:0',
            'szervezo_egyesulet' => 'required|string|max:255',
        ]);

        $competition = CompetitionModel::where('id', '=', $id)->first();
        if (!$competition) {
            return response()->json([
                'error' => 'NO_SUCH_COMPETITION',
            ], 404);
        }

        try {
            DB::transaction(function () use ($request, $competition, $evszam, $id): void {
                $existingCategoryIds = CompetitionCategoryModel::where('versenyid', $id)
                    ->pluck('kategoriaid')
                    ->all();

                $requestedCategoryIds = array_values(array_unique((array) $request->input('categs', [])));
                $removedCategoryIds = array_values(array_diff($existingCategoryIds, $requestedCategoryIds));

                if (!empty($removedCategoryIds)) {
                    CompetitionEntryModel::where('versenyid', $id)
                        ->whereIn('kategoriaid', $removedCategoryIds)
                        ->delete();
                }

                $competition->update([
                    ...$request->all(),
                    'evszam' => $evszam,
                ]);

                if ($request->has('categs') && is_array($request->input('categs'))) {
                    CompetitionCategoryModel::where('versenyid', $id)->delete();

                    foreach ((array) $request->input('categs') as $categoryId) {
                        CompetitionCategoryModel::create([
                            'versenyid' => $id,
                            'kategoriaid' => $categoryId,
                        ]);
                    }
                }
            });
        } catch (\Throwable $throwable) {
            return response()->json([
                'success' => false,
                'error' => 'COMPETITION_UPDATE_FAILED',
                'message' => $throwable->getMessage(),
            ], 400);
        }

        return response()->json([
            'success' => true,
        ]);
    }

    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => CompetitionModel::all(),
        ]);
    }

    public function mine(Request $request): JsonResponse
    {
        if ($request->user()->isadmin){
            return response()->json([
                'success' => true,
                'data' => CompetitionModel::all(),
            ]);
        }
        return response()->json([
            'success' => true,
            'data' => CompetitionModel::where('letrehozo_id', '=', $request->user()->id)->get(),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $competition = CompetitionModel::where('id', '=', $id)->first();

        if (!$competition) {
            return response()->json([
                'success' => false,
                'error' => 'NO_SUCH_COMPETITION',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $competition,
        ]);
    }

    public function createCategories(Request $request): JsonResponse
    {
        $compId = $request->input('compId');

        foreach ((array) $request->input('categs') as $categoryId) {
            CompetitionCategoryModel::create([
                'versenyid' => $compId,
                'kategoriaid' => $categoryId,
            ]);
        }

        return response()->json([
            'success' => true,
        ]);
    }

    public function categories(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'categories' => CompetitionCategoryModel::with('category')->get(),
        ]);
    }

    public function delete(int $id): JsonResponse
    {
        $competition = CompetitionModel::find($id);

        if (!$competition) {
            return response()->json([
                'success' => false,
                'error' => 'NO_SUCH_COMPETITION',
            ], 404);
        }

        try {
            DB::transaction(function () use ($id): void {
                CompetitionEntryModel::where('versenyid', '=', $id)->delete();
                CompetitionCategoryModel::where('versenyid', '=', $id)->delete();
                CompetitionModel::where('id', $id)->delete();
            });
        } catch (\Throwable $throwable) {
            return response()->json([
                'success' => false,
                'error' => 'COMPETITION_DELETE_FAILED',
                'message' => $throwable->getMessage(),
            ], 400);
        }

        return response()->json([
            'success' => true,
        ]);
    }
}
