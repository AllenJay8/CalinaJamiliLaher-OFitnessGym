import { useEffect, useState, useCallback } from 'react';
import { Webhook, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/Table/DataTable';
import Modal from '../../components/Modal/Modal';
import { formatDateTime } from '../../utils/format';
import { useSetPageTitle } from '../../hooks/useSetPageTitle';
import type { WebhookLog, PaginatedResponse } from '../../types';

const WebhooksPage = () => {
  useSetPageTitle('Webhooks');
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [selected, setSelected] = useState<WebhookLog | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<WebhookLog>>('/webhook-logs', { params: { page } });
      setLogs(data.data);
      setLastPage(data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FACC15]/20">
            <Webhook className="h-6 w-6 text-[#EAB308]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#111827]">Webhook Activity</h3>
            <p className="text-sm text-gray-500">Automatic webhook events for member registration, payments, and membership status changes</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
          {['new_member_registered', 'student_daily_pass_purchased', 'regular_monthly_membership_purchased', 'membership_expiring_soon', 'membership_expired', 'membership_renewed'].map((e) => (
            <span key={e} className="rounded bg-gray-50 px-2 py-1 text-gray-600">{e.replace(/_/g, ' ')}</span>
          ))}
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'event', label: 'Event', render: (l) => l.event.replace(/_/g, ' ') },
          { key: 'success', label: 'Status', render: (l) => (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${l.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {l.success ? <CheckCircle size={12} /> : <XCircle size={12} />}
              {l.success ? 'Success' : 'Failed'}
            </span>
          )},
          { key: 'status_code', label: 'Status Code', render: (l) => l.status_code ?? '-' },
          { key: 'created_at', label: 'Timestamp', render: (l) => formatDateTime(l.created_at) },
        ]}
        data={logs}
        currentPage={page}
        lastPage={lastPage}
        onPageChange={setPage}
        loading={loading}
        actions={(l) => (
          <button onClick={() => setSelected(l)} className="rounded px-2 py-1 text-sm text-[#EAB308] hover:bg-[#FACC15]/10">
            View
          </button>
        )}
      />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Webhook Details" size="lg">
        {selected && (
          <div className="space-y-4 text-sm">
            <div><strong>Event:</strong> {selected.event}</div>
            <div><strong>URL:</strong> {selected.url}</div>
            <div><strong>Status Code:</strong> {selected.status_code ?? 'N/A'}</div>
            <div>
              <strong>Payload:</strong>
              <pre className="mt-1 max-h-40 overflow-auto rounded-lg bg-gray-50 p-3 text-xs">{JSON.stringify(selected.payload, null, 2)}</pre>
            </div>
            <div>
              <strong>Response:</strong>
              <pre className="mt-1 max-h-40 overflow-auto rounded-lg bg-gray-50 p-3 text-xs">{selected.response_body ?? 'No response'}</pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WebhooksPage;
