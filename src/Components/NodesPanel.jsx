import { MessageCircle } from "lucide-react";

// Node component - This is the visual representation of a single message block on our canvas.
export default function NodesPanel({ isVisible, onDragStart }) {
  // When the user starts dragging a node from this panel...
  const handleDragStart = (e) => {
    // We pack the essential info about the new node into the drag event.
    // This data will be unpacked when the user "drops" it onto the canvas.
    const nodeData = {
      type: "MESSAGE_NODE",
      content: "",
    };

    // Set the drag data
    e.dataTransfer.setData("application/json", JSON.stringify(nodeData));
    e.dataTransfer.setData("text/plain", "MESSAGE_NODE");
    e.dataTransfer.effectAllowed = "copy"; // Show a "copy" cursor.

    onDragStart(); // Let the parent know to clear any validation messages.
  };

  if (!isVisible) return null; // This panel hides when the settings panel is open.

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Nodes</h3>

      <div className="space-y-2">
        <div
          draggable // This is the magic attribute that makes it draggable!
          onDragStart={handleDragStart}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-grab hover:bg-gray-100 transition-colors border border-gray-200 active:cursor-grabbing"
        >
          <MessageCircle className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">
            Message Node
          </span>
        </div>
      </div>

      <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-700">
          <strong>Tip:</strong> Drag the Message Node to the canvas to start
          building your flow.
        </p>
      </div>
    </div>
  );
}
