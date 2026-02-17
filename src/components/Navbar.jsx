import React, { useRef } from 'react';

const Navbar = ({
    addEvent,
    isSelectionMode, setIsSelectionMode,
    exportProject, importProject, clearProject,
    showSummary, setShowSummary,
    showLibrary, setShowLibrary
}) => {
    const importRef = useRef(null);

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (file) {
            importProject(file);
            e.target.value = '';
        }
    };

    const handleClear = () => {
        if (window.confirm('ต้องการสร้างโปรเจกต์ใหม่? ข้อมูลปัจจุบันจะถูกลบทั้งหมด')) {
            clearProject();
        }
    };

    return (
        <div style={{
            height: '50px',
            background: 'rgba(20, 20, 20, 0.95)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            borderBottom: '1px solid #333',
            zIndex: 1000,
            gap: '10px'
        }}>
            {/* Left: Title + Tools */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1rem', color: '#60a5fa', fontWeight: 'bold' }}>📖 NovelNode</h2>
                <div style={{ height: '20px', width: '1px', background: '#333' }} />
                <button
                    onClick={() => setShowLibrary(!showLibrary)}
                    style={{
                        background: showLibrary ? '#60a5fa22' : '#333',
                        color: showLibrary ? '#60a5fa' : '#fff',
                        border: showLibrary ? '1px solid #60a5fa44' : '1px solid transparent',
                        borderRadius: '6px', padding: '4px 10px', cursor: 'pointer',
                        fontWeight: '600', fontSize: '0.75rem'
                    }}
                >
                    📚 Library
                </button>
                <button onClick={addEvent} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.75rem' }}>
                    + เหตุการณ์
                </button>
                <button onClick={() => setIsSelectionMode(!isSelectionMode)} style={{ background: isSelectionMode ? '#fbbf24' : '#333', color: isSelectionMode ? '#000' : '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.75rem' }}>
                    {isSelectionMode ? '🔦 เลือกหลาย' : '🖱️ ปกติ'}
                </button>
                <button onClick={() => setShowSummary(!showSummary)} style={{ background: showSummary ? '#60a5fa' : '#333', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.75rem' }}>
                    📋 {showSummary ? 'ปิดสรุป' : 'สรุปเรื่อง'}
                </button>
            </div>

            {/* Right: Save/Load */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button onClick={exportProject} title="Export JSON" style={{ background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}>
                    💾 Export
                </button>
                <button onClick={() => importRef.current?.click()} title="Import JSON" style={{ background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}>
                    📂 Import
                </button>
                <input ref={importRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                <button onClick={handleClear} title="New Project" style={{ background: '#ef444422', color: '#ef4444', border: '1px solid #ef444444', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}>
                    🗑️
                </button>
            </div>
        </div>
    );
};

export default Navbar;
