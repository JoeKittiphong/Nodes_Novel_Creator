/**
 * Calculate distance from point (px, py) to line segment (x1, y1) - (x2, y2)
 */
export const getDistanceToSegment = (px, py, x1, y1, x2, y2) => {
    const l2 = (x1 - x2) ** 2 + (y1 - y2) ** 2;
    if (l2 === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.sqrt((px - (x1 + t * (x2 - x1))) ** 2 + (py - (y1 + t * (y2 - y1))) ** 2);
};

/**
 * Find if a node intersects with any existing edges
 */
export const findIntersectingEdge = (node, nodes, edges) => {
    const nodeCenter = {
        x: node.position.x + 100,
        y: node.position.y + 40
    };

    let found = null;
    const threshold = 35;

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

/**
 * Check if two nodes overlap based on their positions and estimated dimensions
 */
export const checkNodeOverlap = (nodeA, nodeB) => {
    // Estimating dimensions since they aren't always in state before rendering
    const widthA = 280;
    const heightA = 150;
    const widthB = 280;
    const heightB = 150;

    const rectA = {
        left: nodeA.position.x,
        right: nodeA.position.x + widthA,
        top: nodeA.position.y,
        bottom: nodeA.position.y + heightA
    };

    const rectB = {
        left: nodeB.position.x,
        right: nodeB.position.x + widthB,
        top: nodeB.position.y,
        bottom: nodeB.position.y + heightB
    };

    return !(rectA.right < rectB.left ||
        rectA.left > rectB.right ||
        rectA.bottom < rectB.top ||
        rectA.top > rectB.bottom);
};

/**
 * Check if a point (x, y) is inside a node's rectangle
 */
export const isPointInNode = (point, node) => {
    const width = node.measured?.width || 280;
    const height = node.measured?.height || 150;

    return (
        point.x >= node.position.x &&
        point.x <= node.position.x + width &&
        point.y >= node.position.y &&
        point.y <= node.position.y + height
    );
};

/**
 * Convert relative position (child of group) to absolute (canvas)
 */
export const getAbsolutePosition = (node, nodes) => {
    if (!node.parentId) return node.position;
    const parent = nodes.find(n => n.id === node.parentId);
    if (!parent) return node.position;

    const parentAbs = getAbsolutePosition(parent, nodes);
    return {
        x: node.position.x + parentAbs.x,
        y: node.position.y + parentAbs.y
    };
};

/**
 * Convert absolute position (canvas) to relative (child of parent)
 */
export const getRelativePosition = (absPos, parentNode) => {
    return {
        x: absPos.x - parentNode.position.x,
        y: absPos.y - parentNode.position.y
    };
};
