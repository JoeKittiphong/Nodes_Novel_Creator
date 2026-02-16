import React, { memo } from 'react';
import { NodeResizer } from '@xyflow/react';

const GroupNode = ({ data, selected }) => {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: selected ? '2px solid #fbbf24' : '1px dashed #555',
            borderRadius: '15px',
            position: 'relative',
            transition: 'background 0.3s',
            backdropFilter: 'blur(2px)'
        }}>
            <NodeResizer
                color="#fbbf24"
                isVisible={selected}
                minWidth={200}
                minHeight={150}
            />

            <div
                className="custom-drag-handle"
                style={{
                    position: 'absolute',
                    top: '-28px',
                    left: '0',
                    background: selected ? '#fbbf24' : '#333',
                    color: selected ? '#000' : '#888',
                    padding: '2px 10px',
                    borderRadius: '6px 6px 0 0',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'grab'
                }}
            >
                <span style={{ fontSize: '0.9rem' }}>📦</span>
                <input
                    value={data.label || 'กลุ่มใหม่'}
                    onChange={(e) => data.onUpdate(data.id, 'label', e.target.value)}
                    onPointerDown={(e) => e.stopPropagation()}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'inherit',
                        fontWeight: 'bold',
                        outline: 'none',
                        width: '120px'
                    }}
                />
            </div>

            {/* Delete Button */}
            <button
                onClick={(e) => { e.stopPropagation(); data.onDelete(data.id); }}
                style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '-15px',
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    display: selected ? 'flex' : 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    zIndex: 10,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                }}
            >
                ✕
            </button>
        </div>
    );
};

export default memo(GroupNode);
