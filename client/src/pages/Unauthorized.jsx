import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ fontSize: '3rem', color: '#dc2626', marginBottom: '0.5rem' }}>⚠️</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>403 Forbidden</h2>
        <p style={{ color: '#64748b', margin: '0.75rem 0 1.5rem' }}>
          Access Denied. You do not possess the required permission key to access this action or page (Section 8 BR-12).
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
