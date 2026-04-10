<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');


Schedule::command('app:send-pending-emails')
    ->everyMinute()
    ->withoutOverlapping();

//php artisan schedule:work -- dockerfile-ba valszeg majd kell