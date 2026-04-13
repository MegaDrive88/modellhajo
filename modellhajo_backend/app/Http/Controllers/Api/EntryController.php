<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CompetitionEntryModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EntryController extends Controller
{
    public function enterCompetition(int $id, Request $request): JsonResponse
    {
        $assoc = (int) $request->input('assocId') === -1 ? null : $request->input('assocId');
        $skip = [];

        $request->user()->mmsz_id = $request->input('mmszid');
        $request->user()->save();

        foreach ((array) $request->input('entry') as $categoryId) {
            $alreadyRegistered = CompetitionEntryModel::where('versenyzoid', $request->user()->id)
                ->where('kategoriaid', $categoryId)
                ->where('versenyid', $id)
                ->exists();

            if ($alreadyRegistered) {
                $skip[] = $categoryId;
                continue;
            }

            CompetitionEntryModel::create([
                'versenyzoid' => $request->user()->id,
                'kategoriaid' => $categoryId,
                'versenyid' => $id,
                'egyesulet' => $assoc,
            ]);
        }

        return response()->json([
            'success' => true,
            'skipped' => $skip,
            'delta' => count((array) $request->input('entry')) - count($skip),
        ], 201);
    }

    public function byUser(int $id): JsonResponse
    {
        $entries = CompetitionEntryModel::where('versenyzoid', $id)
            ->orderBy('versenyid', 'desc')
            ->get()
            ->groupBy('versenyid');

        return response()->json([
            'success' => true,
            'entries' => $entries,
        ]);
    }

    public function byOrganizer(Request $request): JsonResponse
    {
        $entries = CompetitionEntryModel::whereHas('competition', function ($query) use ($request) {
            $query->where('letrehozo_id', $request->user()->id);
        })
            ->orderBy('versenyid', 'desc')
            ->get()
            ->groupBy('versenyid');

        return response()->json([
            'success' => true,
            'entries' => $entries,
        ]);
    }

    public function byCompetition(int $id): JsonResponse
    {
        $entries = CompetitionEntryModel::where('versenyid', $id)
            ->get()
            ->groupBy('versenyid');

        return response()->json([
            'success' => true,
            'entries' => $entries,
        ]);
    }

    public function cancel(int $id): JsonResponse
    {
        $entry = CompetitionEntryModel::where('id', $id)->first();

        if (!$entry) {
            return response()->json([
                'success' => false,
                'error' => 'No such entry',
            ]);
        }

        $entry->delete();

        return response()->json([
            'success' => true,
        ]);
    }

    public function manuallyEnterCompetitor(int $id, Request $request): JsonResponse
    {
        CompetitionEntryModel::create([
            'kategoriaid' => $request->input('category'),
            'versenyzoid' => $request->input('competitor'),
            'versenyid' => $id,
        ]);

        return response()->json([
            'success' => true,
        ]);
    }
}
