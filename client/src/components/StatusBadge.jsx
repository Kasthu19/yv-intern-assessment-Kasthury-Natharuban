import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;
  const upperStatus = status.toUpperCase();

  let badgeClass = 'badge-pending';
  if (['APPROVED', 'ACTIVE'].includes(upperStatus)) {
    badgeClass = 'badge-approved';
  } else if (['REJECTED', 'EXPIRED'].includes(upperStatus)) {
    badgeClass = 'badge-rejected';
  }

  return <span className={`badge ${badgeClass}`}>{upperStatus}</span>;
};

export default StatusBadge;
