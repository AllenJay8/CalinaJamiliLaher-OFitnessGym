<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Notification::with('member');

        if ($request->get('unread_only')) {
            $query->where('is_read', false);
        }

        return response()->json($query->orderByDesc('created_at')->paginate($request->get('per_page', 20)));
    }

    public function markAsRead(Notification $notification): JsonResponse
    {
        $notification->update(['is_read' => true]);

        return response()->json($notification);
    }

    public function markAllAsRead(): JsonResponse
    {
        Notification::where('is_read', false)->update(['is_read' => true]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    public function unreadCount(): JsonResponse
    {
        $count = Notification::where('is_read', false)->count();

        return response()->json(['count' => $count]);
    }
}
