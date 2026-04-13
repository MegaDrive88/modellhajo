<?php

namespace App\Services;

use App\Models\Email;
use App\Models\UserModel;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Support\Facades\Notification;

class PasswordResetService
{
    public function queueResetEmail(UserModel $user, string $token): void
    {
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
    }
}
