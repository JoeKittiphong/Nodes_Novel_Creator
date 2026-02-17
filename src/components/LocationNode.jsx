import React, { useRef, useEffect, memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import AttachedStatuses from './AttachedStatuses';

const LocationNode = ({ data, selected }) => {
    const textareaRef = useRef(null);
    const containerRef = useRef(null);
    const lastHeightRef = useRef(0);

    // Auto-expand textarea height
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [data.description]);

    // Handle Dynamic Height Push
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const newHeight = entry.contentRect.height;
                if (lastHeightRef.current > 0 && newHeight !== lastHeightRef.current) {
                    const dy = newHeight - lastHeightRef.current;
                    if (Math.abs(dy) > 0.5) {
                        data.onHeightChange(data.id, dy);
                    }
                }
                lastHeightRef.current = newHeight;
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [data.id, data.onHeightChange]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                data.onUpdate(data.id, 'imageUrl', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div ref={containerRef} style={{
            padding: '12px',
            borderRadius: '0 20px 0 20px', // Unique shape for locations
            background: '#1e1e1e',
            color: '#fff',
            border: selected ? `2px solid ${data.color || '#a855f7'}` : '1px solid #444',
            width: '250px',
            minHeight: '75px',
            boxShadow: selected ? `0 0 20px ${(data.color || '#a855f7')}66` : '0 4px 10px rgba(0,0,0,0.3)',
            position: 'relative',
            transition: 'border 0.2s, box-shadow 0.2s',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
        }}>
            {/* Delete Button */}
            <button
                onClick={(e) => { e.stopPropagation(); data.onDelete(data.id); }}
                style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    display: selected ? 'flex' : 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    zIndex: 10
                }}
            >
                ✕
            </button>

            {/* Icon/Avatar Section */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
                <div
                    onClick={() => document.getElementById(`file-loc-${data.id}`).click()}
                    style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        backgroundColor: data.imageUrl ? 'transparent' : (data.color || '#a855f7'),
                        border: `2px solid ${data.color || '#a855f7'}`,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    {data.imageUrl ? (
                        <img src={data.imageUrl} alt={data.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <span style={{ fontSize: '1.4rem' }}>🏠</span>
                    )}
                </div>
                <input
                    id={`file-loc-${data.id}`}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                />

                {/* Color Picker Dot */}
                <input
                    type="color"
                    value={data.color || '#a855f7'}
                    onChange={(e) => data.onUpdate(data.id, 'color', e.target.value)}
                    style={{
                        position: 'absolute',
                        bottom: -4,
                        right: -4,
                        width: '18px',
                        height: '18px',
                        padding: 0,
                        border: '2px solid #1e1e1e',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        overflow: 'hidden'
                    }}
                />
            </div>

            {/* Content Section */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input
                        value={data.name}
                        onChange={(e) => data.onUpdate(data.id, 'name', e.target.value)}
                        onPointerDown={(e) => e.stopPropagation()}
                        placeholder="ชื่อสถานที่..."
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            outline: 'none',
                            padding: '1px 0'
                        }}
                    />
                    <span style={{
                        fontSize: '0.6rem',
                        color: (data.color || '#a855f7'),
                        opacity: 0.6,
                        border: `1px solid ${(data.color || '#a855f7')}66`,
                        padding: '1px 3px',
                        borderRadius: '3px',
                        whiteSpace: 'nowrap'
                    }}>สำเนา</span>
                </div>
                <textarea
                    ref={textareaRef}
                    value={data.description || ''}
                    onChange={(e) => data.onUpdate(data.id, 'description', e.target.value)}
                    onPointerDown={(e) => e.stopPropagation()}
                    placeholder="รายละเอียดสถานที่..."
                    style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: '#999',
                        fontSize: '0.85rem',
                        lineHeight: '1.4',
                        padding: '0',
                        resize: 'none',
                        outline: 'none',
                        overflow: 'hidden',
                        minHeight: '25px'
                    }}
                />
            </div>

            {/* Attached Status Tags */}
            <AttachedStatuses statuses={data.attachedStatuses} onDetach={data.onDetachStatus} />

            {/* Connection Handles */}
            <Handle type="target" position={Position.Top} id="loc-target" style={{ background: data.color || '#a855f7' }} />
            <Handle type="source" position={Position.Right} id="loc-source" style={{ background: data.color || '#a855f7' }} />
            <Handle type="source" position={Position.Left} id="loc-source" style={{ background: data.color || '#a855f7' }} />
        </div>
    );
};

export default memo(LocationNode);
