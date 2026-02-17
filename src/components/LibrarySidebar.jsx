import React, { useState, useMemo } from 'react';

const SECTIONS = [
    { key: 'characters', emoji: '👤', label: 'ตัวละคร', color: '#3b82f6' },
    { key: 'locations', emoji: '📍', label: 'สถานที่', color: '#a855f7' },
    { key: 'items', emoji: '📦', label: 'สิ่งของ', color: '#f59e0b' },
    { key: 'statuses', emoji: '🏷️', label: 'สถานะ', color: '#f472b6' },
];

const LibrarySidebar = ({
    characters, items, locations, statuses,
    addCharacter, addCharacterInstance,
    addItem, addItemInstance,
    addLocation, addLocationInstance,
    addStatus, addStatusInstance,
    isCollapsed, onToggleCollapse
}) => {
    const [search, setSearch] = useState('');
    const [expandedSections, setExpandedSections] = useState({
        characters: true, locations: true, items: true, statuses: true
    });

    const toggleSection = (key) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Map section keys to data and actions
    const sectionData = useMemo(() => ({
        characters: {
            items: characters,
            addNew: addCharacter,
            addInstance: addCharacterInstance,
            getId: (c) => c.id,
        },
        locations: {
            items: locations,
            addNew: addLocation,
            addInstance: addLocationInstance,
            getId: (l) => l.id,
        },
        items: {
            items: items,
            addNew: addItem,
            addInstance: addItemInstance,
            getId: (i) => i.id,
        },
        statuses: {
            items: statuses,
            addNew: addStatus,
            addInstance: addStatusInstance,
            getId: (s) => s.id,
        },
    }), [characters, items, locations, statuses, addCharacter, addCharacterInstance, addItem, addItemInstance, addLocation, addLocationInstance, addStatus, addStatusInstance]);

    // Filter by search
    const filterItems = (list) => {
        if (!search.trim()) return list;
        const q = search.toLowerCase();
        return list.filter(item => (item.name || '').toLowerCase().includes(q));
    };

    if (isCollapsed) {
        return (
            <div style={{
                width: '40px',
                background: 'rgba(20, 20, 20, 0.95)',
                borderRight: '1px solid #333',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: '8px',
                gap: '8px'
            }}>
                <button
                    onClick={onToggleCollapse}
                    title="เปิด Library"
                    style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '1rem', padding: '4px' }}
                >📚</button>
                <div style={{ width: '20px', height: '1px', background: '#333' }} />
                {SECTIONS.map(sec => (
                    <span key={sec.key} title={sec.label} style={{ fontSize: '0.9rem', cursor: 'default' }}>{sec.emoji}</span>
                ))}
            </div>
        );
    }

    return (
        <div style={{
            width: '220px',
            background: 'rgba(20, 20, 20, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRight: '1px solid #333',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            flexShrink: 0
        }}>
            {/* Header */}
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                    onClick={onToggleCollapse}
                    style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '0.9rem', padding: '2px' }}
                >◀</button>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ccc', flex: 1 }}>📚 Library</span>
            </div>

            {/* Search */}
            <div style={{ padding: '8px 12px' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="🔍 ค้นหา..."
                    style={{
                        width: '100%',
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '6px',
                        color: '#ccc',
                        padding: '5px 8px',
                        fontSize: '0.75rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                    }}
                />
            </div>

            {/* Sections */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 12px 0' }}>
                {SECTIONS.map(sec => {
                    const data = sectionData[sec.key];
                    const filtered = filterItems(data.items);
                    const isExpanded = expandedSections[sec.key];
                    const count = data.items.length;

                    return (
                        <div key={sec.key} style={{ borderBottom: '1px solid #222' }}>
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(sec.key)}
                                style={{
                                    width: '100%',
                                    background: 'none',
                                    border: 'none',
                                    color: sec.color,
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.78rem',
                                    fontWeight: 'bold',
                                    textAlign: 'left'
                                }}
                            >
                                <span style={{ fontSize: '0.6rem', color: '#666', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                                <span>{sec.emoji}</span>
                                <span style={{ flex: 1 }}>{sec.label}</span>
                                <span style={{ fontSize: '0.6rem', color: '#555', fontWeight: 'normal' }}>{count}</span>
                            </button>

                            {/* Section Content */}
                            {isExpanded && (
                                <div style={{ padding: '0 8px 6px 8px' }}>
                                    {filtered.length === 0 && search.trim() && (
                                        <p style={{ color: '#555', fontSize: '0.65rem', textAlign: 'center', margin: '4px 0' }}>ไม่พบ</p>
                                    )}

                                    {filtered.map(entity => (
                                        <div
                                            key={entity.id}
                                            onClick={() => data.addInstance(entity.id)}
                                            title={`คลิกเพื่อเพิ่ม "${entity.name}" ลงบน canvas`}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '5px 8px',
                                                marginBottom: '2px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                transition: 'background 0.15s',
                                                background: 'transparent'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            {/* Color indicator */}
                                            {entity.imageUrl ? (
                                                <img src={entity.imageUrl} alt="" style={{ width: '22px', height: '22px', borderRadius: sec.key === 'characters' ? '50%' : '4px', objectFit: 'cover', border: `2px solid ${entity.color}`, flexShrink: 0 }} />
                                            ) : (
                                                <div style={{
                                                    width: '22px',
                                                    height: '22px',
                                                    borderRadius: sec.key === 'characters' ? '50%' : sec.key === 'statuses' ? '11px' : '4px',
                                                    background: `${entity.color}33`,
                                                    border: `2px solid ${entity.color}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    <span style={{ fontSize: '0.6rem' }}>{sec.emoji}</span>
                                                </div>
                                            )}

                                            {/* Name + description */}
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#ddd', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {entity.name}
                                                </div>
                                                {entity.description && (
                                                    <div style={{ fontSize: '0.6rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {entity.description}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Add indicator */}
                                            <span style={{ fontSize: '0.65rem', color: '#555', flexShrink: 0 }}>+</span>
                                        </div>
                                    ))}

                                    {/* Add new button */}
                                    <button
                                        onClick={data.addNew}
                                        style={{
                                            width: '100%',
                                            background: 'transparent',
                                            border: '1px dashed #333',
                                            borderRadius: '6px',
                                            color: '#555',
                                            padding: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.7rem',
                                            marginTop: '2px',
                                            transition: 'border-color 0.15s, color 0.15s'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = sec.color; e.currentTarget.style.color = sec.color; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#555'; }}
                                    >
                                        + สร้าง{sec.label}ใหม่
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LibrarySidebar;
