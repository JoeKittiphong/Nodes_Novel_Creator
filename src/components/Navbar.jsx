import React from 'react';

const Navbar = ({
    characters, items, locations,
    addEvent,
    isSelectionMode, setIsSelectionMode,
    addCharacter, addCharacterInstance,
    addItem, addItemInstance,
    addLocation, addLocationInstance
}) => {
    return (
        <div style={{
            height: '65px',
            background: 'rgba(20, 20, 20, 0.9)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            borderBottom: '1px solid #333',
            zIndex: 1000,
            position: 'relative',
            gap: '20px'
        }}>
            {/* Left Section: App Title & Story Tools */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexShrink: 0 }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#60a5fa', fontWeight: 'bold' }}>📖 NovelNode</h2>
                <div style={{ height: '24px', width: '1px', background: '#444' }}></div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={addEvent} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>+</span> เหตุการณ์
                    </button>
                    <button onClick={() => setIsSelectionMode(!isSelectionMode)} style={{ background: isSelectionMode ? '#fbbf24' : '#333', color: isSelectionMode ? '#000' : '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>
                        {isSelectionMode ? '🔦 เลือกหลายอัน' : '🖱️ ปกติ'}
                    </button>
                </div>
            </div>

            {/* Middle Section: Libraries (Character, Location, Item) */}
            <div style={{ display: 'flex', flex: 1, justifyContent: 'center', gap: '25px', overflow: 'hidden' }}>
                {/* Character Library */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>ตัวละคร:</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {characters.map(char => (
                            <div key={char.id} onClick={() => addCharacterInstance(char.id)} title={`เพิ่ม ${char.name}`} style={{ width: '28px', height: '28px', borderRadius: '50%', background: char.imageUrl ? 'transparent' : char.color, border: `2px solid ${char.color}`, cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                {char.imageUrl ? <img src={char.imageUrl} alt={char.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '0.7rem' }}>👤</span>}
                            </div>
                        ))}
                        <button onClick={addCharacter} style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#333', border: '1px dashed #666', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>+</button>
                    </div>
                </div>

                {/* Location Library */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>สถานที่:</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {locations.map(loc => (
                            <div key={loc.id} onClick={() => addLocationInstance(loc.id)} title={`เพิ่ม ${loc.name}`} style={{ width: '28px', height: '28px', borderRadius: '6px', background: loc.imageUrl ? 'transparent' : loc.color, border: `2px solid ${loc.color}`, cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {loc.imageUrl ? <img src={loc.imageUrl} alt={loc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '0.8rem' }}>🏠</span>}
                            </div>
                        ))}
                        <button onClick={addLocation} style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#333', border: '1px dashed #666', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>+</button>
                    </div>
                </div>

                {/* Item Library */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>สิ่งของ:</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {items.map(item => (
                            <div key={item.id} onClick={() => addItemInstance(item.id)} title={`เพิ่ม ${item.name}`} style={{ width: '28px', height: '28px', borderRadius: '6px', background: item.imageUrl ? 'transparent' : item.color, border: `2px solid ${item.color}`, cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {item.imageUrl ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '0.8rem' }}>📦</span>}
                            </div>
                        ))}
                        <button onClick={addItem} style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#333', border: '1px dashed #666', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>+</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
