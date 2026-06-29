import ExportMenu from "./ExportMenu";

export default function ActionBar({ redactedText, filename, redactedPdfId, entities = [], decision = {} }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(redactedText);
    alert("Redacted text copied to clipboard!");
  };


  return (
    <div className="flex gap-3 justify-center">
      <button
        onClick={handleCopy}
        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-lg transition-colors duration-200 shadow-sm hover:shadow"
      >
        Copy to Clipboard
      </button>
      <ExportMenu
        redactedText={redactedText}
        filename={filename}
        redactedPdfId={redactedPdfId}
        entities={entities}
        decision={decision}
      />
    </div>
  );
}

