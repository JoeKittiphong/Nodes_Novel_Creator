import React, { useRef, useEffect, memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const StatusNode = ({ data, selected }) => {
    const textareaRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [data.description]);

    const nodeColor = data.color || '#f472b6';

    return (
        <div style={{
            padding: '8px 14px',
            borderRadius: '20px',
            background: '#1e1e1e',
            color: '#fff',
            border: selected ? `2px solid ${nodeColor}` : '1px solid #444',
            width: '200px',
            minHeight: '40px',
            boxShadow: selected ? `0 0 12px ${nodeColor}44` : '0 2px 6px rgba(0,0,0,0.3)',
            position: 'relative',
            transition: 'border 0.2s, box-shadow 0.2s',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
        }}>
            {/* Delete Button */}
            <button
                onClick={(e) => { e.stopPropagation(); data.onDelete(data.id); }}
                style={{
                    position: 'absolute', top: '-8px', right: '-8px',
                    background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%',
                    width: '18px', height: '18px', cursor: 'pointer',
                    display: selected ? 'flex' : 'none',
                    alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', zIndex: 10
                }}
            >✕</button>

            {/* Header: emoji + name + color picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.9rem' }}>🏷️</span>
                <input
                    value={data.name || ''}
                    onChange={(e) => data.onUpdate(data.id, 'name', e.target.value)}
                    onPointerDown={(e) => e.stopPropagation()}
                    placeholder="สถานะ..."
                    style={{
                        flex: 1, background: 'transparent', border: 'none',
                        color: nodeColor, fontWeight: 'bold', fontSize: '0.85rem',
                        outline: 'none', padding: '1px 0'
                    }}
                />
                <input
                    type="color" value={nodeColor}
                    onChange={(e) => data.onUpdate(data.id, 'color', e.target.value)}
                    style={{
                        width: '14px', height: '14px', padding: 0,
                        border: '2px solid #333', borderRadius: '50%',
                        cursor: 'pointer', overflow: 'hidden', flexShrink: 0
                    }}
                />
            </div>

            {/* Description */}
            <textarea
                ref={textareaRef}
                value={data.description || ''}
                onChange={(e) => data.onUpdate(data.id, 'description', e.target.value)}
                onPointerDown={(e) => e.stopPropagation()}
                placeholder="รายละเอียด..."
                style={{
                    width: '100%', background: 'transparent', border: 'none',
                    color: '#999', fontSize: '0.7rem', lineHeight: '1.3',
                    padding: '0', resize: 'none', outline: 'none',
                    overflow: 'hidden', minHeight: '14px'
                }}
            />

            {/* Connection Handles — can connect to any node */}
            <Handle type="source" position={Position.Right} id="status-source" style={{ background: nodeColor, width: '8px', height: '8px', border: 'none' }} />
            <Handle type="source" position={Position.Left} id="status-source-L" style={{ background: nodeColor, width: '8px', height: '8px', border: 'none' }} />
            <Handle type="source" position={Position.Top} id="status-source-T" style={{ background: nodeColor, width: '8px', height: '8px', border: 'none' }} />
            <Handle type="source" position={Position.Bottom} id="status-source-B" style={{ background: nodeColor, width: '8px', height: '8px', border: 'none' }} />
        </div>
    );
};

export default memo(StatusNode);
