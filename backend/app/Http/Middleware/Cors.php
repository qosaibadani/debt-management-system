<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * وسيط CORS المطور - يدعم Sanctum SPA وتحميل الملفات الكبيرة
 */
class Cors
{
    public function handle(Request $request, Closure $next): Response
    {
        // 1. التعامل مع طلبات OPTIONS (Preflight)
        if ($request->isMethod('OPTIONS')) {
            $response = response('', 204);
            $this->applyCorsHeaders($request, $response);
            return $response;
        }

        // 2. معالجة الطلب الأصلي
        $response = $next($request);

        // 3. تطبيق التصاريح على الاستجابة (متوافق مع StreamedResponse)
        $this->applyCorsHeaders($request, $response);

        return $response;
    }

    /**
     * إضافة رؤوس CORS بطريقة آمنة لا تسبب أخطاء في الـ StreamedResponse
     */
    private function applyCorsHeaders(Request $request, $response): void
    {
        $allowedOrigins = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5174',
        ];

        $origin = $request->header('Origin' );
        $origin = in_array($origin, $allowedOrigins) ? $origin : $allowedOrigins[0];

        // استخدام headers->set هو السر لمنع خطأ "undefined method withHeaders"
        $response->headers->set('Access-Control-Allow-Origin', $origin);
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-XSRF-TOKEN');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        $response->headers->set('Access-Control-Max-Age', '86400');
        
        // مهم جداً للسماح للـ React بقراءة اسم ملف النسخة الاحتياطية
        $response->headers->set('Access-Control-Expose-Headers', 'Content-Disposition');
    }
}
