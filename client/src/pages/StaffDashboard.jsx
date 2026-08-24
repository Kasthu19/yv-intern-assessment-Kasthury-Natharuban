import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';

const StaffDashboard = () => {
  const { hasPermission } = useAuth();
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);

  // Approval Modal State
  const [selectedAppToApprove, setSelectedAppToApprove] = useState(null);
  const [approving, setApproving] = useState(false);

  // Rejection Modal State
  const [selectedAppToReject, setSelectedAppToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const fetchApplications = async (page = 1, status = statusFilter) => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams({ page, limit: 10 });
      if (status && status !== 'ALL') {
        queryParams.append('status', status);
      }

      const res = await api.get(`/applications?${queryParams.toString()}`);
      if (res.success) {
        setApplications(res.data.applications || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(1, statusFilter);
  }, [statusFilter]);

  const handleApprove = async () => {
    if (!selectedAppToApprove) return;
    setApproving(true);
    setError(null);

    try {
      const res = await api.patch(`/applications/${selectedAppToApprove._id}/approve`);
      if (res.success) {
        setActionSuccessMsg(`Application approved! Generated Membership #: ${res.data.membership.membershipNumber}`);
        setSelectedAppToApprove(null);
        fetchApplications(pagination.page, statusFilter);
      }
    } catch (err) {
      setError(err.message || 'Approval failed.');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedAppToReject || !rejectionReason.trim()) return;
    setRejecting(true);
    setError(null);

    try {
      const res = await api.patch(`/applications/${selectedAppToReject._id}/reject`, {
        reason: rejectionReason
      });
      if (res.success) {
        setActionSuccessMsg('Application rejected successfully.');
        setSelectedAppToReject(null);
        setRejectionReason('');
        fetchApplications(pagination.page, statusFilter);
      }
    } catch (err) {
      setError(err.message || 'Rejection failed.');
    } finally {
      setRejecting(false);
    }
  };

  const canApprove = hasPermission('application.approve');
  const canReject = hasPermission('application.reject');

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="card-title" style={{ marginBottom: '0.2rem' }}>
              Membership Applications Review
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Review, approve or reject incoming membership applications
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((st) => (
              <button
                key={st}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {actionSuccessMsg && (
          <div className="alert alert-success" style={{ marginTop: '1rem' }}>
            {actionSuccessMsg}
          </div>
        )}

        {error && (
          <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading applications...</div>
        ) : applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
            No {statusFilter !== 'ALL' ? statusFilter : ''} applications found.
          </div>
        ) : (
          <div className="table-responsive" style={{ marginTop: '1rem' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Applicant Name / Company</th>
                  <th>Type</th>
                  <th>NIC / Reg No</th>
                  <th>Contact Info</th>
                  <th>Tier Applied</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const displayName = app.applicantType === 'COMPANY' ? app.companyName : (app.fullName || app.userId?.fullName);
                  const identifier = app.applicantType === 'COMPANY' ? app.registrationNo : app.nic;

                  return (
                    <tr key={app._id}>
                      <td>
                        <strong>{displayName}</strong>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                          {app.applicantType}
                        </span>
                      </td>
                      <td>{identifier}</td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{app.email}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.phone}</div>
                      </td>
                      <td>{app.membershipTypeId?.name || 'N/A'}</td>
                      <td>
                        <StatusBadge status={app.status} />
                      </td>
                      <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td>
                        {app.status === 'PENDING' ? (
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            {canApprove && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setSelectedAppToApprove(app)}
                              >
                                Approve
                              </button>
                            )}

                            {canReject && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => {
                                  setSelectedAppToReject(app);
                                  setRejectionReason('');
                                }}
                              >
                                Reject
                              </button>
                            )}

                            {!canApprove && !canReject && (
                              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>View Only</span>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Reviewed by {app.reviewedBy?.fullName || 'Staff'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <Pagination pagination={pagination} onPageChange={(p) => fetchApplications(p, statusFilter)} />
          </div>
        )}
      </div>

      {/* APPROVAL CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={!!selectedAppToApprove}
        title="Approve Membership Application"
        confirmText="Approve & Generate Membership #"
        confirmVariant="primary"
        loading={approving}
        onConfirm={handleApprove}
        onCancel={() => setSelectedAppToApprove(null)}
      >
        <p>Are you sure you want to approve this membership application?</p>
        {selectedAppToApprove && (
          <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', marginTop: '0.75rem', fontSize: '0.9rem' }}>
            <p><strong>Applicant:</strong> {selectedAppToApprove.applicantType === 'COMPANY' ? selectedAppToApprove.companyName : selectedAppToApprove.fullName}</p>
            <p><strong>Email:</strong> {selectedAppToApprove.email}</p>
            <p><strong>Tier:</strong> {selectedAppToApprove.membershipTypeId?.name}</p>
          </div>
        )}
      </ConfirmModal>

      {/* REJECTION MODAL */}
      <ConfirmModal
        isOpen={!!selectedAppToReject}
        title="Reject Membership Application"
        confirmText="Reject Application"
        confirmVariant="danger"
        loading={rejecting}
        onConfirm={handleReject}
        onCancel={() => setSelectedAppToReject(null)}
      >
        <p style={{ marginBottom: '0.75rem' }}>Please enter a reason for rejecting this application (BR-08):</p>
        <textarea
          className="form-control"
          rows="3"
          placeholder="Reason for rejection..."
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          required
        />
      </ConfirmModal>
    </div>
  );
};

export default StaffDashboard;
