import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';

const MembersList = () => {
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMembers = async (page = 1, searchQuery = search, status = statusFilter) => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams({ page, limit: 10 });
      if (searchQuery) queryParams.append('search', searchQuery);
      if (status) queryParams.append('status', status);

      const res = await api.get(`/members?${queryParams.toString()}`);
      if (res.success) {
        setMembers(res.data.members || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load member directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers(1, search, statusFilter);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMembers(1, search, statusFilter);
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/members/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `members_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export CSV: ' + (err.message || 'Error occurred'));
    }
  };

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="card-title" style={{ marginBottom: '0.2rem' }}>
              Official Member Directory
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Browse, search, and manage registered members
            </p>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            📥 Export CSV
          </button>
        </div>

        {/* SEARCH AND FILTER BAR */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by member name, email, or membership #"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ width: '160px' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>

        {error && <div className="alert alert-danger" style={{ marginTop: '1rem' }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>Loading member directory...</div>
        ) : members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>No members found matching your search.</div>
        ) : (
          <div className="table-responsive" style={{ marginTop: '1rem' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Membership #</th>
                  <th>Member Name / Company</th>
                  <th>Email</th>
                  <th>Tier</th>
                  <th>Annual Fee</th>
                  <th>Status</th>
                  <th>Member Since</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const app = m.applicationId || {};
                  const user = m.userId || {};
                  const displayName = app.applicantType === 'COMPANY' ? app.companyName : (app.fullName || user.fullName);

                  return (
                    <tr key={m._id}>
                      <td>
                        <strong style={{ color: '#059669' }}>{m.membershipNumber}</strong>
                      </td>
                      <td>{displayName}</td>
                      <td>{user.email || app.email}</td>
                      <td>{m.membershipTypeId?.name || 'Standard'}</td>
                      <td>LKR {m.membershipTypeId?.annualFee?.toLocaleString() || 0}</td>
                      <td>
                        <StatusBadge status={m.status} />
                      </td>
                      <td>{new Date(m.startDate).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <Pagination pagination={pagination} onPageChange={(p) => fetchMembers(p, search, statusFilter)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersList;
