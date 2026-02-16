# Nodes Novel Creator 🖋️📦

**Nodes Novel Creator** is a powerful, node-based narrative planning tool designed for writers and game developers. Visualize your story structure, manage complex character relationships, and organize plot points with an intuitive, interactive graph interface.

## ✨ Key Features

### 1. Visual Story Graph
- **Story Nodes**: Create and connect key events in your narrative.
- **Entity Nodes**: Manage **Characters**, **Items**, and **Locations** as distinct nodes.
- **Smart Connections**: Strict validation ensures that narrative relationships (e.g., Char-to-Event) are SEMANTICALLY correct.

### 2. Node Grouping System
- **Organization**: Bundle multiple nodes into **Groups** to represent chapters, story arcs, or locations.
- **Dynamic Drag-and-Drop**: Drag nodes into a group to parent them, or drag them out to detach.
- **Parental Sync**: Nodes inside a group move seamlessly with their container.

### 3. Advanced UX & UI
- **Neo-Brutalism Design**: A modern, high-contrast dark mode interface.
- **Property Sidebars**: Dedicated sidebars for managing selections, editing entity properties (names, colors, images), and adding new events.
- **Edge Interaction**: Delete connections easily or insert new nodes between existing edges.
- **Collision Avoidance**: Automatic node shifting to prevent overlap and maintain a clean layout.

## 🚀 Tech Stack
- **Framework**: [React](https://reactjs.org/)
- **Diagramming Engine**: [React Flow (xyflow)](https://reactflow.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS (Modern Dark Mode)

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/JoeKittiphong/Nodes_Novel_Creator.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Nodes_Novel_Creator
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📖 How to Use
1. **Add Items**: Use the Left Sidebar to inject Story Events, Characters, Items, or Locations into the canvas.
2. **Connect**: Drag from the handles on the sides of nodes to create relationships.
3. **Group**: Shift + Click to select multiple nodes, then use the **"จัดกลุ่มโหนดที่เลือก"** button in the Right Sidebar.
4. **Edit**: Click any node to open its property editor in the Right Sidebar.

---
Developed with ❤️ for storytellers.
