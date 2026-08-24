import React from 'react';

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total } = pagination;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        marginTop: '1.25rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e2e8f0'
      }}
    >
      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
        Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total records)
      </span>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          className="btn btn-secondary btn-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <button
          className="btn btn-secondary btn-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
