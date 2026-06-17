<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebhookLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebhookLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = WebhookLog::query();

        if ($event = $request->get('event')) {
            $query->where('event', 'like', "%{$event}%");
        }

        if ($request->has('success')) {
            $query->where('success', $request->boolean('success'));
        }

        return response()->json($query->orderByDesc('created_at')->paginate($request->get('per_page', 20)));
    }

    public function show(WebhookLog $webhookLog): JsonResponse
    {
        return response()->json($webhookLog);
    }
}
