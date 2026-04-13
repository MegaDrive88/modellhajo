<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Email;
use App\Mail\DatabaseMail;
use Illuminate\Support\Facades\Mail;


class SendPendingEmails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-pending-emails';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send all pending emails';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $emails = Email::whereNull('elkuldve')->get();

        foreach ($emails as $email) {
            Mail::to($email->cimzett_email)
                ->send(new DatabaseMail($email));

            $email->elkuldve = now();
            $email->save();
        }
    }
}
