import React, { useMemo, useCallback } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    SelectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import StoryNode from './components/StoryNode';
import CharacterNode from './components/CharacterNode';
import ItemNode from './components/ItemNode';
import LocationNode from './components/LocationNode';
import CustomEdge from './components/CustomEdge';
import GroupNode from './components/GroupNode';
import Navbar from './components/Navbar';
import SidebarRight from './components/SidebarRight';
import { usePlotState } from './hooks/usePlotState';
import { findIntersectingEdge, checkNodeOverlap, isPointInNode, getRelativePosition, getAbsolutePosition } from './utils/flowHelpers';

const nodeTypes = {
    storyNode: StoryNode,
    characterNode: CharacterNode,
    itemNode: ItemNode,
    locationNode: LocationNode,
    groupNode: GroupNode
};

const edgeTypes = {
    customEdge: CustomEdge
};

export default function App() {
    const {
        characters, items, locations,
        nodes, setNodes, onNodesChange,
        edges, setEdges, onEdgesChange,
        edgesWithHelpers,
        selectedNodeId, setSelectedNodeId,
        editingCharId, setEditingCharId,
        selectedEdgeId, setSelectedEdgeId,
        intersectingEdgeId, setIntersectingEdgeId,
        selectedItems, setSelectedItems,
        isSelectionMode, setIsSelectionMode,
        deleteNode, deleteEdge,
        addEvent, addCharacter, addCharacterInstance, updateCharacter,
        addItem, addItemInstance, updateItem,
        addLocation, addLocationInstance, updateLocation,
        nodesWithHelpers, onConnect, pushDownstreamNodes, groupSelectedNodes
    } = usePlotState();

    const onNodeClick = (_, node) => {
        setSelectedNodeId(node.id);
        setEditingCharId(null);
        setSelectedEdgeId(null);
    };

    const onEdgeClick = (_, edge) => {
        setSelectedEdgeId(edge.id);
        setSelectedNodeId(null);
        setEditingCharId(null);
    };

    const onSelectionChange = useCallback((params) => {
        setSelectedItems({ nodes: params.nodes, edges: params.edges });
    }, [setSelectedItems]);

    const deleteSelectedItems = () => {
        const nodeIds = selectedItems.nodes.map(n => n.id);
        const edgeIds = selectedItems.edges.map(e => e.id);

        setNodes((nds) => nds.filter((n) => !nodeIds.includes(n.id)));
        setEdges((eds) => eds.filter((e) => !edgeIds.includes(e.id) && !nodeIds.includes(e.source) && !nodeIds.includes(e.target)));

        setSelectedItems({ nodes: [], edges: [] });
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
    };

    const onNodeDrag = (_, node) => {
        const edge = findIntersectingEdge(node, nodes, edges);
        setIntersectingEdgeId(edge ? edge.id : null);
    };

    const onNodeDragStop = (_, node) => {
        // 1. Group Entry/Exit Logic
        if (node.type !== 'groupNode') {
            const dropPos = { x: node.position.x, y: node.position.y };
            const absDropPos = node.parentId ? getAbsolutePosition(node, nodes) : dropPos;

            const targetGroup = nodes.find(n =>
                n.type === 'groupNode' &&
                n.id !== node.id &&
                n.id !== node.parentId &&
                isPointInNode(absDropPos, n)
            );

            if (targetGroup) {
                // ENTER Group
                setNodes(nds => nds.map(n => n.id === node.id ? {
                    ...n,
                    parentId: targetGroup.id,
                    extent: 'parent',
                    position: getRelativePosition(absDropPos, targetGroup)
                } : n));
                return;
            } else if (node.parentId) {
                // EXIT Group? Check if still inside parent
                const parent = nodes.find(n => n.id === node.parentId);
                if (parent && !isPointInNode(absDropPos, parent)) {
                    setNodes(nds => nds.map(n => n.id === node.id ? {
                        ...n,
                        parentId: undefined,
                        extent: undefined,
                        position: absDropPos
                    } : n));
                    return;
                }
            }
        }

        // 2. Handle Edge Intersection (Inserting between nodes)
        const intersectingEdge = findIntersectingEdge(node, nodes, edges);
        setIntersectingEdgeId(null);

        if (intersectingEdge) {
            const shiftY = 200;
            setNodes(nds => pushDownstreamNodes(intersectingEdge.target, 0, shiftY, nds, edges));

            setEdges((eds) => {
                const filtered = eds.filter((e) => e.id !== intersectingEdge.id);
                const edge1 = {
                    id: `e-${intersectingEdge.source}-${node.id}`,
                    source: intersectingEdge.source,
                    target: node.id,
                    type: 'customEdge',
                    data: { onDelete: deleteEdge },
                    animated: true,
                    style: { stroke: '#fff' }
                };
                const edge2 = {
                    id: `e-${node.id}-${intersectingEdge.target}`,
                    source: node.id,
                    target: intersectingEdge.target,
                    type: 'customEdge',
                    data: { onDelete: deleteEdge },
                    animated: true,
                    style: { stroke: '#fff' }
                };
                return [...filtered, edge1, edge2];
            });
            return;
        }

        // 3. Handle Node Overlap (Collision avoidance)
        const overlappedNode = nodes.find(n => n.id !== node.id && checkNodeOverlap(node, n));
        if (overlappedNode) {
            const hasConnections = edges.some(e => e.source === overlappedNode.id || e.target === overlappedNode.id);
            if (hasConnections) {
                const shiftY = 250;
                setNodes(nds => pushDownstreamNodes(overlappedNode.id, 0, shiftY, nds, edges));
            }
        }
    };

    const handleImageUpload = (charId, file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            updateCharacter(charId, 'imageUrl', reader.result);
        };
        reader.readAsDataURL(file);
    };

    const editingChar = characters.find(c => c.id === editingCharId);
    const selectedEdge = edges.find((e) => e.id === selectedEdgeId);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: '#121212', color: '#fff', fontFamily: 'sans-serif', overflow: 'hidden' }}>
            <Navbar
                characters={characters}
                items={items}
                locations={locations}
                addEvent={addEvent}
                isSelectionMode={isSelectionMode}
                setIsSelectionMode={setIsSelectionMode}
                addCharacter={addCharacter}
                addCharacterInstance={addCharacterInstance}
                addItem={addItem}
                addItemInstance={addItemInstance}
                addLocation={addLocation}
                addLocationInstance={addLocationInstance}
                editingCharId={editingCharId}
                setEditingCharId={setEditingCharId}
                setSelectedNodeId={setSelectedNodeId}
                setSelectedEdgeId={setSelectedEdgeId}
            />

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <ReactFlow
                        nodes={nodesWithHelpers}
                        edges={edgesWithHelpers.map((e) => ({
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
                        panOnDrag={isSelectionMode ? [1, 2] : [0, 1, 2]}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        fitView
                        style={{ background: '#121212' }}
                    >
                        <Background color="#333" gap={20} />
                        <Controls style={{ fill: '#fff' }} />
                        <MiniMap style={{ background: '#333' }} nodeColor={() => '#fff'} />
                    </ReactFlow>
                </div>

                <SidebarRight
                    editingChar={editingChar}
                    selectedItems={selectedItems}
                    selectedEdge={selectedEdge}
                    nodes={nodes}
                    deleteSelectedItems={deleteSelectedItems}
                    handleImageUpload={handleImageUpload}
                    updateCharacter={updateCharacter}
                    updateItem={updateItem}
                    updateLocation={updateLocation}
                    setEditingCharId={setEditingCharId}
                    deleteEdge={deleteEdge}
                    groupSelectedNodes={groupSelectedNodes}
                />
            </div>
        </div>
    );
}
