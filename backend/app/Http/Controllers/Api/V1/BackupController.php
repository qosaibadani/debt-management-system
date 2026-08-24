<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BackupController extends Controller
{
    public function download()
    {
        // التحقق من الصلاحيات
        if (auth()->user()->role !== 'owner') {
            abort(403, 'غير مصرح لك');
        }

        $dbName = env('DB_DATABASE');
        $dbUser = env('DB_USERNAME');
        $dbPass = env('DB_PASSWORD');
        // المسار الذي أكدته أنت في XAMPP
        $mysqldumpPath = 'C:\\xampp\\mysql\\bin\\mysqldump.exe';

        $fileName = 'backup_qnb_' . date('Y-m-d_H-i-s') . '.sql';

        return new StreamedResponse(function () use ($mysqldumpPath, $dbName, $dbUser, $dbPass) {
            // تنفيذ الأمر مع معالجة كلمة المرور الفارغة
            $passwordPart = $dbPass ? "--password=\"$dbPass\"" : "";
            $command = "\"$mysqldumpPath\" --user=$dbUser $passwordPart $dbName";

            $handle = popen($command, 'r');
            if ($handle) {
                while (!feof($handle)) {
                    echo fread($handle, 1024 * 8);
                    flush();
                }
                pclose($handle);
            }
        }, 200, [
            'Content-Type' => 'application/octet-stream',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ]);
    }
}
