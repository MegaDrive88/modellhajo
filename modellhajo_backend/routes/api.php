<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompetitionController;
use App\Http\Controllers\Api\EntryController;
use App\Http\Controllers\Api\MetaController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', [MetaController::class, 'health']);

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/password/forgot', [AuthController::class, 'forgotPassword']);
    Route::post('/password/reset', [AuthController::class, 'resetPassword']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/check-admin', [AuthController::class, 'checkAdmin']);
        Route::get('/check-token', [AuthController::class, 'checkToken']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::patch('/users/{id}', [UserController::class, 'update']);
    Route::patch('/users/{id}/password', [UserController::class, 'updatePassword']);
    Route::get('/users/menu-items', [UserController::class, 'menuItems']);
    Route::get('/users/competitors', [UserController::class, 'competitors']);
});

Route::middleware(['auth:sanctum', 'ability:admin'])->group(function () {
    Route::get('/admin/role-requests', [AdminController::class, 'roleRequests']);
    Route::patch('/admin/role-requests/{verdict}', [AdminController::class, 'decideRoleRequest']);
});

Route::get('/lookups/associations-categories', [MetaController::class, 'associationsAndCategories']);
Route::get('/lookups/roles', [MetaController::class, 'roles']);
Route::post('/emails/password-reset', [MetaController::class, 'storeEmail']);

Route::get('/competitions', [CompetitionController::class, 'index']);
Route::get('/competitions/categories', [CompetitionController::class, 'categories']);
Route::get('/competitions/{id}', [CompetitionController::class, 'show'])->whereNumber('id');

Route::middleware(['auth:sanctum', 'ability:organizer'])->group(function () {
    Route::post('/competitions/thumbnail', [CompetitionController::class, 'uploadThumbnail']);
    Route::post('/competitions', [CompetitionController::class, 'create']);
    Route::put('/competitions/{id}', [CompetitionController::class, 'update'])->whereNumber('id');
    Route::delete('/competitions/{id}', [CompetitionController::class, 'delete'])->whereNumber('id');
    Route::get('/competitions/mine', [CompetitionController::class, 'mine']);
    Route::post('/competitions/categories', [CompetitionController::class, 'createCategories']);
    Route::post('/competitions/{id}/entries/manual', [EntryController::class, 'manuallyEnterCompetitor'])->whereNumber('id');
    Route::patch('/competitions/{id}/entries/numbers', [EntryController::class, 'bulkUpdateNumbers'])->whereNumber('id');
    Route::patch('/entries/{id}', [EntryController::class, 'updateNumber'])->whereNumber('id');
    Route::get('/organizer/entries', [EntryController::class, 'byOrganizer']);
});

Route::middleware(['auth:sanctum', 'abilities:competitor,supporter,organizer'])->group(function () {
    Route::post('/competitions/{id}/entries', [EntryController::class, 'enterCompetition'])->whereNumber('id');
    Route::get('/users/{id}/entries', [EntryController::class, 'byUser']);
});

Route::get('/competitions/{id}/entries', [EntryController::class, 'byCompetition'])->whereNumber('id');

Route::middleware(['auth:sanctum', 'abilities:competitor,supporter,organizer'])->group(function () {
    Route::delete('/entries/{id}', [EntryController::class, 'cancel']);
});

/* Legacy aliases */
Route::post('/login', [AuthController::class, 'login']);
Route::post('/createAccount', [AuthController::class, 'register']);
Route::post('/forgotPassword', [AuthController::class, 'forgotPassword']);
Route::post('/resetPassword', [AuthController::class, 'resetPassword']);
Route::post('/storeEmail', [MetaController::class, 'storeEmail']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/checkAdmin', [AuthController::class, 'checkAdmin']);
    Route::get('/checkTokenExpired', [AuthController::class, 'checkToken']);
    Route::patch('/updateUser/{id}', [UserController::class, 'update']);
    Route::patch('/updatePassword/{id}', [UserController::class, 'updatePassword']);
    Route::get('/getMenuItems', [UserController::class, 'menuItems']);
    Route::get('/getCompetitors', [UserController::class, 'competitors']);
});

Route::middleware(['auth:sanctum', 'ability:admin'])->group(function () {
    Route::get('/getRoleRequests', [AdminController::class, 'roleRequests']);
    Route::patch('/decideRoleRequest/{verdict}', [AdminController::class, 'decideRoleRequest']);
});

Route::get('/getAssociationsAndCategories', [MetaController::class, 'associationsAndCategories']);
Route::get('/getRoles', [MetaController::class, 'roles']);
Route::get('/getAllCompetitions', [CompetitionController::class, 'index']);
Route::get('/getCompetition/{id}', [CompetitionController::class, 'show']);
Route::get('/getCompetitionCategories', [CompetitionController::class, 'categories']);
Route::get('/getEntriesByCompetitionId/{id}', [EntryController::class, 'byCompetition']);

Route::middleware(['auth:sanctum', 'ability:organizer'])->group(function () {
    Route::post('/uploadCompetitionThumbnail', [CompetitionController::class, 'uploadThumbnail']);
    Route::post('/createCompetition', [CompetitionController::class, 'create']);
    Route::put('/editCompetition/{id}', [CompetitionController::class, 'update']);
    Route::delete('/deleteCompetition/{id}', [CompetitionController::class, 'delete']);
    Route::get('/getUserCompetitions', [CompetitionController::class, 'mine']);
    Route::post('/createCompetitionCategories', [CompetitionController::class, 'createCategories']);
    Route::post('/manuallyEnterCompetitor/{id}', [EntryController::class, 'manuallyEnterCompetitor']);
    Route::patch('/bulkUpdateEntryNumbers/{id}', [EntryController::class, 'bulkUpdateNumbers']);
    Route::patch('/updateEntryNumber/{id}', [EntryController::class, 'updateNumber']);
    Route::delete('/deleteAllEntries/{id}', [EntryController::class, 'deleteAllEntries']);
    Route::get('/getEntriesByOrganizerId', [EntryController::class, 'byOrganizer']);
});

Route::middleware(['auth:sanctum', 'abilities:competitor,supporter,organizer'])->group(function () {
    Route::post('/enterCompetition/{id}', [EntryController::class, 'enterCompetition']);
    Route::get('/getEntriesByUserId/{id}', [EntryController::class, 'byUser']);
});

Route::middleware(['auth:sanctum', 'abilities:competitor,supporter,organizer'])->group(function () {
    Route::delete('/cancelEntry/{id}', [EntryController::class, 'cancel']);
});