import { useState, useRef, useCallback, useEffect } from "react";
import { MessageCircle } from "lucide-react";
// Node component - This is the visual representation of a single message block on our canvas.
import { snapToGrid, generateId } from "../utils/FlowUtil.js";

export default function MessageNode({
  node,
  isSelected,
  onSelect,
  onDragStart,
  onDrag,
  onDragEnd,
  connections,
}) {
  // We manage the dragging state locally within the node.
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const nodeRef = useRef(null); // To get the node's position and dimensions.

  // Let's figure out if this node has connections so we can style the handles.
  const hasOutgoingConnection = connections.some(
    (conn) => conn.source === node.id
  );
  const hasIncomingConnection = connections.some(
    (conn) => conn.target === node.id
  );

  // When the user presses the mouse down on a node, we kick off the drag process.
  const handleMouseDown = (e) => {
    // We don't want to start dragging if the user is clicking on a connection handle.
    if (e.target.classList.contains("handle")) return;

    e.preventDefault();
    e.stopPropagation(); // Stop the event from bubbling up to the canvas.

    const rect = nodeRef.current.getBoundingClientRect();

    // We need to calculate the offset of the mouse click *inside* the node.
    // This prevents the node from annoyingly jumping to the cursor's position.
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    setIsDragging(true);
    // Let the parent component know we've started dragging.
    onDragStart(node.id);
    // Also, select the node when we start dragging it.
    onSelect(node.id);
  };

  // This function is called every time the mouse moves *while* we are dragging.
  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;

      e.preventDefault();

      const canvas = document.getElementById("canvas");
      const canvasRect = canvas.getBoundingClientRect();

      // Calculate the new top-left position of the node relative to the canvas.
      const newX = e.clientX - canvasRect.left - dragOffset.x;
      const newY = e.clientY - canvasRect.top - dragOffset.y;

      // Snap to the grid for that clean, organized look.
      const snapped = snapToGrid(newX, newY);
      // Send the new position up to the parent component to update the state.
      onDrag(node.id, snapped.x, snapped.y);
    },
    [isDragging, dragOffset, node.id, onDrag]
  );

  // When the user lets go of the mouse button, we stop dragging.
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd();
    }
  }, [isDragging, onDragEnd]);

  // The magic of dragging happens here. When `isDragging` becomes true,
  // we add event listeners to the *entire document*. This lets us track the mouse
  // even if it moves outside the node or the canvas. When the drag is over,
  // we clean up these listeners to prevent memory leaks.
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    // This is the main div for the node. Its position is updated via `style`.
    // We apply different styles based on whether it's selected, has an error, or is being dragged.
    <div
      ref={nodeRef}
      className={`absolute bg-white border-2 rounded-lg p-3 cursor-move shadow-lg min-w-[200px] max-w-[250px] select-none ${
        isSelected ? "border-blue-500 shadow-blue-200" : "border-gray-300"
      } ${
        node.hasError ? "border-red-500 bg-red-50" : ""
      } hover:shadow-xl transition-all ${isDragging ? "z-50" : "z-10"}`}
      style={{
        left: node.x,
        top: node.y,
        transform: isDragging ? "scale(1.05)" : "scale(1)",
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        if (!isDragging) {
          onSelect(node.id);
        }
      }}
    >
      {/* Target Handle (Left side, "IN" point) */}
      <div
        className={`handle absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 cursor-pointer z-20 ${
          hasIncomingConnection
            ? "bg-green-500 border-green-600"
            : "bg-gray-300 border-gray-400"
        } hover:scale-125 transition-transform`}
        data-handle-type="target"
        data-node-id={node.id}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Source Handle (Right side, "OUT" point) */}
      <div
        className={`handle absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full border-2 cursor-crosshair z-20 ${
          hasOutgoingConnection
            ? "bg-blue-500 border-blue-600"
            : "bg-gray-300 border-gray-400"
        } hover:scale-125 transition-transform`}
        data-handle-type="source"
        data-node-id={node.id}
        onClick={(e) => e.stopPropagation()}
      />

      {/* The actual content of the node */}
      <div className="flex items-start gap-2">
        <MessageCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800 break-words">
            {node.content || "Click to edit message..."}
          </p>
        </div>
      </div>
    </div>
  );
}
