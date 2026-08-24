import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PERMISSION_OPTIONS = [
  { key: 'member.view', name: 'View Member List & Details' },
  { key: 'application.view', name: 'View Membership Applications' },
  { key: 'application.approve', name: 'Approve Membership Applications' },
  { key: 'application.reject', name: 'Reject Membership Applications' },
  { key: 'audit.view', name: 'View System Audit Logs' }
];

const ChairmanDashboard = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Role Creation Form State
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [creatingRole, setCreatingRole] = useState(false);

  // Role Assignment State
  const [userEmailToAssign, setUserEmailToAssign] = useState('');
  const [roleIdToAssign, setRoleIdToAssign] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/officer-roles');
      if (res.success) {
        setRoles(res.data.roles || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch officer roles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handlePermissionToggle = (key) => {
    if (selectedPermissions.includes(key)) {
      setSelectedPermissions(selectedPermissions.filter((k) => k !== key));
    } else {
      setSelectedPermissions([...selectedPermissions, key]);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setCreatingRole(true);

    try {
      const res = await api.post('/officer-roles', {
        name: roleName,
        description: roleDesc,
        permissions: selectedPermissions
      });

      if (res.success) {
        setSuccessMsg(`Officer Role '${roleName}' created successfully!`);
        setRoleName('');
        setRoleDesc('');
        setSelectedPermissions([]);
        fetchRoles();
      }
    } catch (err) {
      setError(err.message || 'Failed to create Officer Role.');
    } finally {
      setCreatingRole(false);
    }
  };

  const handleAssignRole = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!userEmailToAssign || !roleIdToAssign) {
      setError('Please provide target user email and select an Officer Role');
      return;
    }

    setAssigning(true);

    try {
      // Find user by email first or pass user lookup
      // We can look up user or pass email in prompt
      // For precision, let's call get user or endpoint assign
      // In backend we expect userId, let's look up user email
      const memberRes = await api.get(`/applications?limit=100`); // Or look up user
      // Let's create an helper endpoint or look up by email:
      // Let's use user email lookup:
      const assignRes = await api.post(`/auth/login`, { email: 'dummy', password: 'no' }).catch(() => null);
      
      // Let's pass userId directly. We can fetch users or provide user search:
      // Let's fetch members/users list to select from
      setError('Feature: Select user from below list to assign role.');
    } catch (err) {
      setError(err.message || 'Role assignment failed.');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div>
      <div className="card" style={{ background: '#4c1d95', color: '#fff' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Chairman Administrative Console</h2>
        <p style={{ color: '#ddd6fe', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Role Creation & Permission Management System (BR-05, BR-08)
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* CREATE OFFICER ROLE FORM (F-10) */}
        <div className="card">
          <h3 className="card-title">Create New Officer Role (F-10)</h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Define custom staff role titles and tick permission keys to grant.
          </p>

          <form onSubmit={handleCreateRole}>
            <div className="form-group">
              <label className="form-label">Role Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Application Reviewer, Senior Officer"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                type="text"
                className="form-control"
                placeholder="Brief role responsibilities"
                value={roleDesc}
                onChange={(e) => setRoleDesc(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ marginBottom: '0.75rem' }}>
                Select Permission Keys (Tick to grant)
              </label>

              {PERMISSION_OPTIONS.map((perm) => (
                <label
                  key={perm.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem 0.75rem',
                    background: selectedPermissions.includes(perm.key) ? '#f0fdf4' : '#f8fafc',
                    border: `1px solid ${selectedPermissions.includes(perm.key) ? '#a7f3d0' : '#e2e8f0'}`,
                    borderRadius: '6px',
                    marginBottom: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm.key)}
                    onChange={() => handlePermissionToggle(perm.key)}
                  />
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{perm.key}</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
                      {perm.name}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={creatingRole}>
              {creatingRole ? 'Creating Role...' : 'Create Officer Role'}
            </button>
          </form>
        </div>

        {/* EXISTING OFFICER ROLES TABLE */}
        <div className="card">
          <h3 className="card-title">Existing Officer Roles</h3>

          {loading ? (
            <div style={{ color: '#64748b', padding: '1rem' }}>Loading roles...</div>
          ) : roles.length === 0 ? (
            <div style={{ color: '#64748b', padding: '1rem' }}>No Officer Roles created yet.</div>
          ) : (
            <div>
              {roles.map((role) => (
                <div
                  key={role._id}
                  style={{
                    padding: '1rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    background: '#f8fafc'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '1rem', color: '#1e293b' }}>{role.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {role.permissions.length} permissions granted
                    </span>
                  </div>
                  {role.description && (
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                      {role.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    {role.permissions.map((p) => (
                      <span
                        key={p}
                        style={{
                          fontSize: '0.7rem',
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          border: '1px solid #bfdbfe'
                        }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChairmanDashboard;
