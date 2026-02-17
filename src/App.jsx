import React, { useCallback, useState } from 'react';
import {
    ReactFlow,
    ReactFlowProvider,
    MiniMap,
    Controls,
    Background,
    SelectionMode,
    useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import StoryNode from './components/StoryNode';
import CharacterNode from './components/CharacterNode';
import ItemNode from './components/ItemNode';
import LocationNode from './components/LocationNode';
import StatusNode from './components/StatusNode';
import CustomEdge from './components/CustomEdge';
import GroupNode from './components/GroupNode';
import Navbar from './components/Navbar';
import SidebarRight from './components/SidebarRight';
import StorySummary from './components/StorySummary';
import LibrarySidebar from './components/LibrarySidebar';
import CharacterModal from './components/CharacterModal';
import ChapterEditor from './components/ChapterEditor';
import { usePlotState } from './hooks/usePlotState';
import { findIntersectingEdge, checkNodeOverlap, isPointInNode, getRelativePosition, getAbsolutePosition } from './utils/flowHelpers';

const nodeTypes = {
    storyNode: StoryNode,
    characterNode: CharacterNode,
    itemNode: ItemNode,
    locationNode: LocationNode,
    statusNode: StatusNode,
    groupNode: GroupNode
};

const edgeTypes = {
    customEdge: CustomEdge
};

function AppInner() {
    const { setCenter } = useReactFlow();

    const {
        characters, items, locations, statuses,
        characterDefinitions, itemDefinitions, locationDefinitions, statusDefinitions,
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
        addStatus, addStatusInstance, updateStatus,
        nodesWithHelpers, onConnect, pushDownstreamNodes, groupSelectedNodes,
        exportProject, importProject, clearProject
    } = usePlotState();

    const [showSummary, setShowSummary] = useState(false);
    const [showLibrary, setShowLibrary] = useState(true);
    const [modalCharId, setModalCharId] = useState(null);
    const [editingChapterNodeId, setEditingChapterNodeId] = useState(null);

    // Update chapters for a story node
    const onUpdateChapters = useCallback((nodeId, chapters) => {
        setNodes(nds => nds.map(n =>
            n.id === nodeId ? { ...n, data: { ...n.data, chapters } } : n
        ));
    }, [setNodes]);

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

    // Attach a status node into a parent node (merge data, remove status node)
    const attachStatusToNode = useCallback((statusNode, targetNodeId) => {
        const statusData = {
            id: `attached-${Date.now()}`,
            name: statusNode.data.name || 'สถานะ',
            color: statusNode.data.color || '#f472b6',
            description: statusNode.data.description || ''
        };

        // Add status data to parent node's attachedStatuses array
        setNodes(nds => {
            const updated = nds.map(n => {
                if (n.id === targetNodeId) {
                    const existing = n.data.attachedStatuses || [];
                    return { ...n, data: { ...n.data, attachedStatuses: [...existing, statusData] } };
                }
                return n;
            });
            // Remove the status node from canvas
            return updated.filter(n => n.id !== statusNode.id);
        });

        // Remove any edges connected to the status node
        setEdges(eds => eds.filter(e => e.source !== statusNode.id && e.target !== statusNode.id));
    }, [setNodes, setEdges]);

    // Detach a status from a parent node (re-create as independent status node)
    const detachStatusFromNode = useCallback((parentNodeId, statusData, statusIndex) => {
        // Find parent node to get position
        const parentNode = nodes.find(n => n.id === parentNodeId);
        if (!parentNode) return;

        const newNodeId = `inst-s-${Date.now()}`;
        const newPos = {
            x: parentNode.position.x + (parentNode.measured?.width || 280) + 30,
            y: parentNode.position.y + statusIndex * 60
        };

        // Remove from parent's attachedStatuses
        setNodes(nds => {
            const updated = nds.map(n => {
                if (n.id === parentNodeId) {
                    const existing = n.data.attachedStatuses || [];
                    const filtered = existing.filter((_, idx) => idx !== statusIndex);
                    return { ...n, data: { ...n.data, attachedStatuses: filtered } };
                }
                return n;
            });
            // Add new independent status node
            return [...updated, {
                id: newNodeId,
                type: 'statusNode',
                position: newPos,
                data: {
                    name: statusData.name,
                    color: statusData.color,
                    description: statusData.description
                }
            }];
        });
    }, [nodes, setNodes]);

    const onNodeDragStop = (_, node) => {
        // Status node drag-attach: drop onto any non-group, non-status node → merge into parent
        if (node.type === 'statusNode') {
            const targetNode = nodes.find(n =>
                n.id !== node.id &&
                n.type !== 'statusNode' &&
                n.type !== 'groupNode' &&
                isPointInNode(node.position, n)
            );

            if (targetNode) {
                attachStatusToNode(node, targetNode.id);
                return;
            }
            // If not dropped on anything, just leave it as independent status node
            return;
        }

        // Existing group drop logic
        if (node.type !== 'groupNode') {
            const dropPos = { x: node.position.x, y: node.position.y };
            const absDropPos = node.parentId ? getAbsolutePosition(node, nodes) : dropPos;

            const targetGroup = nodes.find(n =>
                n.type === 'groupNode' && n.id !== node.id && n.id !== node.parentId && isPointInNode(absDropPos, n)
            );

            if (targetGroup) {
                setNodes(nds => nds.map(n => n.id === node.id ? {
                    ...n, parentId: targetGroup.id, extent: 'parent', position: getRelativePosition(absDropPos, targetGroup)
                } : n));
                return;
            } else if (node.parentId) {
                const parent = nodes.find(n => n.id === node.parentId);
                if (parent && !isPointInNode(absDropPos, parent)) {
                    setNodes(nds => nds.map(n => n.id === node.id ? {
                        ...n, parentId: undefined, extent: undefined, position: absDropPos
                    } : n));
                    return;
                }
            }
        }

        // Edge intersection logic
        const intersectingEdge = findIntersectingEdge(node, nodes, edges);
        setIntersectingEdgeId(null);

        if (intersectingEdge) {
            setNodes(nds => pushDownstreamNodes(intersectingEdge.target, 0, 200, nds, edges));
            setEdges((eds) => {
                const filtered = eds.filter((e) => e.id !== intersectingEdge.id);
                return [...filtered,
                { id: `e-${intersectingEdge.source}-${node.id}`, source: intersectingEdge.source, target: node.id, type: 'customEdge', data: { onDelete: deleteEdge }, animated: true, style: { stroke: '#fff' } },
                { id: `e-${node.id}-${intersectingEdge.target}`, source: node.id, target: intersectingEdge.target, type: 'customEdge', data: { onDelete: deleteEdge }, animated: true, style: { stroke: '#fff' } }
                ];
            });
            return;
        }

        const overlappedNode = nodes.find(n => n.id !== node.id && checkNodeOverlap(node, n));
        if (overlappedNode) {
            const hasConnections = edges.some(e => e.source === overlappedNode.id || e.target === overlappedNode.id);
            if (hasConnections) {
                setNodes(nds => pushDownstreamNodes(overlappedNode.id, 0, 250, nds, edges));
            }
        }
    };

    const handleImageUpload = (charId, file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => { updateCharacter(charId, 'imageUrl', reader.result); };
        reader.readAsDataURL(file);
    };

    const handleSummaryNodeClick = useCallback((nodeId) => {
        const targetNode = nodes.find(n => n.id === nodeId);
        if (targetNode) {
            setCenter(targetNode.position.x + 140, targetNode.position.y + 75, { zoom: 1.2, duration: 600 });
            setSelectedNodeId(nodeId);
        }
    }, [nodes, setCenter, setSelectedNodeId]);

    // Inject onOpenModal, onDetachStatus, and onOpenChapterEditor into nodes
    const nodesWithExtras = nodesWithHelpers.map(n => {
        const extras = {};
        if (n.type === 'characterNode') {
            extras.onOpenModal = setModalCharId;
        }
        if (n.type === 'storyNode') {
            extras.onOpenChapterEditor = setEditingChapterNodeId;
        }
        // All non-status nodes can have attached statuses
        if (n.type !== 'statusNode' && n.type !== 'groupNode') {
            extras.onDetachStatus = (statusData, idx) => detachStatusFromNode(n.id, statusData, idx);
        }
        if (Object.keys(extras).length > 0) {
            return { ...n, data: { ...n.data, ...extras } };
        }
        return n;
    });

    const editingChar = characters.find(c => c.id === editingCharId);
    const modalChar = modalCharId ? characterDefinitions[modalCharId] : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: '#121212', color: '#fff', fontFamily: 'sans-serif', overflow: 'hidden' }}>
            <Navbar
                addEvent={addEvent}
                isSelectionMode={isSelectionMode}
                setIsSelectionMode={setIsSelectionMode}
                exportProject={exportProject}
                importProject={importProject}
                clearProject={clearProject}
                showSummary={showSummary}
                setShowSummary={setShowSummary}
                showLibrary={showLibrary}
                setShowLibrary={setShowLibrary}
            />

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <LibrarySidebar
                    characters={characters}
                    items={items}
                    locations={locations}
                    statuses={statuses}
                    addCharacter={addCharacter}
                    addCharacterInstance={addCharacterInstance}
                    addItem={addItem}
                    addItemInstance={addItemInstance}
                    addLocation={addLocation}
                    addLocationInstance={addLocationInstance}
                    addStatus={addStatus}
                    addStatusInstance={addStatusInstance}
                    isCollapsed={!showLibrary}
                    onToggleCollapse={() => setShowLibrary(!showLibrary)}
                />

                <div style={{ flex: 1, position: 'relative' }}>
                    <ReactFlow
                        nodes={nodesWithExtras}
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

                {showSummary ? (
                    <StorySummary
                        nodes={nodes}
                        edges={edges}
                        characterDefinitions={characterDefinitions}
                        itemDefinitions={itemDefinitions}
                        locationDefinitions={locationDefinitions}
                        statusDefinitions={statusDefinitions}
                        onNodeClick={handleSummaryNodeClick}
                    />
                ) : (
                    <SidebarRight
                        editingChar={editingChar}
                        selectedItems={selectedItems}
                        selectedEdge={edges.find((e) => e.id === selectedEdgeId)}
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
                )}
            </div>

            {/* Character Modal */}
            {modalChar && (
                <CharacterModal
                    character={modalChar}
                    onUpdate={updateCharacter}
                    onClose={() => setModalCharId(null)}
                />
            )}

            {/* Chapter Editor Modal */}
            {editingChapterNodeId && (() => {
                const targetNode = nodes.find(n => n.id === editingChapterNodeId);
                if (!targetNode) return null;
                return (
                    <ChapterEditor
                        nodeId={editingChapterNodeId}
                        nodeLabel={targetNode.data.label || 'เหตุการณ์'}
                        chapters={targetNode.data.chapters || []}
                        onUpdateChapters={onUpdateChapters}
                        onClose={() => setEditingChapterNodeId(null)}
                    />
                );
            })()}
        </div>
    );
}

export default function App() {
    return (
        <ReactFlowProvider>
            <AppInner />
        </ReactFlowProvider>
    );
}
