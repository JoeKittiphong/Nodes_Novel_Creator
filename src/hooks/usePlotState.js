import { useState, useCallback, useMemo } from 'react';
import { useNodesState, useEdgesState, addEdge } from '@xyflow/react';

export const usePlotState = () => {
    // 1. Central Source of Truth for Character Data
    const [characterDefinitions, setCharacterDefinitions] = useState({
        'char1': { id: 'char1', name: ' Leon', color: '#3b82f6', description: 'ผู้กล้าที่ตื่นขึ้นมาอย่างไร้ความทรงจำ', imageUrl: null },
        'char2': { id: 'char2', name: 'Mia', color: '#ec4899', description: 'นักเวทย์สาวผู้รอบรู้เรื่องสมุนไพร', imageUrl: null }
    });

    const [itemDefinitions, setItemDefinitions] = useState({
        'item1': { id: 'item1', name: 'ดาบหัก', color: '#f59e0b', description: 'ดาบเก่าที่ติดตัว Leon มา', imageUrl: null }
    });

    const [locationDefinitions, setLocationDefinitions] = useState({
        'loc1': { id: 'loc1', name: 'ป่าอาถรรพ์', color: '#a855f7', description: 'ป่าที่เต็มไปด้วยหมอกพิษ', imageUrl: null }
    });

    const [nodes, setNodes, onNodesChange] = useNodesState([
        { id: 'node1', type: 'storyNode', position: { x: 400, y: 50 }, data: { id: 'node1', label: 'จุดเริ่มต้นการเดินทาง', summary: 'Leon ตื่นขึ้นมาในป่าอาถรรพ์...', level: 'main' } },
        { id: 'node2', type: 'storyNode', position: { x: 400, y: 300 }, data: { id: 'node2', label: 'พบ Mia', summary: 'Leon ได้พบกับ Mia ที่กำลังเก็บสมุนไพร...', level: 'secondary' } },
        { id: 'inst-c1', type: 'characterNode', position: { x: 50, y: 50 }, data: { characterId: 'char1' } },
        { id: 'inst-l1', type: 'locationNode', position: { x: 50, y: 250 }, data: { locationId: 'loc1' } },
        { id: 'inst-i1', type: 'itemNode', position: { x: 50, y: 400 }, data: { itemId: 'item1' } },
    ]);

    const [edges, setEdges, onEdgesChange] = useEdgesState([
        { id: 'e1-2', source: 'node1', sourceHandle: 'story-source', target: 'node2', targetHandle: 'story-target', animated: true, type: 'customEdge', style: { stroke: '#fff' } },
        { id: 'c1-n1', source: 'inst-c1', sourceHandle: 'char-source', target: 'node1', targetHandle: 'char-target-L', animated: true, type: 'customEdge', style: { stroke: '#3b82f6' } },
        { id: 'l1-n1', source: 'inst-l1', sourceHandle: 'loc-source', target: 'node1', targetHandle: 'loc-target-L', animated: true, type: 'customEdge', style: { stroke: '#a855f7' } },
        { id: 'i1-n1', source: 'inst-i1', sourceHandle: 'item-source', target: 'node1', targetHandle: 'item-target-L', animated: true, type: 'customEdge', style: { stroke: '#f59e0b' } }
    ]);

    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [editingCharId, setEditingCharId] = useState(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState(null);
    const [intersectingEdgeId, setIntersectingEdgeId] = useState(null);
    const [selectedItems, setSelectedItems] = useState({ nodes: [], edges: [] });
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // Derived lists for Navbar
    const charactersList = useMemo(() => Object.values(characterDefinitions), [characterDefinitions]);
    const itemsList = useMemo(() => Object.values(itemDefinitions), [itemDefinitions]);
    const locationsList = useMemo(() => Object.values(locationDefinitions), [locationDefinitions]);

    const handleUpdateNode = useCallback((id, key, value) => {
        setNodes((nds) => {
            const node = nds.find(n => n.id === id);

            // Sync with central definitions
            if (node?.type === 'characterNode' && node.data.characterId) {
                setCharacterDefinitions(prev => ({ ...prev, [node.data.characterId]: { ...prev[node.data.characterId], [key]: value } }));
                return nds;
            }
            if (node?.type === 'itemNode' && node.data.itemId) {
                setItemDefinitions(prev => ({ ...prev, [node.data.itemId]: { ...prev[node.data.itemId], [key]: value } }));
                return nds;
            }
            if (node?.type === 'locationNode' && node.data.locationId) {
                setLocationDefinitions(prev => ({ ...prev, [node.data.locationId]: { ...prev[node.data.locationId], [key]: value } }));
                return nds;
            }

            // Normal node update
            return nds.map(n => n.id === id ? { ...n, data: { ...n.data, [key]: value } } : n);
        });
    }, [setNodes]);

    const deleteNode = useCallback((id) => {
        setNodes((nds) => nds.filter((n) => n.id !== id));
        setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
        setSelectedNodeId(null);
    }, [setNodes, setEdges]);

    const addEvent = useCallback(() => {
        const newId = `node-${Date.now()}`;
        setNodes((nds) => nds.concat({
            id: newId,
            type: 'storyNode',
            position: { x: 400, y: 500 },
            data: { id: newId, label: 'เหตุการณ์ใหม่', summary: '', level: 'secondary' }
        }));
        setSelectedNodeId(newId);
    }, [setNodes]);

    // Character helpers
    const addCharacter = useCallback(() => {
        const charId = `char-${Date.now()}`, instId = `inst-${Date.now()}`;
        setCharacterDefinitions(prev => ({ ...prev, [charId]: { id: charId, name: 'ตัวละครใหม่', color: '#999999', description: '', imageUrl: null } }));
        setNodes((nds) => nds.concat({ id: instId, type: 'characterNode', position: { x: 50, y: 400 }, data: { characterId: charId } }));
    }, [setNodes]);
    const addCharacterInstance = useCallback((charId) => {
        const instId = `inst-${Date.now()}`;
        setNodes((nds) => nds.concat({ id: instId, type: 'characterNode', position: { x: 100, y: 100 }, data: { characterId: charId } }));
    }, [setNodes]);

    // Item helpers
    const addItem = useCallback(() => {
        const itemId = `item-${Date.now()}`, instId = `inst-${Date.now()}`;
        setItemDefinitions(prev => ({ ...prev, [itemId]: { id: itemId, name: 'สิ่งของใหม่', color: '#f59e0b', description: '', imageUrl: null } }));
        setNodes((nds) => nds.concat({ id: instId, type: 'itemNode', position: { x: 50, y: 500 }, data: { itemId: itemId } }));
    }, [setNodes]);
    const addItemInstance = useCallback((itemId) => {
        const instId = `inst-${Date.now()}`;
        setNodes((nds) => nds.concat({ id: instId, type: 'itemNode', position: { x: 100, y: 100 }, data: { itemId: itemId } }));
    }, [setNodes]);

    // Location helpers
    const addLocation = useCallback(() => {
        const locId = `loc-${Date.now()}`, instId = `inst-${Date.now()}`;
        setLocationDefinitions(prev => ({ ...prev, [locId]: { id: locId, name: 'สถานที่ใหม่', color: '#a855f7', description: '', imageUrl: null } }));
        setNodes((nds) => nds.concat({ id: instId, type: 'locationNode', position: { x: 50, y: 600 }, data: { locationId: locId } }));
    }, [setNodes]);
    const addLocationInstance = useCallback((locId) => {
        const instId = `inst-${Date.now()}`;
        setNodes((nds) => nds.concat({ id: instId, type: 'locationNode', position: { x: 100, y: 100 }, data: { locationId: locId } }));
    }, [setNodes]);

    const pushDownstreamNodes = useCallback((targetId, dx, dy, currentNodes, currentEdges) => {
        const downstreamIds = new Set();
        const queue = [targetId];

        while (queue.length > 0) {
            const currentId = queue.shift();
            if (!downstreamIds.has(currentId)) {
                downstreamIds.add(currentId);
                currentEdges.forEach(edge => {
                    if (edge.source === currentId) {
                        queue.push(edge.target);
                    }
                });
            }
        }

        return currentNodes.map(n => {
            if (downstreamIds.has(n.id)) {
                return {
                    ...n,
                    position: { x: n.position.x + dx, y: n.position.y + dy }
                };
            }
            return n;
        });
    }, []);

    const handleHeightChange = useCallback((nodeId, dy) => {
        setNodes((nds) => {
            const growingNode = nds.find(n => n.id === nodeId);
            if (!growingNode) return nds;

            const downstreamIds = new Set();
            const queue = edges.filter(e => e.source === nodeId).map(e => e.target);
            while (queue.length > 0) {
                const currentId = queue.shift();
                if (!downstreamIds.has(currentId)) {
                    downstreamIds.add(currentId);
                    edges.forEach(edge => {
                        if (edge.source === currentId) queue.push(edge.target);
                    });
                }
            }

            const physicalBelowIds = nds.filter(n =>
                n.id !== nodeId &&
                n.position.y > growingNode.position.y &&
                Math.abs(n.position.x - growingNode.position.x) < 200
            ).map(n => n.id);

            const allToMove = new Set([...downstreamIds, ...physicalBelowIds]);

            return nds.map(n => {
                if (allToMove.has(n.id)) {
                    return {
                        ...n,
                        position: { x: n.position.x, y: n.position.y + dy }
                    };
                }
                return n;
            });
        });
    }, [edges, setNodes]);

    const nodesWithHelpers = useMemo(() => {
        return nodes.map(n => {
            let dataProps = { ...n.data };

            if (n.type === 'characterNode' && n.data.characterId) dataProps = { ...dataProps, ...characterDefinitions[n.data.characterId] };
            if (n.type === 'itemNode' && n.data.itemId) dataProps = { ...dataProps, ...itemDefinitions[n.data.itemId] };
            if (n.type === 'locationNode' && n.data.locationId) dataProps = { ...dataProps, ...locationDefinitions[n.data.locationId] };

            if (n.type === 'storyNode') {
                const incomingEdges = edges.filter(e => e.target === n.id);
                const sourceIds = incomingEdges.map(e => e.source);

                const charDefIds = new Set(), itemDefIds = new Set(), locDefIds = new Set();
                nodes.forEach(node => {
                    if (sourceIds.includes(node.id)) {
                        if (node.type === 'characterNode') charDefIds.add(node.data.characterId);
                        if (node.type === 'itemNode') itemDefIds.add(node.data.itemId);
                        if (node.type === 'locationNode') locDefIds.add(node.data.locationId);
                    }
                });

                dataProps.connectedCharacters = Array.from(charDefIds).map(id => characterDefinitions[id]).filter(Boolean);
                dataProps.connectedItems = Array.from(itemDefIds).map(id => itemDefinitions[id]).filter(Boolean);
                dataProps.connectedLocations = Array.from(locDefIds).map(id => locationDefinitions[id]).filter(Boolean);
            }

            return {
                ...n,
                data: {
                    ...dataProps,
                    id: n.id,
                    onUpdate: handleUpdateNode,
                    onDelete: deleteNode,
                    onHeightChange: handleHeightChange
                }
            };
        });
    }, [nodes, edges, characterDefinitions, itemDefinitions, locationDefinitions, handleUpdateNode, deleteNode, handleHeightChange]);

    const deleteEdge = useCallback((id) => {
        setEdges((eds) => eds.filter((e) => e.id !== id));
        setSelectedEdgeId(null);
    }, [setEdges]);

    const onConnect = useCallback(
        (params) => {
            const { sourceHandle, targetHandle, source, target } = params;
            const sourceNode = nodes.find(n => n.id === source);
            const targetNode = nodes.find(n => n.id === target);

            // Validation logic
            let isValid = false;

            // 1. Story to Story flow
            if (sourceNode?.type === 'storyNode' && targetNode?.type === 'storyNode') {
                if (sourceHandle === 'story-source' && targetHandle === 'story-target') isValid = true;
            }

            // 2. Character connections
            const isCharSource = sourceHandle?.startsWith('char-source') || sourceNode?.type === 'characterNode';
            const isCharTarget = targetHandle?.startsWith('char-target');
            if (isCharSource && isCharTarget) isValid = true;

            // 3. Item connections
            const isItemSource = sourceHandle?.startsWith('item-source') || sourceNode?.type === 'itemNode';
            const isItemTarget = targetHandle?.startsWith('item-target');
            if (isItemSource && isItemTarget) isValid = true;

            // 4. Location connections
            const isLocSource = sourceHandle?.startsWith('loc-source') || sourceNode?.type === 'locationNode';
            const isLocTarget = targetHandle?.startsWith('loc-target');
            if (isLocSource && isLocTarget) isValid = true;

            if (!isValid) return;

            let color = '#fff';
            if (isCharSource) {
                const charId = sourceNode?.data?.characterId || (sourceNode?.id === source ? sourceNode.data.characterId : null);
                color = (charId && characterDefinitions[charId]?.color) || '#3b82f6';
            } else if (isItemSource) {
                const itemId = sourceNode?.data?.itemId;
                color = (itemId && itemDefinitions[itemId]?.color) || '#f59e0b';
            } else if (isLocSource) {
                const locId = sourceNode?.data?.locationId;
                color = (locId && locationDefinitions[locId]?.color) || '#a855f7';
            }

            setEdges((eds) => addEdge({
                ...params,
                type: 'customEdge',
                animated: true,
                style: { stroke: color, strokeWidth: 2 },
                data: { onDelete: deleteEdge }
            }, eds));
        },
        [nodes, characterDefinitions, itemDefinitions, locationDefinitions, setEdges, deleteEdge],
    );

    const edgesWithHelpers = useMemo(() => {
        return edges.map(e => ({
            ...e,
            data: {
                ...e.data,
                onDelete: deleteEdge
            }
        }));
    }, [edges, deleteEdge]);

    const updateCharacter = useCallback((id, key, value) => {
        setCharacterDefinitions(prev => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
    }, []);
    const updateItem = useCallback((id, key, value) => {
        setItemDefinitions(prev => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
    }, []);
    const updateLocation = useCallback((id, key, value) => {
        setLocationDefinitions(prev => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
    }, []);

    const groupSelectedNodes = useCallback((selectedNodes) => {
        if (!selectedNodes || selectedNodes.length < 2) return;

        // 1. Calculate Bounding Box
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        selectedNodes.forEach(node => {
            const w = node.measured?.width || 280;
            const h = node.measured?.height || 150;
            minX = Math.min(minX, node.position.x);
            minY = Math.min(minY, node.position.y);
            maxX = Math.max(maxX, node.position.x + w);
            maxY = Math.max(maxY, node.position.y + h);
        });

        const padding = 40;
        const groupX = minX - padding;
        const groupY = minY - padding;
        const groupW = (maxX - minX) + (padding * 2);
        const groupH = (maxY - minY) + (padding * 2);

        const groupId = `group-${Date.now()}`;
        const newGroup = {
            id: groupId,
            type: 'groupNode',
            position: { x: groupX, y: groupY },
            data: { label: 'กลุ่มใหม่', id: groupId },
            style: { width: groupW, height: groupH },
            zIndex: -1
        };

        // 2. Reparent selected nodes
        setNodes(nds => {
            const updatedNodes = nds.map(n => {
                const isSelected = selectedNodes.find(sn => sn.id === n.id);
                if (isSelected) {
                    return {
                        ...n,
                        parentId: groupId,
                        extent: 'parent',
                        position: {
                            x: n.position.x - groupX,
                            y: n.position.y - groupY
                        }
                    };
                }
                return n;
            });
            return [newGroup, ...updatedNodes];
        });

        setSelectedNodeId(groupId);
    }, [setNodes]);

    return {
        characters: charactersList,
        items: itemsList,
        locations: locationsList,
        nodes, setNodes, onNodesChange,
        edges, setEdges, onEdgesChange,
        edgesWithHelpers,
        selectedNodeId, setSelectedNodeId,
        editingCharId, setEditingCharId,
        selectedEdgeId, setSelectedEdgeId,
        intersectingEdgeId, setIntersectingEdgeId,
        selectedItems, setSelectedItems,
        isSelectionMode, setIsSelectionMode,
        handleUpdateNode, deleteNode, deleteEdge,
        addEvent, addCharacter, addCharacterInstance, updateCharacter,
        addItem, addItemInstance, updateItem,
        addLocation, addLocationInstance, updateLocation,
        nodesWithHelpers, onConnect, pushDownstreamNodes,
        groupSelectedNodes
    };
};
