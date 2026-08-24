import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Pagination from '../components/Pagination';

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAuditLogs = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/audit-logs?page=${page}&limit=15`);
      if (res.success) {
        setLogs(res.data.logs || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch system audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs(1);
  }, []);

  return (
    <div>
      <div className="card">
        <h2 className="card-title">System Audit Log Trail (BR-09)</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Immutably records every approval, rejection, role permission modification, and user assignment.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>No audit log records recorded yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action Executed</th>
                  <th>Entity Type</th>
                  <th>Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <strong>{log.actorUserId?.fullName || 'System User'}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.actorUserId?.email}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: log.action.includes('APPROVE')
                            ? '#ecfdf5'
                            : log.action.includes('REJECT')
                            ? '#fef2f2'
                            : '#eff6ff',
                          color: log.action.includes('APPROVE')
                            ? '#047857'
                            : log.action.includes('REJECT')
                            ? '#b91c1c'
                            : '#1d4ed8',
                          border: '1px solid rgba(0,0,0,0.05)'
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#475569' }}>{log.entityType}</span>
                    </td>
                    <td>
                      <pre style={{ fontSize: '0.75rem', background: '#f8fafc', padding: '0.4rem', borderRadius: '4px', maxWidth: '300px', overflowX: 'auto' }}>
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{log.ipAddress || '127.0.0.1'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination pagination={pagination} onPageChange={(p) => fetchAuditLogs(p)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogPage;
