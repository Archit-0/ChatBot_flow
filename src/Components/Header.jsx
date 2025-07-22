
import { Save } from "lucide-react";

export default function Header({ validationMessage, onSave }) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-800">Chatbot Flow Builder</h1>
      <div className="flex items-center gap-4">
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
          onClick={onSave}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>
    </div>
  );
}
