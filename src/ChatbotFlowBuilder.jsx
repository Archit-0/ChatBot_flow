"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MessageCircle, Check, X, Save } from "lucide-react";

import { generateId, snapToGrid } from "./utils/FlowUtil";

import SettingsPanel from "./Components/SettingsPanel";
import NodesPanel from "./Components/NodesPanel";
import Canva from "./Components/Canva";

// Main App Component - This is the big boss. It manages all the state and orchestrates all the interactions.
export default function ChatbotFlowBuilder() {
  // === STATE MANAGEMENT ===
  // This is the heart of our application. All data lives here.
  const [nodes, setNodes] = useState([]); // Array of all message blocks on the canvas.
  const [connections, setConnections] = useState([]); // Array of all the arrows connecting nodes.
  const [selectedNodeId, setSelectedNodeId] = useState(null); // Which node is currently selected.
  const [showSettings, setShowSettings] = useState(false); // Controls if the SettingsPanel is visible.
  const [isConnecting, setIsConnecting] = useState(false); // Are we currently dragging a new connection line?
  const [connectionStart, setConnectionStart] = useState(null); // Info about where the connection started.
  const [validationMessage, setValidationMessage] = useState(""); // To show success or error messages.
  const [canvasTransform, setCanvasTransform] = useState({
    // For canvas panning and zooming.
    x: 0,
    y: 0,
    scale: 1,
  });
  const [isPanning, setIsPanning] = useState(false); // Is the user currently panning the canvas?
  const [panStart, setPanStart] = useState({ x: 0, y: 0 }); // Where the panning started.

  // Refs to get direct access to DOM elements.

  // === CANVAS PANNING LOGIC ===
  // These functions allow the user to click and drag the canvas background to pan around.

  const handleCanvasMouseMove = useCallback(
    (e) => {
      if (isPanning) {
        // Update the canvas transform based on mouse movement.
        setCanvasTransform((prev) => ({
          ...prev,
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        }));
      }
    },
    [isPanning, panStart]
  );

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Similar to node dragging, we use global event listeners for smooth panning.
  useEffect(() => {
    if (isPanning) {
      document.addEventListener("mousemove", handleCanvasMouseMove);
      document.addEventListener("mouseup", handleCanvasMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleCanvasMouseMove);
        document.removeEventListener("mouseup", handleCanvasMouseUp);
      };
    }
  }, [isPanning, handleCanvasMouseMove, handleCanvasMouseUp]);

  const updateNode = (nodeId, updates) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, ...updates } : node))
    );
  };

  const selectNode = (nodeId) => {
    setSelectedNodeId(nodeId);
    setShowSettings(true); // Show the settings panel when a node is selected.
  };

  // === DRAG AND DROP LOGIC ===
  // This handles dropping a new node from the NodesPanel onto the canvas.
  const canvasRef = useRef(null);
  // === CONNECTION HANDLING LOGIC ===
  // This is where we manage creating the arrows between nodes.
  const handleHandleMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const handleType = e.target.dataset.handleType;
    const nodeId = e.target.dataset.nodeId;

    // We can only start a connection from a "source" handle.
    if (handleType === "source") {
      // Business rule: a node can only have one outgoing connection.
      const hasOutgoing = connections.some((conn) => conn.source === nodeId);
      if (hasOutgoing) {
        setValidationMessage(
          "Error: Each node can only have one outgoing connection!"
        );
        setTimeout(() => setValidationMessage(""), 3000);
        return;
      }

      setIsConnecting(true);
      setConnectionStart({ nodeId, type: "source" });
    }
  };

  const handleHandleMouseUp = (e) => {
    // If we aren't in "connecting" mode, do nothing.
    if (!isConnecting || !connectionStart) return;

    e.stopPropagation();
    e.preventDefault();

    const handleType = e.target.dataset.handleType;
    const nodeId = e.target.dataset.nodeId;

    // We can only complete a connection on a "target" handle, and it can't be the same node.
    if (handleType === "target" && connectionStart.nodeId !== nodeId) {
      // Prevent creating duplicate connections.
      const existingConnection = connections.find(
        (conn) =>
          conn.source === connectionStart.nodeId && conn.target === nodeId
      );

      if (!existingConnection) {
        setConnections((prev) => [
          ...prev,
          {
            id: generateId(),
            source: connectionStart.nodeId,
            target: nodeId,
          },
        ]);
        setValidationMessage("Connection created successfully!");
        setTimeout(() => setValidationMessage(""), 2000);
      } else {
        setValidationMessage("Connection already exists between these nodes!");
        setTimeout(() => setValidationMessage(""), 2000);
      }
    }

    // Reset the connection state.
    setIsConnecting(false);
    setConnectionStart(null);
  };

  

  // This useEffect is crucial for making connections work. It finds all the handles
  // on the page and attaches our mouse down/up logic to them. It re-runs whenever
  // the state that affects connections changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handles = canvas.querySelectorAll(".handle");

    handles.forEach((handle) => {
      handle.addEventListener("mousedown", handleHandleMouseDown);
      handle.addEventListener("mouseup", handleHandleMouseUp);
    });

    // Cleanup function to remove listeners when the component re-renders.
    return () => {
      handles.forEach((handle) => {
        handle.removeEventListener("mousedown", handleHandleMouseDown);
        handle.removeEventListener("mouseup", handleHandleMouseUp);
      });
    };
  }, [nodes, connections, isConnecting, connectionStart]); // Dependency array is key!

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  // === RENDER ===
  // Finally, we put everything together on the screen.
  return (
    <div className="h-screen flex bg-gray-50">
      {/* The panel on the left is either the NodesPanel or SettingsPanel */}
      <NodesPanel
        isVisible={!showSettings}
        onDragStart={() => setValidationMessage("")}
      />

      {/* Main Canvas Area */}
      <Canva
        validationMessage={validationMessage}
        setValidationMessage={setValidationMessage}
        canvasTransform={canvasTransform}
        connections={connections}
        setNodes={setNodes}
        nodes={nodes}
        setIsPanning={setIsPanning}
        selectedNodeId={selectedNodeId}
        selectNode={selectNode}
        setPanStart={setPanStart}
        setSelectedNodeId={setSelectedNodeId}
        setShowSettings={setShowSettings}
        canvasRef={canvasRef}
      />

      {/* This inner div is what actually pans and zooms */}

      {/* SVG layer for drawing connections underneath the nodes */}

      {/* The nodes themselves, rendered on top of the connections */}
      {/* {nodes.map((node) => (
        <MessageNode
          key={node.id}
          node={node}
          isSelected={selectedNodeId === node.id}
          onSelect={selectNode}
          onDragStart={handleNodeDragStart}
          onDrag={handleNodeDrag}
          onDragEnd={handleNodeDragEnd}
        />
      ))} */}

      {/* The Settings Panel, which only shows when a node is selected */}
      {showSettings && (
        <SettingsPanel
          node={selectedNode}
          onUpdate={updateNode}
          onClose={() => {
            setShowSettings(false);
            setSelectedNodeId(null);
          }}
        />
      )}
    </div>
  );
}
