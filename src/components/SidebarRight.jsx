import React from 'react';

const SidebarRight = ({
    editingChar,
    selectedItems,
    selectedEdge,
    nodes,
    deleteSelectedItems,
    handleImageUpload,
    updateCharacter,
    updateItem,
    updateLocation,
    setEditingCharId,
    deleteEdge,
    groupSelectedNodes
}) => {
    if (!(editingChar || selectedItems.nodes.length + selectedItems.edges.length > 1)) {
        return null;
    }

    return (
        <div style={{ width: '320px', background: '#1e1e1e', padding: '20px', borderLeft: '1px solid #333', overflowY: 'auto' }}>
            {selectedItems.nodes.length + selectedItems.edges.length > 1 ? (
                /* Case: Bulk Selection */
                <div>
                    <h3 style={{ marginBottom: '20px', color: '#fbbf24' }}>📦 Bulk Selection</h3>
                    <div style={{ background: '#2d2d2d', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>โหนดที่เลือก: <strong>{selectedItems.nodes.length}</strong></p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>เส้นเชื่อมที่เลือก: <strong>{selectedItems.edges.length}</strong></p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button
                            onClick={() => groupSelectedNodes(selectedItems.nodes)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: '#fbbf24',
                                color: '#000',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                display: selectedItems.nodes.length >= 2 ? 'block' : 'none'
                            }}
                        >
                            📦 จัดกลุ่มโหนดที่เลือก ({selectedItems.nodes.length})
                        </button>
                        <button
                            onClick={deleteSelectedItems}
                            style={{ width: '100%', padding: '12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            🗑 ลบทั้งหมดที่เลือก ({selectedItems.nodes.length + selectedItems.edges.length})
                        </button>
                    </div>
                </div>
            ) : editingChar ? (
                /* Case: Editing Character */
                <div>
                    <h3 style={{ marginBottom: '20px', color: '#3b82f6' }}>👤 Edit Character</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '5px' }}>Avatar Image</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {editingChar.imageUrl && (
                                    <img
                                        src={editingChar.imageUrl}
                                        alt="preview"
                                        style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #444' }}
                                    />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(editingChar.id, e.target.files[0])}
                                    style={{ fontSize: '0.8rem', color: '#ccc' }}
                                />
                                {editingChar.imageUrl && (
                                    <button
                                        onClick={() => updateCharacter(editingChar.id, 'imageUrl', null)}
                                        style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px', cursor: 'pointer', fontSize: '0.7rem', width: 'fit-content' }}
                                    >
                                        ลบรูปภาพ
                                    </button>
                                )}
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '5px' }}>Name</label>
                            <input
                                value={editingChar.name}
                                onChange={(e) => updateCharacter(editingChar.id, 'name', e.target.value)}
                                style={{ width: '100%', padding: '8px', background: '#333', border: '1px solid #444', borderRadius: '4px', color: '#fff' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '5px' }}>Color</label>
                            <input
                                type="color"
                                value={editingChar.color}
                                onChange={(e) => updateCharacter(editingChar.id, 'color', e.target.value)}
                                style={{ width: '100%', height: '40px', padding: '2px', background: '#333', border: '1px solid #444', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '5px' }}>Description</label>
                            <textarea
                                value={editingChar.description}
                                onChange={(e) => updateCharacter(editingChar.id, 'description', e.target.value)}
                                style={{ width: '100%', height: '100px', padding: '8px', background: '#333', border: '1px solid #444', borderRadius: '4px', color: '#fff', resize: 'none' }}
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => setEditingCharId(null)}
                        style={{ marginTop: '10px', padding: '10px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        ปิด
                    </button>
                </div>
            ) : null}
        </div>
    );
};

export default SidebarRight;
