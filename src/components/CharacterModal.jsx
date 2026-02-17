import React, { useState, useEffect, useRef } from 'react';

const MBTI_TYPES = [
    { code: 'INTJ', label: 'สถาปนิก', group: 'Analyst', emoji: '🔮' },
    { code: 'INTP', label: 'นักตรรกะ', group: 'Analyst', emoji: '🔮' },
    { code: 'ENTJ', label: 'ผู้บัญชาการ', group: 'Analyst', emoji: '🔮' },
    { code: 'ENTP', label: 'นักโต้วาที', group: 'Analyst', emoji: '🔮' },
    { code: 'INFJ', label: 'ผู้สนับสนุน', group: 'Diplomat', emoji: '🌿' },
    { code: 'INFP', label: 'ผู้ไกล่เกลี่ย', group: 'Diplomat', emoji: '🌿' },
    { code: 'ENFJ', label: 'ตัวเอก', group: 'Diplomat', emoji: '🌿' },
    { code: 'ENFP', label: 'นักรณรงค์', group: 'Diplomat', emoji: '🌿' },
    { code: 'ISTJ', label: 'นักโลจิสติกส์', group: 'Sentinel', emoji: '🛡️' },
    { code: 'ISFJ', label: 'ผู้พิทักษ์', group: 'Sentinel', emoji: '🛡️' },
    { code: 'ESTJ', label: 'ผู้บริหาร', group: 'Sentinel', emoji: '🛡️' },
    { code: 'ESFJ', label: 'ผู้ดูแล', group: 'Sentinel', emoji: '🛡️' },
    { code: 'ISTP', label: 'ช่างฝีมือ', group: 'Explorer', emoji: '🏔️' },
    { code: 'ISFP', label: 'นักผจญภัย', group: 'Explorer', emoji: '🏔️' },
    { code: 'ESTP', label: 'ผู้ประกอบการ', group: 'Explorer', emoji: '🏔️' },
    { code: 'ESFP', label: 'ผู้สร้างความบันเทิง', group: 'Explorer', emoji: '🏔️' },
];

const GROUP_COLORS = {
    Analyst: '#a78bfa',
    Diplomat: '#34d399',
    Sentinel: '#60a5fa',
    Explorer: '#fbbf24'
};

const GROUP_LABELS = {
    Analyst: '🔮 Analyst — นักวิเคราะห์',
    Diplomat: '🌿 Diplomat — นักการทูต',
    Sentinel: '🛡️ Sentinel — ผู้พิทักษ์',
    Explorer: '🏔️ Explorer — นักสำรวจ',
};

const CharacterModal = ({ character, onUpdate, onClose }) => {
    const [mbti, setMbti] = useState(character.mbti || '');
    const [background, setBackground] = useState(character.background || '');
    const bgRef = useRef(null);

    useEffect(() => {
        if (bgRef.current) {
            bgRef.current.style.height = 'auto';
            bgRef.current.style.height = `${bgRef.current.scrollHeight}px`;
        }
    }, [background]);

    const handleSave = () => {
        onUpdate(character.id, 'mbti', mbti);
        onUpdate(character.id, 'background', background);
        onClose();
    };

    const currentMbti = MBTI_TYPES.find(m => m.code === mbti);
    const groups = ['Analyst', 'Diplomat', 'Sentinel', 'Explorer'];

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 9999
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: '#1e1e1e', border: '1px solid #444',
                    borderRadius: '16px', width: '480px', maxHeight: '80vh',
                    overflow: 'auto', padding: '24px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: character.imageUrl ? `url(${character.imageUrl}) center/cover` : (character.color || '#3b82f6'),
                            border: `3px solid ${character.color || '#3b82f6'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {!character.imageUrl && <span style={{ fontSize: '1.2rem' }}>👤</span>}
                        </div>
                        <div>
                            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>{character.name || 'ตัวละคร'}</h3>
                            <span style={{ fontSize: '0.7rem', color: '#666' }}>แก้ไขบุคลิกภาพและภูมิหลัง</span>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                </div>

                {/* MBTI Section */}
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#ccc', fontSize: '0.85rem' }}>🧠 MBTI Personality Type</h4>

                    {/* Current Selection */}
                    {currentMbti && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '8px 12px', borderRadius: '10px',
                            background: `${GROUP_COLORS[currentMbti.group]}15`,
                            border: `1px solid ${GROUP_COLORS[currentMbti.group]}44`,
                            marginBottom: '12px'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>{currentMbti.emoji}</span>
                            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: GROUP_COLORS[currentMbti.group] }}>{currentMbti.code}</span>
                            <span style={{ fontSize: '0.8rem', color: '#999' }}>— {currentMbti.label}</span>
                            <button
                                onClick={() => setMbti('')}
                                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '0.7rem' }}
                            >ล้าง</button>
                        </div>
                    )}

                    {/* MBTI Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {groups.map(group => (
                            <div key={group}>
                                <div style={{ fontSize: '0.65rem', color: GROUP_COLORS[group], marginBottom: '4px', fontWeight: '600' }}>
                                    {GROUP_LABELS[group]}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                                    {MBTI_TYPES.filter(m => m.group === group).map(m => (
                                        <button
                                            key={m.code}
                                            onClick={() => setMbti(m.code)}
                                            style={{
                                                background: mbti === m.code ? `${GROUP_COLORS[group]}33` : '#151515',
                                                border: mbti === m.code ? `2px solid ${GROUP_COLORS[group]}` : '1px solid #333',
                                                borderRadius: '8px',
                                                color: mbti === m.code ? GROUP_COLORS[group] : '#888',
                                                padding: '6px 4px',
                                                cursor: 'pointer',
                                                fontSize: '0.7rem',
                                                fontWeight: mbti === m.code ? 'bold' : 'normal',
                                                textAlign: 'center',
                                                transition: 'all 0.15s'
                                            }}
                                        >
                                            <div style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{m.code}</div>
                                            <div style={{ fontSize: '0.55rem', color: '#666', marginTop: '1px' }}>{m.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Background Section */}
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#ccc', fontSize: '0.85rem' }}>📜 ภูมิหลังตัวละคร</h4>
                    <textarea
                        ref={bgRef}
                        value={background}
                        onChange={(e) => setBackground(e.target.value)}
                        placeholder="เขียนภูมิหลัง ประวัติ เรื่องราว ที่มา ของตัวละครนี้..."
                        style={{
                            width: '100%',
                            minHeight: '120px',
                            background: '#151515',
                            border: '1px solid #333',
                            borderRadius: '10px',
                            color: '#ccc',
                            fontSize: '0.85rem',
                            lineHeight: '1.6',
                            padding: '12px',
                            resize: 'none',
                            outline: 'none',
                            overflow: 'hidden',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Save Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button onClick={onClose} style={{ background: '#333', color: '#999', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '0.8rem' }}>ยกเลิก</button>
                    <button onClick={handleSave} style={{ background: '#60a5fa', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>💾 บันทึก</button>
                </div>
            </div>
        </div>
    );
};

export default CharacterModal;
export { MBTI_TYPES, GROUP_COLORS };
