import React from 'react';

const SidebarLeft = ({
    characters,
    addEvent,
    isSelectionMode,
    setIsSelectionMode,
    addCharacter,
    editingCharId,
    setEditingCharId,
    setSelectedNodeId,
    setSelectedEdgeId
}) => {
    return (
        <div style={{ width: '280px', background: '#1e1e1e', padding: '20px', borderRight: '1px solid #333', overflowY: 'auto' }}>
            {/* Story Controls */}
            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '15px', color: '#60a5fa' }}>📖 Story Tools</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                        onClick={addEvent}
                        style={{ width: '100%', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', padding: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        + เพิ่มเหตุการณ์ (Event)
                    </button>
                    <button
                        onClick={() => setIsSelectionMode(!isSelectionMode)}
                        style={{
                            width: '100%',
                            background: isSelectionMode ? '#fbbf24' : '#333',
                            color: isSelectionMode ? '#000' : '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '10px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: '0.2s'
                        }}
                    >
                        {isSelectionMode ? '🔦 โหมดลากครอบ (เปิดอยู่)' : '🖱️ โหมดปกติ (Pan)'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>🎭 Characters</h3>
                <button
                    onClick={addCharacter}
                    style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                    + เพิ่ม
                </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {characters.map(char => (
                    <div
                        key={char.id}
                        onClick={() => { setEditingCharId(char.id); setSelectedNodeId(null); setSelectedEdgeId(null); }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px',
                            background: editingCharId === char.id ? '#3b82f633' : '#2d2d2d',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            border: editingCharId === char.id ? '1px solid #3b82f6' : '1px solid transparent'
                        }}
                    >
                        <div style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            background: char.imageUrl ? 'transparent' : char.color,
                            flexShrink: 0,
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #444'
                        }}>
                            {char.imageUrl ? (
                                <img src={char.imageUrl} alt={char.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : null}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <span>{char.name}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SidebarLeft;
