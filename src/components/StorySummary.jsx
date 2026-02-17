import React, { useMemo } from 'react';

const StorySummary = ({ nodes, edges, characterDefinitions, itemDefinitions, locationDefinitions, statusDefinitions, onNodeClick }) => {

    // Build ordered story flow by traversing edges from root nodes
    const storyFlow = useMemo(() => {
        const storyNodes = nodes.filter(n => n.type === 'storyNode');
        if (storyNodes.length === 0) return [];

        // Find story-to-story edges only
        const storyEdges = edges.filter(e => {
            const src = nodes.find(n => n.id === e.source);
            const tgt = nodes.find(n => n.id === e.target);
            return src?.type === 'storyNode' && tgt?.type === 'storyNode';
        });

        // Find root nodes (no incoming story edge)
        const targetIds = new Set(storyEdges.map(e => e.target));
        const roots = storyNodes.filter(n => !targetIds.has(n.id));

        // BFS traversal
        const visited = new Set();
        const ordered = [];

        const queue = roots.length > 0 ? [...roots] : [storyNodes[0]];

        while (queue.length > 0) {
            const node = queue.shift();
            if (visited.has(node.id)) continue;
            visited.add(node.id);

            // Find connected entities for this node
            const incomingEdges = edges.filter(e => e.target === node.id);
            const sourceNodeIds = incomingEdges.map(e => e.source);

            const chars = [], items = [], locs = [], statuses = [];

            sourceNodeIds.forEach(srcId => {
                const srcNode = nodes.find(n => n.id === srcId);
                if (!srcNode) return;

                if (srcNode.type === 'characterNode' && srcNode.data.characterId) {
                    const def = characterDefinitions[srcNode.data.characterId];
                    if (def && !chars.find(c => c.id === def.id)) chars.push(def);

                    // Also find statuses connected TO this entity
                    const entityStatuses = edges
                        .filter(e => e.target === srcId)
                        .map(e => nodes.find(n => n.id === e.source))
                        .filter(n => n?.type === 'statusNode' && n.data.statusId)
                        .map(n => statusDefinitions[n.data.statusId])
                        .filter(Boolean);
                    entityStatuses.forEach(s => { if (!statuses.find(x => x.id === s.id)) statuses.push(s); });
                }
                if (srcNode.type === 'itemNode' && srcNode.data.itemId) {
                    const def = itemDefinitions[srcNode.data.itemId];
                    if (def && !items.find(i => i.id === def.id)) items.push(def);
                }
                if (srcNode.type === 'locationNode' && srcNode.data.locationId) {
                    const def = locationDefinitions[srcNode.data.locationId];
                    if (def && !locs.find(l => l.id === def.id)) locs.push(def);
                }
            });

            ordered.push({
                id: node.id,
                label: node.data.label || 'ไม่มีชื่อ',
                summary: node.data.summary || '',
                level: node.data.level || 'secondary',
                characters: chars,
                items,
                locations: locs,
                statuses
            });

            // Find children in story flow
            const children = storyEdges
                .filter(e => e.source === node.id)
                .map(e => nodes.find(n => n.id === e.target))
                .filter(Boolean);
            queue.push(...children);
        }

        // Add orphan story nodes (not connected to any story edge)
        storyNodes.forEach(n => {
            if (!visited.has(n.id)) {
                ordered.push({
                    id: n.id,
                    label: n.data.label || 'ไม่มีชื่อ',
                    summary: n.data.summary || '',
                    level: n.data.level || 'secondary',
                    characters: [],
                    items: [],
                    locations: [],
                    statuses: []
                });
            }
        });

        return ordered;
    }, [nodes, edges, characterDefinitions, itemDefinitions, locationDefinitions, statusDefinitions]);

    const levelColors = {
        main: '#10b981',
        secondary: '#60a5fa',
        sub: '#a78bfa'
    };
    const levelLabels = {
        main: 'หลัก',
        secondary: 'รอง',
        sub: 'ย่อย'
    };

    return (
        <div style={{
            width: '320px',
            background: 'rgba(20, 20, 20, 0.95)',
            backdropFilter: 'blur(10px)',
            borderLeft: '1px solid #333',
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0px'
        }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                📋 สรุปเรื่อง
                <span style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'normal' }}>({storyFlow.length} เหตุการณ์)</span>
            </h3>

            {storyFlow.length === 0 && (
                <p style={{ color: '#666', fontSize: '0.8rem', textAlign: 'center', marginTop: '40px' }}>ยังไม่มีเหตุการณ์</p>
            )}

            {storyFlow.map((event, idx) => {
                const levelColor = levelColors[event.level] || '#60a5fa';

                return (
                    <div key={event.id} style={{ position: 'relative', paddingLeft: '24px' }}>
                        {/* Timeline line */}
                        {idx < storyFlow.length - 1 && (
                            <div style={{
                                position: 'absolute',
                                left: '8px',
                                top: '16px',
                                bottom: '0',
                                width: '2px',
                                background: '#333'
                            }} />
                        )}

                        {/* Timeline dot */}
                        <div style={{
                            position: 'absolute',
                            left: '4px',
                            top: '8px',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: levelColor,
                            border: '2px solid #1e1e1e',
                            zIndex: 1
                        }} />

                        {/* Event card */}
                        <div
                            onClick={() => onNodeClick(event.id)}
                            style={{
                                background: '#1a1a1a',
                                border: '1px solid #333',
                                borderRadius: '8px',
                                padding: '10px 12px',
                                marginBottom: '8px',
                                cursor: 'pointer',
                                transition: 'border-color 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = levelColor}
                            onMouseLeave={e => e.currentTarget.style.borderColor = '#333'}
                        >
                            {/* Header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: '4px', background: `${levelColor}22`, color: levelColor, fontWeight: 'bold' }}>
                                    {levelLabels[event.level] || event.level}
                                </span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#eee' }}>
                                    {event.label}
                                </span>
                            </div>

                            {/* Summary */}
                            {event.summary && (
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#999', lineHeight: '1.4' }}>
                                    {event.summary}
                                </p>
                            )}

                            {/* Connected entities */}
                            {(event.characters.length > 0 || event.items.length > 0 || event.locations.length > 0 || event.statuses.length > 0) && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #2a2a2a' }}>
                                    {event.characters.map(c => (
                                        <span key={c.id} style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: '8px', background: `${c.color}22`, border: `1px solid ${c.color}44`, color: c.color }}>
                                            👤 {c.name}
                                        </span>
                                    ))}
                                    {event.locations.map(l => (
                                        <span key={l.id} style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: '8px', background: `${l.color}22`, border: `1px solid ${l.color}44`, color: l.color }}>
                                            📍 {l.name}
                                        </span>
                                    ))}
                                    {event.items.map(i => (
                                        <span key={i.id} style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: '8px', background: `${i.color}22`, border: `1px solid ${i.color}44`, color: i.color }}>
                                            📦 {i.name}
                                        </span>
                                    ))}
                                    {event.statuses.map(s => (
                                        <span key={s.id} style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: '8px', background: `${s.color}22`, border: `1px solid ${s.color}44`, color: s.color }}>
                                            🏷️ {s.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default StorySummary;
