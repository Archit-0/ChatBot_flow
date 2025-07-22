import { useRef, useState } from "react";
import { Save } from "lucide-react";
import Connection from "./Connection";
import MessageNode from "./MessageNode";
import { snapToGrid, generateId } from "../utils/FlowUtil.js";
const Canva = ({
  validationMessage,
  setValidationMessage,
  canvasTransform,
  connections,
  nodes,
  setNodes,
  selectedNodeId,
  selectNode,
  setIsPanning,
  setPanStart,
  setSelectedNodeId,
  setShowSettings,
  canvasRef,
}) => {
  const svgRef = useRef(null);

  const [draggedNodeId, setDraggedNodeId] = useState(null); // Which node is currently being dragged.

  const handleCanvasMouseDown = (e) => {
    // We only want to pan if the user clicks directly on the canvas background.
    if (
      e.target === canvasRef.current ||
      e.target.classList.contains("grid-bg")
    ) {
      setIsPanning(true);
      // Record where the pan started relative to the current transform.
      setPanStart({
        x: e.clientX - canvasTransform.x,
        y: e.clientY - canvasTransform.y,
      });
      // Deselect any node when panning the canvas.
      setSelectedNodeId(null);
      setShowSettings(false);
    }
  };
  const validateFlow = () => {
    if (nodes.length === 0) {
      setValidationMessage("Error: No nodes in the flow!");
      return false;
    }

    // First, clear any old errors.
    setNodes((prev) => prev.map((node) => ({ ...node, hasError: false })));

    // From here, rules only apply if there's more than one node.
    if (nodes.length > 1) {
      // Find nodes that aren't connected to anything.
      const nodesWithoutIncoming = nodes.filter(
        (node) => !connections.some((conn) => conn.target === node.id)
      );

      const nodesWithoutOutgoing = nodes.filter(
        (node) => !connections.some((conn) => conn.source === node.id)
      );

      // Rule: There should only be one "start" node (a node with no incoming connections).
      if (nodesWithoutIncoming.length > 1) {
        setNodes((prev) =>
          prev.map((node) => ({
            ...node,
            hasError: nodesWithoutIncoming.includes(node),
          }))
        );
        setValidationMessage(
          "Error: Multiple nodes have empty target handles (no incoming connections)!"
        );
        return false;
      }

      // Rule: There should only be one "end" node (a node with no outgoing connections).
      if (nodesWithoutOutgoing.length > 1) {
        setNodes((prev) =>
          prev.map((node) => ({
            ...node,
            hasError: nodesWithoutOutgoing.includes(node),
          }))
        );
        setValidationMessage("Error: You have unconnected steps!");
        return false;
      }

      // Rule: Check for any nodes that are completely isolated.
      const connectedNodeIds = new Set();
      connections.forEach((conn) => {
        connectedNodeIds.add(conn.source);
        connectedNodeIds.add(conn.target);
      });

      const isolatedNodes = nodes.filter(
        (node) => !connectedNodeIds.has(node.id)
      );
      if (isolatedNodes.length > 0 && nodes.length > 1) {
        setNodes((prev) =>
          prev.map((node) => ({
            ...node,
            hasError: isolatedNodes.includes(node),
          }))
        );
        setValidationMessage(
          "Error: Some nodes are not connected to the flow!"
        );
        return false;
      }
    }

    // Rule: Check for nodes with empty content.
    const emptyNodes = nodes.filter((node) => !node.content.trim());
    if (emptyNodes.length > 0) {
      setNodes((prev) =>
        prev.map((node) => ({
          ...node,
          hasError: emptyNodes.includes(node),
        }))
      );
      setValidationMessage("Error: Some nodes have empty messages!");
      return false;
    }
    // === VALIDATION LOGIC ===
    // The "rule checker" that runs when the user clicks "Save".
    const validateFlow = () => {
      if (nodes.length === 0) {
        setValidationMessage("Error: No nodes in the flow!");
        return false;
      }

      // First, clear any old errors.
      setNodes((prev) => prev.map((node) => ({ ...node, hasError: false })));

      // From here, rules only apply if there's more than one node.
      if (nodes.length > 1) {
        // Find nodes that aren't connected to anything.
        const nodesWithoutIncoming = nodes.filter(
          (node) => !connections.some((conn) => conn.target === node.id)
        );

        const nodesWithoutOutgoing = nodes.filter(
          (node) => !connections.some((conn) => conn.source === node.id)
        );

        // Rule: There should only be one "start" node (a node with no incoming connections).
        if (nodesWithoutIncoming.length > 1) {
          setNodes((prev) =>
            prev.map((node) => ({
              ...node,
              hasError: nodesWithoutIncoming.includes(node),
            }))
          );
          setValidationMessage(
            "Error: Multiple nodes have empty target handles (no incoming connections)!"
          );
          return false;
        }

        // Rule: There should only be one "end" node (a node with no outgoing connections).
        if (nodesWithoutOutgoing.length > 1) {
          setNodes((prev) =>
            prev.map((node) => ({
              ...node,
              hasError: nodesWithoutOutgoing.includes(node),
            }))
          );
          setValidationMessage("Error: You have unconnected steps!");
          return false;
        }

        // Rule: Check for any nodes that are completely isolated.
        const connectedNodeIds = new Set();
        connections.forEach((conn) => {
          connectedNodeIds.add(conn.source);
          connectedNodeIds.add(conn.target);
        });

        const isolatedNodes = nodes.filter(
          (node) => !connectedNodeIds.has(node.id)
        );
        if (isolatedNodes.length > 0 && nodes.length > 1) {
          setNodes((prev) =>
            prev.map((node) => ({
              ...node,
              hasError: isolatedNodes.includes(node),
            }))
          );
          setValidationMessage(
            "Error: Some nodes are not connected to the flow!"
          );
          return false;
        }
      }

      // Rule: Check for nodes with empty content.
      const emptyNodes = nodes.filter((node) => !node.content.trim());
      if (emptyNodes.length > 0) {
        setNodes((prev) =>
          prev.map((node) => ({
            ...node,
            hasError: emptyNodes.includes(node),
          }))
        );
        setValidationMessage("Error: Some nodes have empty messages!");
        return false;
      }

      // If all checks pass, the flow is valid!
      setValidationMessage("Success: Flow saved successfully!");
      return true;
    };
    // If all checks pass, the flow is valid!
    setValidationMessage("Success: Flow saved successfully!");
    return true;
  };

  const handleSave = () => {
    const isValid = validateFlow();
    if (isValid) {
      // In a real app, you'd send this data to a backend API.
      console.log("Saving flow:", { nodes, connections });
      setTimeout(() => setValidationMessage(""), 3000);
    } else {
      // Let the error message linger a bit longer.
      setTimeout(() => setValidationMessage(""), 5000);
    }
  };

  const updateNode = (nodeId, updates) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, ...updates } : node))
    );
  };
  const handleNodeDrag = (nodeId, x, y) => {
    updateNode(nodeId, { x, y });
  };
  const handleNodeDragEnd = () => {
    setDraggedNodeId(null);
  };

  const handleNodeDragStart = (nodeId) => {
    setDraggedNodeId(nodeId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };
  // === NODE OPERATIONS ===
  // Functions for creating and updating nodes.

  const addNode = (x, y, content = "") => {
    const newNode = {
      id: generateId(),
      x,
      y,
      content,
      hasError: false,
    };
    setNodes((prev) => [...prev, newNode]);
    return newNode.id;
  };

  const handleDrop = (e) => {
    e.preventDefault();

    try {
      const dragData = e.dataTransfer.getData("application/json");

      if (!dragData) {
        console.log("No drag data found");
        return;
      }

      const data = JSON.parse(dragData);

      if (data.type === "MESSAGE_NODE") {
        const rect = canvasRef.current.getBoundingClientRect();
        // Adjust drop coordinates for the current canvas pan/zoom.
        const x = e.clientX - rect.left - canvasTransform.x;
        const y = e.clientY - rect.top - canvasTransform.y;
        const snapped = snapToGrid(x, y);
        const nodeId = addNode(snapped.x, snapped.y, data.content);

        // A little timeout to make sure the new node is rendered before we select it.
        setTimeout(() => {
          selectNode(nodeId);
        }, 100);
      }
    } catch (error) {
      console.error("Error parsing drag data:", error);

      // Fallback in case something goes wrong with the drag data.
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - canvasTransform.x;
      const y = e.clientY - rect.top - canvasTransform.y;
      const snapped = snapToGrid(x, y);
      const nodeId = addNode(snapped.x, snapped.y, "");

      setTimeout(() => {
        selectNode(nodeId);
      }, 100);
    }
  };
  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Header with title and save button */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">
          Chatbot Flow Builder
        </h1>

        <div className="flex items-center gap-4">
          {/* Validation message appears here */}
          {validationMessage && (
            <div
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                validationMessage.startsWith("Success") ||
                validationMessage.includes("created")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {validationMessage}
            </div>
          )}

          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      {/* The Canvas itself */}
      <div
        ref={canvasRef}
        id="canvas"
        className="absolute inset-0 mt-16 cursor-grab active:cursor-grabbing"
        style={{
          backgroundImage: `
              radial-gradient(circle, #e5e7eb 1px, transparent 1px)
            `,
          backgroundSize: "20px 20px",
          backgroundPosition: `${canvasTransform.x}px ${canvasTransform.y}px`,
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onMouseDown={handleCanvasMouseDown}
      >
        {/* This inner div is what actually pans and zooms */}
        <div
          className="relative w-full h-full"
          style={{
            transform: `translate(${canvasTransform.x}px, ${canvasTransform.y}px) scale(${canvasTransform.scale})`,
          }}
        >
          {/* SVG layer for drawing connections underneath the nodes */}
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ overflow: "visible" }}
          >
            <defs>
              {/* Define the arrowhead marker that we'll use for our lines */}
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
              </marker>
            </defs>

            {connections.map((connection) => (
              <Connection
                key={connection.id}
                connection={connection}
                nodes={nodes}
              />
            ))}
          </svg>

          {/* The nodes themselves, rendered on top of the connections */}
          {nodes.map((node) => (
            <MessageNode
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              onSelect={selectNode}
              onDragStart={handleNodeDragStart}
              onDrag={handleNodeDrag}
              onDragEnd={handleNodeDragEnd}
              connections={connections}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Canva;
