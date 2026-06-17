import { useEffect, useState, useCallback } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/Button/Button';
import { formatDateTime } from '../../utils/format';
import { useSetPageTitle } from '../../hooks/useSetPageTitle';
import type { Notification, PaginatedResponse } from '../../types';

const NotificationsPage = () => {
  useSetPageTitle('Notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<Notification>>('/notifications', { params: { page } });
      setNotifications(data.data);
      setLastPage(data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = async (id: number) => {
    await api.patch(`/notifications/${id}/read`);
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    await api.post('/notifications/mark-all-read');
    fetchNotifications();
  };

  const getTypeIcon = (type: string) => {
    const colors: Record<string, string> = {
      new_member: 'bg-blue-100 text-blue-600',
      expiring_soon: 'bg-yellow-100 text-yellow-600',
      expired: 'bg-red-100 text-red-600',
      payment: 'bg-green-100 text-green-600',
    };
    return colors[type] ?? 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={markAllAsRead}><CheckCheck size={16} /> Mark All Read</Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FACC15] border-t-transparent" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <Bell className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">No notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className={`rounded-xl border bg-white p-4 shadow-sm ${n.is_read ? 'border-gray-200 opacity-75' : 'border-[#FACC15]'}`}>
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getTypeIcon(n.type)}`}>
                  <Bell size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-[#111827]">{n.title}</h4>
                      <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                      <p className="mt-2 text-xs text-gray-400">{formatDateTime(n.created_at)}</p>
                    </div>
                    {!n.is_read && (
                      <button onClick={() => markAsRead(n.id)} className="text-xs font-medium text-[#EAB308] hover:underline">
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {lastPage > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="flex items-center text-sm text-gray-500">Page {page} of {lastPage}</span>
          <Button variant="secondary" disabled={page >= lastPage} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
