import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const MemberDashboard = () => {
  const { user } = useAuth();
  const [statusData, setStatusData] = useState(null);
  const [membershipTypes, setMembershipTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isResubmitting, setIsResubmitting] = useState(false);

  // Form State
  const [applicantType, setApplicantType] = useState('INDIVIDUAL');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [companyName, setCompanyName] = useState('');
  const [nic, setNic] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [membershipTypeId, setMembershipTypeId] = useState('');

  const fetchStatusAndTypes = async () => {
    try {
      setLoading(true);
      const [statusRes, typesRes] = await Promise.all([
        api.get('/applications/my-status'),
        api.get('/membership-types')
      ]);

      if (statusRes.success) {
        setStatusData(statusRes.data);
      }
      if (typesRes.success) {
        setMembershipTypes(typesRes.data.membershipTypes || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusAndTypes();
  }, []);

  // Filter membership types available for current applicantType
  const filteredTypes = membershipTypes.filter(t => t.applicableTo === applicantType);

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const payload = {
        applicantType,
        fullName: applicantType === 'INDIVIDUAL' ? fullName : undefined,
        companyName: applicantType === 'COMPANY' ? companyName : undefined,
        nic: applicantType === 'INDIVIDUAL' ? nic : undefined,
        registrationNo: applicantType === 'COMPANY' ? registrationNo : undefined,
        email,
        phone,
        address,
        membershipTypeId
      };

      const res = await api.post('/applications', payload);
      if (res.success) {
        setSuccessMsg('Membership application submitted successfully! Status is now PENDING review.');
        setIsResubmitting(false);
        fetchStatusAndTypes();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading dashboard...</div>;
  }

  const { hasApplication, application, membership } = statusData || {};

  return (
    <div>
      <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Welcome, {user?.fullName}!</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Role: <strong style={{ color: '#38bdf8' }}>{user?.userType}</strong> | Email: {user?.email}
        </p>

        {user?.effectivePermissions && user.effectivePermissions.length > 0 && (
          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
              Granted Permissions ({user.effectivePermissions.length}):
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
              {user.effectivePermissions.map((perm) => (
                <span
                  key={perm}
                  style={{
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    border: '1px solid rgba(56, 189, 248, 0.3)'
                  }}
                >
                  {perm}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ACTIVE MEMBERSHIP DISPLAY */}
      {membership && (
        <div className="card" style={{ borderLeft: '5px solid #059669', background: '#f0fdf4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>
                Verified Official Member
              </span>
              <h3 style={{ fontSize: '1.5rem', color: '#065f46', marginTop: '0.2rem' }}>
                {membership.membershipNumber}
              </h3>
              <p style={{ color: '#047857', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Tier: <strong>{membership.membershipTypeId?.name}</strong> | Status: <StatusBadge status={membership.status} />
              </p>
              <p style={{ color: '#047857', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Active Since: {new Date(membership.startDate).toLocaleDateString()}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669' }}>YV</div>
              <span style={{ fontSize: '0.75rem', color: '#047857' }}>Yarl Ventures</span>
            </div>
          </div>
        </div>
      )}

      {/* CURRENT APPLICATION STATUS CARD */}
      {hasApplication && !isResubmitting && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="card-title" style={{ marginBottom: '0.4rem' }}>
                Application Status
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Applied for: <strong>{application.membershipTypeId?.name}</strong> ({application.applicantType})
              </p>
            </div>
            <div>
              <StatusBadge status={application.status} />
            </div>
          </div>

          <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '6px', fontSize: '0.9rem' }}>
            <p><strong>Submitted Date:</strong> {new Date(application.createdAt).toLocaleString()}</p>
            <p><strong>Email:</strong> {application.email}</p>
            <p><strong>Phone:</strong> {application.phone}</p>
            <p><strong>Address:</strong> {application.address}</p>

            {application.status === 'REJECTED' && (
              <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
                <div>
                  <strong>Rejection Reason:</strong> {application.rejectionReason}
                  <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    You can resubmit a corrected application below (BR-04).
                  </p>
                </div>
              </div>
            )}
          </div>

          {application.status === 'REJECTED' && (
            <button
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
              onClick={() => setIsResubmitting(true)}
            >
              Resubmit Corrected Application
            </button>
          )}
        </div>
      )}

      {/* APPLICATION SUBMISSION FORM */}
      {(!hasApplication || isResubmitting) && (
        <div className="card">
          <h3 className="card-title">
            {isResubmitting ? 'Resubmit Membership Application' : 'Submit Membership Application'}
          </h3>

          {error && <div className="alert alert-danger">{error}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          <form onSubmit={handleSubmitApplication}>
            {/* Applicant Type Selection (BR-01) */}
            <div className="form-group">
              <label className="form-label">Applicant Type (BR-01)</label>
              <select
                className="form-select"
                value={applicantType}
                onChange={(e) => {
                  setApplicantType(e.target.value);
                  setMembershipTypeId('');
                }}
              >
                <option value="INDIVIDUAL">INDIVIDUAL (Person)</option>
                <option value="COMPANY">COMPANY (Business / Corporate)</option>
              </select>
            </div>

            {/* Dynamic Name Field */}
            {applicantType === 'INDIVIDUAL' ? (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nimal Perera"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Yarl Tech Solutions (PVT) Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Dynamic ID / Reg No Field */}
            {applicantType === 'INDIVIDUAL' ? (
              <div className="form-group">
                <label className="form-label">NIC Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="199512345678 or 951234567V"
                  value={nic}
                  onChange={(e) => setNic(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Business Registration Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="PV-123456"
                  value={registrationNo}
                  onChange={(e) => setRegistrationNo(e.target.value)}
                  required
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="applicant@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number (Sri Lankan)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="0771234567 or +94771234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <span className="form-text">Format: 0771234567 or +94771234567</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Street address, City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                maxLength={250}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Membership Type Tier</label>
              <select
                className="form-select"
                value={membershipTypeId}
                onChange={(e) => setMembershipTypeId(e.target.value)}
                required
              >
                <option value="">-- Select Membership Tier --</option>
                {filteredTypes.map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.name} — LKR {type.annualFee.toLocaleString()} / year
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting Application...' : 'Submit Application'}
              </button>
              {isResubmitting && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsResubmitting(false)}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MemberDashboard;
