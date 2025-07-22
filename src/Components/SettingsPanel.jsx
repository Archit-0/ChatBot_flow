import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";

// Settings Panel - This panel appears when a user clicks on a node, allowing them to edit its content.
export default function SettingsPanel({ node, onUpdate, onClose }) {
  // We use local state for the text area to provide a snappy user experience.
  const [content, setContent] = useState(node?.content || "");

  // If the selected node changes, we need to update the content in our local state.
  useEffect(() => {
    setContent(node?.content || "");
  }, [node]);

  // When the user is done, they can click save to persist the changes.
  const handleSave = () => {
    onUpdate(node.id, { content });
    onClose(); // Close the panel.
  };

  if (!node) return null; // If no node is selected, don't show anything.

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Edit Message</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message Content
          </label>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              // We can also update in real-time if we want!
              // This provides instant feedback on the node itself.
              onUpdate(node.id, { content: e.target.value });
            }}
            placeholder="Enter your message here..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          Done
        </button>
      </div>

      <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600">
          <strong>Connection Rules:</strong>
          <br />• Each node can have only one outgoing connection
          <br />• Each node can have multiple incoming connections
          <br />• Multiple edges can connect to the same target handle
          <br />• Drag from blue dot (right) to gray dot (left) to connect
        </p>
      </div>
    </div>
  );
}
