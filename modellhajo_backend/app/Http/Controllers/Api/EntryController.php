<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AssociationModel;
use App\Models\CompetitionEntryModel;
use App\Models\CompetitionModel;
use App\Models\GroupModel;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EntryController extends Controller
{
    public function enterCompetition(int $id, Request $request): JsonResponse
    {
        $assoc = $this->normalizeAssociation($request->input('assoc'));
        $this->storeAssociationIfNew($assoc);
        $isJunior = filter_var($request->input('is_junior', false), FILTER_VALIDATE_BOOLEAN);
        $skip = [];

        $request->user()->mmsz_id = $request->input('mmszid');
        $request->user()->save();

        foreach ((array) $request->input('entry') as $categoryId) {
            $alreadyRegistered = CompetitionEntryModel::where('versenyzoid', $request->user()->id)
                ->where('kategoriaid', $categoryId)
                ->where('versenyid', $id)
                ->where('is_junior', $isJunior)
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
                'csoportid' => $this->resolveHighestGroupId($id, (int) $categoryId, $isJunior),
                'is_junior' => $isJunior ? 1 : 0,
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
        $entries = CompetitionEntryModel::with('group')
            ->where('versenyzoid', $id)
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
        $request->user()->loadMissing('role');
        if ((int) ($request->user()->role->szint ?? 0) >= 3){
            return response()->json([
                'success' => true,
                'entries' => CompetitionEntryModel::with('group')
                    ->orderBy('versenyid', 'desc')
                    ->get()
                    ->groupBy('versenyid'),
            ]);
        }
        $entries = CompetitionEntryModel::with('group')
            ->whereHas('competition', function ($query) use ($request) {
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
        $entries = CompetitionEntryModel::with('group')
            ->where('versenyid', $id)
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
            'rajtszam' => ['nullable', 'integer', 'min:1'],
            'sorszam' => ['nullable', 'string', 'regex:/^J?[1-9][0-9]*$/i'],
        ]);

        try {
            if ($request->has('sorszam')) {
                $this->ensureGroupSelection($validated['sorszam'] ?? null, (bool) $entry->is_junior);
            }

            DB::transaction(function () use ($entry, $validated, $request): void {
                $entry->rajtszam = $validated['rajtszam'] ?? null;

                if ($request->has('sorszam')) {
                    $sorszam = $validated['sorszam'] ?? null;
                    $entry->csoportid = $this->resolveGroupId(
                        $entry->versenyid,
                        $entry->kategoriaid,
                        $sorszam,
                        (bool) $entry->is_junior
                    );
                }

                $entry->save();
            });
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        } catch (UniqueConstraintViolationException $e) {
            return response()->json([
                'success' => false,
                'error' => $this->mapUniqueConstraintErrorType($e->getMessage()),
            ], 409);
        }

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
            'entries.*.rajtszam' => ['nullable', 'integer', 'min:1'],
            'entries.*.sorszam' => ['nullable', 'string', 'regex:/^J?[1-9][0-9]*$/i'],
        ]);

        try {
            DB::transaction(function () use ($id, $validated): void {
                foreach ($validated['entries'] as $entryData) {
                    $entry = CompetitionEntryModel::where('id', $entryData['id'])
                        ->where('versenyid', $id)
                        ->first();

                    if (!$entry) {
                        continue;
                    }

                    $entry->rajtszam = $entryData['rajtszam'] ?? null;

                    if (array_key_exists('sorszam', $entryData)) {
                        $this->ensureGroupSelection($entryData['sorszam'] ?? null, (bool) $entry->is_junior);
                        $sorszam = $entryData['sorszam'] ?? null;
                        $entry->csoportid = $this->resolveGroupId(
                            $entry->versenyid,
                            $entry->kategoriaid,
                            $sorszam,
                            (bool) $entry->is_junior
                        );
                    }

                    $entry->save();
                }
            });
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        } catch (UniqueConstraintViolationException $e) {
            return response()->json([
                'success' => false,
                'error' => $this->mapUniqueConstraintErrorType($e->getMessage()),
            ], 409);
        }

        return response()->json([
            'success' => true,
        ]);
    }


    public function manuallyEnterCompetitor(int $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'number' => ['nullable', 'integer', 'min:1'],
            'sorszam' => ['nullable', 'string', 'regex:/^J?[1-9][0-9]*$/i'],
        ]);

        $assoc = $this->normalizeAssociation($request->input('assoc'));
        $this->storeAssociationIfNew($assoc);
        $isJunior = filter_var($request->input('is_junior', false), FILTER_VALIDATE_BOOLEAN);

        try {
            if ($request->has('sorszam')) {
                $this->ensureGroupSelection($validated['sorszam'] ?? null, $isJunior);
            }

            CompetitionEntryModel::create([
                'kategoriaid' => $request->input('category'),
                'versenyzoid' => $request->input('competitor'),
                'versenyid' => $id,
                'egyesulet' => $assoc,
                'rajtszam' => $validated['number'] ?? null,
                'csoportid' => $this->resolveHighestGroupId($id, (int) $request->input('category'), $isJunior),
                'is_junior' => $isJunior ? 1 : 0,
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        } catch (UniqueConstraintViolationException $e) {
            return response()->json([
                'success' => false,
                'error' => $this->mapUniqueConstraintErrorType($e->getMessage()),
            ], 409);
        }

        return response()->json([
            'success' => true,
        ]);
    }

    private function mapUniqueConstraintErrorType(string $message): array
    {
        if (str_contains($message, 't_nevezes_unique_1') || str_contains($message, 'Key (kategoriaid, versenyid, rajtszam)')) {
            return [
                'type' => 'ENTRY_NUMBER_TAKEN',
                'message' => 'Ebben a kategóriában már szerepel ez a rajtszám.',
            ];
        }

        if (str_contains($message, 't_nevezes_unique') || str_contains($message, 'Key (versenyzoid, kategoriaid, versenyid)')) {
            return [
                'type' => 'ENTRY_ALREADY_EXISTS',
                'message' => 'A versenyző már nevezve van ebben a kategóriában.',
            ];
        }

        return [
            'type' => 'UNIQUE_CONSTRAINT',
            'message' => 'Egyedi megszorítás sérült.',
        ];
    }

    private function normalizeAssociation(mixed $assocInput): ?string
    {
        if ($assocInput === null) {
            return null;
        }

        $assoc = trim((string) $assocInput);

        return $assoc === '' ? null : $assoc;
    }

    private function storeAssociationIfNew(?string $assoc): void
    {
        if ($assoc === null) {
            return;
        }

        $record = AssociationModel::firstOrCreate([
            'nev' => $assoc,
        ]);

        if ($record->wasRecentlyCreated) {
            cache()->forget('associations');
        }
    }

    private function resolveGroupId(int $competitionId, int $categoryId, ?string $sorszam, bool $isJuniorEntry): ?int
    {
        $parsed = $this->parseGroupInput($sorszam);

        if ($parsed === null) {
            return null;
        }

        if (!$isJuniorEntry && $parsed['isJunior']) {
            throw new \InvalidArgumentException('JUNIOR_GROUP_NOT_ALLOWED');
        }

        $group = GroupModel::firstOrCreate([
            'versenyid' => $competitionId,
            'kategoriaid' => $categoryId,
            'sorszam' => $parsed['normalized'],
            'junior' => $parsed['isJunior'] ? 1 : 0,
        ]);

        return $group->id;
    }

    private function resolveHighestGroupId(int $competitionId, int $categoryId, bool $isJunior): int
    {
        $groups = GroupModel::where('versenyid', $competitionId)
            ->where('kategoriaid', $categoryId)
            ->where('junior', $isJunior ? 1 : 0)
            ->get(['id', 'sorszam']);

        $maxNumber = null;
        $maxId = null;

        foreach ($groups as $group) {
            $number = $this->parseGroupNumeric($group->sorszam);
            if ($number === null) {
                continue;
            }

            if ($maxNumber === null || $number > $maxNumber) {
                $maxNumber = $number;
                $maxId = $group->id;
            }
        }

        if ($maxId !== null) {
            return (int) $maxId;
        }

        $sorszam = $isJunior ? 'J1' : '1';
        $group = GroupModel::firstOrCreate([
            'versenyid' => $competitionId,
            'kategoriaid' => $categoryId,
            'sorszam' => $sorszam,
            'junior' => $isJunior ? 1 : 0,
        ]);

        return (int) $group->id;
    }

    private function parseGroupNumeric(?string $sorszam): ?int
    {
        if ($sorszam === null) {
            return null;
        }

        $trimmed = trim($sorszam);
        if ($trimmed === '') {
            return null;
        }

        $upper = strtoupper($trimmed);
        $numericPart = str_starts_with($upper, 'J') ? substr($upper, 1) : $upper;

        if ($numericPart === '' || !ctype_digit($numericPart)) {
            return null;
        }

        $numericValue = (int) $numericPart;
        if ($numericValue < 1) {
            return null;
        }

        return $numericValue;
    }

    private function parseGroupInput(?string $sorszam): ?array
    {
        if ($sorszam === null) {
            return null;
        }

        $trimmed = trim($sorszam);
        if ($trimmed === '') {
            return null;
        }

        $upper = strtoupper($trimmed);
        $isJunior = str_starts_with($upper, 'J');
        $numericPart = $isJunior ? substr($upper, 1) : $upper;

        if ($numericPart === '' || !ctype_digit($numericPart)) {
            return null;
        }

        $numericValue = (int) $numericPart;
        if ($numericValue < 1) {
            return null;
        }

        $normalized = (string) $numericValue;
        if ($isJunior) {
            $normalized = 'J' . $normalized;
        }

        return [
            'normalized' => $normalized,
            'isJunior' => $isJunior,
        ];
    }

    private function ensureGroupSelection(?string $sorszam, bool $isJuniorEntry): void
    {
        if ($sorszam === null || trim($sorszam) === '') {
            return;
        }

        $parsed = $this->parseGroupInput($sorszam);
        if ($parsed === null) {
            throw new \InvalidArgumentException('INVALID_GROUP');
        }

        if (!$isJuniorEntry && $parsed['isJunior']) {
            throw new \InvalidArgumentException('JUNIOR_GROUP_NOT_ALLOWED');
        }
    }
}
