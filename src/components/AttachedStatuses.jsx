import React, { memo } from 'react';

/**
 * Renders attached status tags at the bottom of a parent node.
 * Each tag has a detach button that calls onDetach with the status data.
 */
const AttachedStatuses = ({ statuses = [], onDetach }) => {
    if (!statuses || statuses.length === 0) return null;

    return (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid #333'
        }}>
            {statuses.map((st, idx) => (
                <div
                    key={st.id || idx}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.6rem',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        background: `${st.color || '#f472b6'}18`,
                        border: `1px solid ${st.color || '#f472b6'}55`,
                        color: st.color || '#f472b6',
                        maxWidth: '100%'
                    }}
                >
                    <span>🏷️</span>
                    <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>{st.name || 'สถานะ'}</span>
                    {st.description && (
                        <span style={{ color: '#888', fontSize: '0.55rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px' }}>
                            {st.description}
                        </span>
                    )}
                    {onDetach && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDetach(st, idx); }}
                            onPointerDown={(e) => e.stopPropagation()}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#666',
                                cursor: 'pointer',
                                fontSize: '0.55rem',
                                padding: '0 1px',
                                lineHeight: 1
                            }}
                            title="แยกออก"
                        >✕</button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default memo(AttachedStatuses);
