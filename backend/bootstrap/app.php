<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // تفعيل Sanctum للتعامل مع طلبات React (SPA)
        // هذا السطر يقوم تلقائياً بإضافة StartSession و EncryptCookies لطلبات الـ API
        $middleware->statefulApi();

        // إضافة الـ Cors المخصص في بداية العمليات لضمان عدم حظر الطلبات
        $middleware->prepend(\App\Http\Middleware\Cors::class);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // التأكد من أن جميع أخطاء الـ API ترجع بصيغة JSON
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson()
        );
    })->create();
