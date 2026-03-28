import { useCallback, useState } from "react";

export default function DropZone({ onFile, loading }) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) onFile(file);
  };

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`block border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
        dragging
          ? "border-indigo-500 bg-indigo-900/20 shadow-md"
          : "border-gray-700 bg-gray-800 hover:border-gray-600 hover:shadow-md hover:bg-gray-700/50"
      }`}
    >
      <input
        type="file"
        className="hidden"
        accept=".txt,.pdf,.png,.jpg,.jpeg,.bmp,.tiff,.tif,.webp"
        onChange={handleChange}
      />
      {loading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-700 border-t-indigo-400 rounded-full animate-spin" />
          <p className="text-sm text-gray-300 font-medium">Analyzing file...</p>
        </div>
      ) : (
        <>
          <svg
            className="w-12 h-12 mx-auto mb-3 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm font-medium text-white">
            Drop a file here or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Supported: .txt · .pdf · .png · .jpg · .bmp · .tiff · .tif · .webp
          </p>
        </>
      )}
    </label>
  );
}
