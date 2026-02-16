import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// --- Custom Node Component ---
const StoryNode = ({ data, selected }) => {
  const characters = data.allCharacters || [];
  const selectedChars = data.characters || [];

  return (
    <div style={{
      padding: '15px',
      borderRadius: '8px',
      background: '#2d2d2d',
      color: '#fff',
      border: selected ? '2px solid #3b82f6' : '1px solid #444',
      width: '240px', // เพิ่มขนาดเล็กน้อยสำหรับการพิมพ์
      boxShadow: selected ? '0 0 15px rgba(59, 130, 246, 0.5)' : 'none',
      position: 'relative'
    }}>
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
          width: '24px',
          height: '24px',
          cursor: 'pointer',
          display: selected ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
          zIndex: 10
        }}
        title="ลบเหตุการณ์"
      >
        🗑
      </button>

      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />

      {/* Editable Title */}
      <input
        value={data.label}
        onChange={(e) => data.onUpdate(data.id, 'label', e.target.value)}
        onPointerDown={(e) => e.stopPropagation()} // ป้องกันการลาก Node ขณะพิมพ์
        placeholder="ชื่อเหตุการณ์..."
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          borderBottom: '1px solid #444',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '1rem',
          marginBottom: '10px',
          outline: 'none',
          padding: '2px 0'
        }}
      />

      {/* Editable Summary */}
      <textarea
        value={data.summary || ''}
        onChange={(e) => data.onUpdate(data.id, 'summary', e.target.value)}
        onPointerDown={(e) => e.stopPropagation()}
        placeholder="รายละเอียดเหตุการณ์..."
        style={{
          width: '100%',
          height: '60px',
          background: '#1a1a1a',
          border: '1px solid #444',
          borderRadius: '4px',
          color: '#ccc',
          fontSize: '0.85rem',
          padding: '8px',
          resize: 'none',
          outline: 'none',
          marginBottom: '10px'
        }}
      />

      {/* Character Toggles */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '5px', padding: '5px 0', borderTop: '1px solid #444' }}>
        {characters.map((char) => {
          const isActive = selectedChars.includes(char.id);
          return (
            <div
              key={char.id}
              onClick={(e) => { e.stopPropagation(); data.onToggleChar(data.id, char.id); }}
              title={char.name}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: char.imageUrl ? 'transparent' : char.color,
                border: isActive ? '2px solid #fff' : '1px solid #555',
                opacity: isActive ? 1 : 0.3, // ตัวละครที่ไม่เลือกจะจางลง
                filter: isActive ? 'drop-shadow(0 0 3px #fff)' : 'none',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: '0.2s',
                transform: isActive ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              {char.imageUrl ? (
                <img src={char.imageUrl} alt={char.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : null}
            </div>
          );
        })}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};

// --- Main App Component ---
export default function PlotApp() {
  const [characters, setCharacters] = useState([
    { id: 'char1', name: 'พระเอก (Leon)', color: '#3b82f6', description: 'ผู้กล้าที่ตื่นขึ้นมาอย่างไร้ความทรงจำ', imageUrl: null },
    { id: 'char2', name: 'นางเอก (Mia)', color: '#ec4899', description: 'นักเวทย์สาวผู้รอบรู้เรื่องสมุนไพร', imageUrl: null },
    { id: 'char3', name: 'จอมมาร (Zod)', color: '#ef4444', description: 'ราชาแห่งความมืดที่หวังจะครองโลก', imageUrl: null },
  ]);

  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: 'node1',
      type: 'storyNode',
      position: { x: 250, y: 50 },
      data: {
        id: 'node1',
        label: 'จุดเริ่มต้นการเดินทาง',
        summary: 'Leon ตื่นขึ้นมาในป่าอาถรรพ์...',
        characters: ['char1'],
        allCharacters: characters,
        onUpdate: handleUpdateNode,
        onDelete: deleteNode,
        onToggleChar: handleToggleChar
      }
    },
    {
      id: 'node2',
      type: 'storyNode',
      position: { x: 250, y: 200 },
      data: {
        id: 'node2',
        label: 'พบ Mia',
        summary: 'Leon ได้พบกับ Mia ที่กำลังเก็บสมุนไพร...',
        characters: ['char1', 'char2'],
        allCharacters: characters,
        onUpdate: handleUpdateNode,
        onDelete: deleteNode,
        onToggleChar: handleToggleChar
      }
    },
  ]);

  const [edges, setEdges, onEdgesChange] = useEdgesState([
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#fff' } }
  ]);

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [editingCharId, setEditingCharId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [intersectingEdgeId, setIntersectingEdgeId] = useState(null);
  const [selectedItems, setSelectedItems] = useState({ nodes: [], edges: [] });
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // --- Functions (Defined before usage in useMemo) ---

  const handleUpdateNode = useCallback((id, key, value) => {
    setNodes((nds) => nds.map(n => n.id === id ? { ...n, data: { ...n.data, [key]: value } } : n));
  }, [setNodes]);

  const deleteNode = useCallback((id) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setSelectedNodeId(null);
  }, [setNodes, setEdges]);

  const handleToggleChar = useCallback((nodeId, charId) => {
    setNodes((nds) => nds.map(node => {
      if (node.id === nodeId) {
        const currentChars = node.data.characters || [];
        const newChars = currentChars.includes(charId)
          ? currentChars.filter(id => id !== charId)
          : [...currentChars, charId];
        return { ...node, data: { ...node.data, characters: newChars } };
      }
      return node;
    }));
  }, [setNodes]);

  // Inject helpers into nodes dynamically
  const nodesWithHelpers = useMemo(() => {
    return nodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        id: n.id,
        allCharacters: characters,
        onUpdate: handleUpdateNode,
        onDelete: deleteNode,
        onToggleChar: handleToggleChar
      }
    }));
  }, [nodes, characters, handleUpdateNode, deleteNode, handleToggleChar]);

  // Register Custom Node Type
  const nodeTypes = useMemo(() => ({ storyNode: StoryNode }), []);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#fff' } }, eds)),
    [setEdges],
  );

  const onNodeClick = (_, node) => {
    setSelectedNodeId(node.id);
    setEditingCharId(null); // ปิดการแก้ไขตัวละครถ้าคลิก Node
    setSelectedEdgeId(null); // ปิดการเลือกเส้นเชื่อม
  };

  const onEdgeClick = (_, edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
    setEditingCharId(null);
  };

  const onSelectionChange = useCallback((params) => {
    setSelectedItems({ nodes: params.nodes, edges: params.edges });
  }, []);

  const deleteSelectedItems = () => {
    const nodeIds = selectedItems.nodes.map(n => n.id);
    const edgeIds = selectedItems.edges.map(e => e.id);

    setNodes((nds) => nds.filter((n) => !nodeIds.includes(n.id)));
    setEdges((eds) => eds.filter((e) => !edgeIds.includes(e.id) && !nodeIds.includes(e.source) && !nodeIds.includes(e.target)));

    setSelectedItems({ nodes: [], edges: [] });
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  };


  // Node Management Functions
  const addEvent = () => {
    const newId = `node-${Date.now()}`;
    const newNode = {
      id: newId,
      type: 'storyNode',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        id: newId,
        label: 'เหตุการณ์ใหม่',
        summary: '',
        characters: [],
        allCharacters: characters,
        onUpdate: handleUpdateNode,
        onDelete: deleteNode,
        onToggleChar: handleToggleChar
      }
    };
    setNodes((nds) => nds.concat(newNode));
    setSelectedNodeId(newId);
    setEditingCharId(null);
  };


  const deleteEdge = (id) => {
    setEdges((eds) => eds.filter((e) => e.id !== id));
    setSelectedEdgeId(null);
  };

  // Helper: Calculate distance from point (px, py) to line segment (x1, y1) - (x2, y2)
  const getDistanceToSegment = (px, py, x1, y1, x2, y2) => {
    const l2 = (x1 - x2) ** 2 + (y1 - y2) ** 2;
    if (l2 === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.sqrt((px - (x1 + t * (x2 - x1))) ** 2 + (py - (y1 + t * (y2 - y1))) ** 2);
  };

  const findIntersectingEdge = (node) => {
    const nodeCenter = {
      x: node.position.x + 100,
      y: node.position.y + 40
    };

    let found = null;
    const threshold = 35; // ขยายระยะเล็กน้อยเพื่อให้ออก Effect ง่ายขึ้น

    for (const edge of edges) {
      if (edge.source === node.id || edge.target === node.id) continue;

      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);

      if (sourceNode && targetNode) {
        const x1 = sourceNode.position.x + 100;
        const y1 = sourceNode.position.y + 80;
        const x2 = targetNode.position.x + 100;
        const y2 = targetNode.position.y;

        const dist = getDistanceToSegment(nodeCenter.x, nodeCenter.y, x1, y1, x2, y2);
        if (dist < threshold) {
          found = edge;
          break;
        }
      }
    }
    return found;
  };

  const onNodeDrag = (_, node) => {
    const edge = findIntersectingEdge(node);
    setIntersectingEdgeId(edge ? edge.id : null);
  };

  const onNodeDragStop = (_, node) => {
    const intersectingEdge = findIntersectingEdge(node);
    setIntersectingEdgeId(null); // ล้าง Effect ทุกกรณีเมื่อวาง

    if (intersectingEdge) {
      setEdges((eds) => {
        const filtered = eds.filter((e) => e.id !== intersectingEdge.id);
        const edge1 = {
          id: `e-${intersectingEdge.source}-${node.id}`,
          source: intersectingEdge.source,
          target: node.id,
          animated: true,
          style: { stroke: '#fff' }
        };
        const edge2 = {
          id: `e-${node.id}-${intersectingEdge.target}`,
          source: node.id,
          target: intersectingEdge.target,
          animated: true,
          style: { stroke: '#fff' }
        };
        return [...filtered, edge1, edge2];
      });
    }
  };

  // Character Management Functions
  const addCharacter = () => {
    const newId = `char-${Date.now()}`;
    const newChar = { id: newId, name: 'ตัวละครใหม่', color: '#999999', description: '', imageUrl: null };
    const updated = [...characters, newChar];
    setCharacters(updated);
    syncNodesWithCharacters(updated);
    setEditingCharId(newId);
    setSelectedEdgeId(null);
  };

  const handleImageUpload = (charId, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateCharacter(charId, 'imageUrl', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const updateCharacter = (id, key, value) => {
    setCharacters((prev) => {
      const updated = prev.map(c => c.id === id ? { ...c, [key]: value } : c);
      syncNodesWithCharacters(updated); // สำคัญมาก: ต้องส่งค่าใหม่เข้าไปซิงค์
      return updated;
    });
  };
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const editingChar = characters.find(c => c.id === editingCharId);
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: '#121212', color: '#fff', fontFamily: 'sans-serif' }}>

      {/* 1. Sidebar Left (Characters Management) */}
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

      {/* 2. Canvas Center */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges.map((e) => ({
            ...e,
            style: e.id === intersectingEdgeId
              ? { stroke: '#fbbf24', strokeWidth: 4, filter: 'drop-shadow(0 0 5px #fbbf24)' }
              : e.style
          }))}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onSelectionChange={onSelectionChange}
          selectionOnDrag={isSelectionMode}
          selectionMode={SelectionMode.Partial}
          panOnScroll={false}
          panOnDrag={isSelectionMode ? [1, 2] : [0, 1, 2]} // 0 = Left Click, 1 = Right, 2 = Middle
          nodeTypes={nodeTypes}
          fitView
          style={{ background: '#121212' }}
        >
          <Background color="#333" gap={20} />
          <Controls style={{ fill: '#fff' }} />
          <MiniMap style={{ background: '#333' }} nodeColor={() => '#fff'} />
        </ReactFlow>
      </div>

      {/* 3. Sidebar Right (Inspector) */}
      {(editingChar || selectedItems.nodes.length + selectedItems.edges.length > 1 || selectedEdge) && (
        <div style={{ width: '320px', background: '#1e1e1e', padding: '20px', borderLeft: '1px solid #333', overflowY: 'auto' }}>
          {selectedItems.nodes.length + selectedItems.edges.length > 1 ? (
            /* Case: Bulk Selection */
            <div>
              <h3 style={{ marginBottom: '20px', color: '#fbbf24' }}>📦 Bulk Selection</h3>
              <div style={{ background: '#2d2d2d', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>โหนดที่เลือก: <strong>{selectedItems.nodes.length}</strong></p>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>เส้นเชื่อมที่เลือก: <strong>{selectedItems.edges.length}</strong></p>
              </div>
              <button
                onClick={deleteSelectedItems}
                style={{ width: '100%', padding: '12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                🗑 ลบทั้งหมดที่เลือก ({selectedItems.nodes.length + selectedItems.edges.length})
              </button>
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
          ) : selectedEdge ? (
            /* Case: Editing Edge */
            <div>
              <h3 style={{ marginBottom: '20px', color: '#fbbf24' }}>🔗 Connection</h3>
              <div style={{ background: '#2d2d2d', padding: '15px', borderRadius: '8px', fontSize: '0.9rem', color: '#ccc' }}>
                <p>เชื่อมต่อจาก: <br /><strong style={{ color: '#fff' }}>{nodes.find(n => n.id === selectedEdge.source)?.data.label}</strong></p>
                <p>ไปยัง: <br /><strong style={{ color: '#fff' }}>{nodes.find(n => n.id === selectedEdge.target)?.data.label}</strong></p>
              </div>

              <button
                onClick={() => deleteEdge(selectedEdge.id)}
                style={{ width: '100%', marginTop: '20px', padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                🗑 ลบการเชื่อมต่อนี้
              </button>
            </div>
          ) : null}
        </div>
      )}

    </div>
  );
}