<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CompetitionEntryModel;
use App\Models\CompetitionModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

    public function updateNumber(int $id, Request $request): JsonResponse
    {
        $entry = CompetitionEntryModel::where('id', $id)->first();

        if (!$entry) {
            return response()->json([
                'success' => false,
                'error' => 'No such entry',
            ], 404);
        }

        $validated = $request->validate([
            'rajtszam' => ['nullable', 'integer', 'min:0'],
        ]);

        $entry->rajtszam = $validated['rajtszam'] ?? null;
        $entry->save();

        return response()->json([
            'success' => true,
            'entry' => $entry,
        ]);
    }

    public function bulkUpdateNumbers(int $id, Request $request): JsonResponse
    {
        $competition = CompetitionModel::where('id', $id)
            ->where('letrehozo_id', $request->user()->id)
            ->first();

        if (!$competition) {
            return response()->json([
                'success' => false,
                'error' => 'NO_SUCH_COMPETITION',
            ], 404);
        }

        $validated = $request->validate([
            'entries' => ['required', 'array'],
            'entries.*.id' => ['required', 'integer'],
            'entries.*.rajtszam' => ['nullable', 'integer', 'min:0'],
        ]);

        DB::transaction(function () use ($id, $validated): void {
            foreach ($validated['entries'] as $entryData) {
                $entry = CompetitionEntryModel::where('id', $entryData['id'])
                    ->where('versenyid', $id)
                    ->first();

                if (!$entry) {
                    continue;
                }

                $entry->rajtszam = $entryData['rajtszam'] ?? null;
                $entry->save();
            }
        });

        return response()->json([
            'success' => true,
        ]);
    }

    public function deleteAllEntries(int $id, Request $request): JsonResponse
    {
        $competition = CompetitionModel::where('id', $id)
            ->where('letrehozo_id', $request->user()->id)
            ->first();

        if (!$competition) {
            return response()->json([
                'success' => false,
                'error' => 'NO_SUCH_COMPETITION',
            ], 404);
        }

        DB::transaction(function () use ($id): void {
            CompetitionEntryModel::where('versenyid', '=', $id)->delete();
        });

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
            'egyesulet' => $request->input('assoc'),
            'rajtszam' => $request->input('number'),
        ]);

        return response()->json([
            'success' => true,
        ]);
    }
}
