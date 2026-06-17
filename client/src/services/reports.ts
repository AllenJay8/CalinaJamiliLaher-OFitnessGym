import api from './api';

export const downloadReport = async (
  format: 'pdf' | 'docx',
  params: { type: string; start_date: string; end_date: string }
) => {
  const endpoint = format === 'pdf' ? '/reports/export/pdf' : '/reports/export/docx';
  const response = await api.get(endpoint, {
    params,
    responseType: 'blob',
  });

  const blob = new Blob([response.data], {
    type: format === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${params.type}_report_${params.start_date}.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
