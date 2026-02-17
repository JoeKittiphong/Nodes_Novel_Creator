import React, { useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import AttachedStatuses from './AttachedStatuses';

const StoryNode = ({ data, selected }) => {
    const textareaRef = useRef(null);
    const containerRef = useRef(null);
    const lastHeightRef = useRef(0);

    const levelConfigs = {
        main: { width: '340px', color: '#60a5fa', titleSize: '1.3rem', shadow: '0 0 25px rgba(96, 165, 250, 0.5)', label: 'เหตุการณ์หลัก' },
        secondary: { width: '280px', color: '#4ade80', titleSize: '1.1rem', shadow: '0 4px 10px rgba(0,0,0,0.3)', label: 'เหตุการณ์รอง' },
        sub: { width: '240px', color: '#94a3b8', titleSize: '0.95rem', shadow: '0 2px 5px rgba(0,0,0,0.2)', label: 'เหตุการณ์ย่อย' }
    };

    const config = levelConfigs[data.level] || levelConfigs.secondary;

    // Auto-expand textarea height
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [data.summary, data.level]); // Level change might affect expansion

    // Handle Dynamic Height Push
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const newHeight = entry.contentRect.height;
                if (lastHeightRef.current > 0 && newHeight !== lastHeightRef.current) {
                    const dy = newHeight - lastHeightRef.current;
                    if (Math.abs(dy) > 0.5) data.onHeightChange(data.id, dy);
                }
                lastHeightRef.current = newHeight;
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [data.id, data.onHeightChange]);

    return (
        <div ref={containerRef} style={{
            padding: '15px',
            borderRadius: '12px',
            background: '#2d2d2d',
            color: '#fff',
            border: selected ? `2px solid ${config.color}` : '1px solid #444',
            width: config.width,
            minHeight: '120px',
            boxShadow: selected ? config.shadow : '0 4px 10px rgba(0,0,0,0.3)',
            position: 'relative',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Level Switcher */}
            <div style={{
                position: 'absolute',
                top: '-25px',
                left: '0',
                display: 'flex',
                gap: '5px',
                opacity: selected ? 1 : 0.4,
                transition: '0.2s'
            }}>
                {Object.keys(levelConfigs).map(lv => (
                    <button
                        key={lv}
                        onClick={() => data.onUpdate(data.id, 'level', lv)}
                        style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: data.level === lv ? levelConfigs[lv].color : '#333',
                            color: data.level === lv ? '#000' : '#888',
                            border: 'none',
                            fontSize: '0.65rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            pointerEvents: 'all'
                        }}
                    >
                        {lv.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Delete Button */}
            <button
                onClick={(e) => { e.stopPropagation(); data.onDelete(data.id); }}
                style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '26px',
                    height: '26px',
                    cursor: 'pointer',
                    display: selected ? 'flex' : 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    zIndex: 10,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                }}
            >
                ✕
            </button>

            <Handle type="target" position={Position.Top} id="story-target" style={{ background: config.color, width: '10px', height: '10px', border: 'none' }} />

            {/* Editable Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                    value={data.label}
                    onChange={(e) => data.onUpdate(data.id, 'label', e.target.value)}
                    onPointerDown={(e) => e.stopPropagation()}
                    placeholder="หัวข้อเหตุการณ์..."
                    style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        borderBottom: `1px solid ${config.color}44`,
                        color: config.color,
                        fontWeight: 'bold',
                        fontSize: config.titleSize,
                        marginBottom: '10px',
                        outline: 'none',
                        padding: '4px 0',
                        transition: 'all 0.3s'
                    }}
                />
            </div>

            {/* Editable Summary (Auto-expanding) */}
            <div style={{ flex: 1 }}>
                <textarea
                    ref={textareaRef}
                    value={data.summary || ''}
                    onChange={(e) => data.onUpdate(data.id, 'summary', e.target.value)}
                    onPointerDown={(e) => e.stopPropagation()}
                    placeholder="รายละเอียด..."
                    style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: data.level === 'sub' ? '#888' : '#ccc',
                        fontSize: data.level === 'main' ? '1rem' : '0.9rem',
                        lineHeight: '1.5',
                        padding: '0',
                        resize: 'none',
                        outline: 'none',
                        overflow: 'hidden',
                        minHeight: '40px'
                    }}
                />
            </div>

            {/* Chapter Badge + Write Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                <button
                    onClick={(e) => { e.stopPropagation(); data.onOpenChapterEditor && data.onOpenChapterEditor(data.id); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    style={{
                        background: data.chapters?.length > 0 ? '#60a5fa22' : '#1e1e1e',
                        border: data.chapters?.length > 0 ? '1px solid #60a5fa44' : '1px solid #333',
                        borderRadius: '6px',
                        color: data.chapters?.length > 0 ? '#60a5fa' : '#666',
                        padding: '3px 8px',
                        cursor: 'pointer',
                        fontSize: '0.65rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#60a5fa'; e.currentTarget.style.color = '#60a5fa'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = data.chapters?.length > 0 ? '#60a5fa44' : '#333'; e.currentTarget.style.color = data.chapters?.length > 0 ? '#60a5fa' : '#666'; }}
                >
                    ✏️ เขียนเนื้อหา
                </button>
                {data.chapters?.length > 0 && (
                    <span style={{ fontSize: '0.6rem', color: '#555' }}>
                        {data.chapters.length} ตอน · {data.chapters.reduce((s, ch) => s + (ch.content?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().split(/\s+/).filter(Boolean).length || 0), 0).toLocaleString()} คำ
                    </span>
                )}
            </div>

            {/* Connections Section */}
            {(data.connectedCharacters?.length || data.connectedLocations?.length || data.connectedItems?.length) ? (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginTop: '12px',
                    paddingTop: '10px',
                    borderTop: '1px solid #444',
                    opacity: data.level === 'sub' ? 0.7 : 1
                }}>
                    {/* Characters */}
                    {(data.connectedCharacters && data.connectedCharacters.length > 0) && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                            {data.connectedCharacters.map(char => (
                                <div key={char.id} title={char.name} style={{ width: '24px', height: '24px', borderRadius: '50%', background: char.imageUrl ? 'transparent' : char.color, border: `2px solid ${char.color}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {char.imageUrl ? <img src={char.imageUrl} alt={char.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '0.6rem' }}>👤</span>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Entities Group (Locations/Items) - Compact for Secondary/Sub */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {data.connectedLocations?.map(loc => (
                            <div key={loc.id} title={loc.name} style={{ width: '22px', height: '22px', borderRadius: '4px', background: loc.imageUrl ? 'transparent' : loc.color, border: `1px solid ${loc.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '0.6rem' }}>🏠</span>
                            </div>
                        ))}
                        {data.connectedItems?.map(item => (
                            <div key={item.id} title={item.name} style={{ width: '22px', height: '22px', borderRadius: '4px', background: item.imageUrl ? 'transparent' : item.color, border: `1px solid ${item.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '0.6rem' }}>📦</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {/* Attached Status Tags */}
            <AttachedStatuses statuses={data.attachedStatuses} onDetach={data.onDetachStatus} />

            {/* Side Handles (Left) - Assigned Points (Targets) */}
            <div style={{ position: 'absolute', left: '-22px', top: '25%', transform: 'translateY(-50%)', fontSize: '0.7rem', opacity: 0.7, pointerEvents: 'none' }}>👤</div>
            <Handle type="target" position={Position.Left} id="char-target-L" style={{ top: '25%', background: '#3b82f6', width: '10px', height: '10px', border: 'none' }} />

            <div style={{ position: 'absolute', left: '-22px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', opacity: 0.7, pointerEvents: 'none' }}>📦</div>
            <Handle type="target" position={Position.Left} id="item-target-L" style={{ top: '50%', background: '#f59e0b', width: '10px', height: '10px', border: 'none' }} />

            <div style={{ position: 'absolute', left: '-22px', top: '75%', transform: 'translateY(-50%)', fontSize: '0.7rem', opacity: 0.7, pointerEvents: 'none' }}>🏠</div>
            <Handle type="target" position={Position.Left} id="loc-target-L" style={{ top: '75%', background: '#a855f7', width: '10px', height: '10px', border: 'none' }} />

            {/* Side Handles (Right) - Assigned Points (Sources) */}
            <div style={{ position: 'absolute', right: '-22px', top: '25%', transform: 'translateY(-50%)', fontSize: '0.7rem', opacity: 0.7, pointerEvents: 'none' }}>👤</div>
            <Handle type="source" position={Position.Right} id="char-source-R" style={{ top: '25%', background: '#3b82f6', width: '10px', height: '10px', border: 'none' }} />

            <div style={{ position: 'absolute', right: '-22px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', opacity: 0.7, pointerEvents: 'none' }}>📦</div>
            <Handle type="source" position={Position.Right} id="item-source-R" style={{ top: '50%', background: '#f59e0b', width: '10px', height: '10px', border: 'none' }} />

            <div style={{ position: 'absolute', right: '-22px', top: '75%', transform: 'translateY(-50%)', fontSize: '0.7rem', opacity: 0.7, pointerEvents: 'none' }}>🏠</div>
            <Handle type="source" position={Position.Right} id="loc-source-R" style={{ top: '75%', background: '#a855f7', width: '10px', height: '10px', border: 'none' }} />

            <Handle type="source" position={Position.Bottom} id="story-source" style={{ background: config.color, width: '12px', height: '12px', border: 'none' }} />
        </div>
    );
};

export default StoryNode;
