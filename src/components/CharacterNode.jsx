import React, { useRef, useEffect, memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const CharacterNode = ({ data, selected }) => {
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

    // Handle Dynamic Height Push (reuse same logic as StoryNode)
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
            padding: '15px',
            borderRadius: '50px 15px 15px 50px', // Unique shape for characters
            background: '#1e1e1e',
            color: '#fff',
            border: selected ? `2px solid ${data.color || '#3b82f6'}` : '1px solid #444',
            width: '260px',
            minHeight: '80px',
            boxShadow: selected ? `0 0 20px ${(data.color || '#3b82f6')}66` : '0 4px 10px rgba(0,0,0,0.3)',
            position: 'relative',
            transition: 'border 0.2s, box-shadow 0.2s',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
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
                    width: '22px',
                    height: '22px',
                    cursor: 'pointer',
                    display: selected ? 'flex' : 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    zIndex: 10
                }}
            >
                ✕
            </button>

            {/* Avatar Section */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
                <div
                    onClick={() => document.getElementById(`file-${data.id}`).click()}
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: data.imageUrl ? 'transparent' : (data.color || '#3b82f6'),
                        border: `3px solid ${data.color || '#3b82f6'}`,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}
                >
                    {data.imageUrl ? (
                        <img src={data.imageUrl} alt={data.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <span style={{ fontSize: '1.5rem' }}>👤</span>
                    )}
                </div>
                <input
                    id={`file-${data.id}`}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                />

                {/* Color Picker Dot */}
                <input
                    type="color"
                    value={data.color || '#3b82f6'}
                    onChange={(e) => data.onUpdate(data.id, 'color', e.target.value)}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '20px',
                        height: '20px',
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
                        placeholder="ชื่อตัวละคร..."
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            outline: 'none',
                            padding: '2px 0'
                        }}
                    />
                    <span style={{
                        fontSize: '0.65rem',
                        color: (data.color || '#3b82f6'),
                        opacity: 0.6,
                        border: `1px solid ${(data.color || '#3b82f6')}66`,
                        padding: '1px 4px',
                        borderRadius: '4px',
                        fontWeight: 'normal',
                        whiteSpace: 'nowrap'
                    }}>ตังสำเนา</span>
                </div>
                <textarea
                    ref={textareaRef}
                    value={data.description || ''}
                    onChange={(e) => data.onUpdate(data.id, 'description', e.target.value)}
                    onPointerDown={(e) => e.stopPropagation()}
                    placeholder="รายละเอียดตัวละคร..."
                    style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: '#aaa',
                        fontSize: '0.85rem',
                        lineHeight: '1.4',
                        padding: '0',
                        resize: 'none',
                        outline: 'none',
                        overflow: 'hidden',
                        minHeight: '30px'
                    }}
                />
            </div>

            {/* Connection Handles */}
            <Handle type="target" position={Position.Top} id="char-target" style={{ background: data.color || '#3b82f6' }} />
            <Handle type="source" position={Position.Right} id="char-source" style={{ background: data.color || '#3b82f6' }} />
            <Handle type="source" position={Position.Left} id="char-source" style={{ background: data.color || '#3b82f6' }} />
        </div>
    );
};

export default memo(CharacterNode);
