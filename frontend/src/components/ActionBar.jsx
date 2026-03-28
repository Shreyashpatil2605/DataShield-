export default function ActionBar({ redactedText, filename }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(redactedText);
    alert("Redacted text copied to clipboard!");
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([redactedText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    const name = filename
      ? filename.replace(/\.[^/.]+$/, "") + "_redacted.txt"
      : "redacted_output.txt";
    element.download = name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex gap-3 justify-center">
      <button
        onClick={handleCopy}
        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-lg transition-colors duration-200 shadow-sm hover:shadow"
      >
        Copy to Clipboard
      </button>
      <button
        onClick={handleDownload}
        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-lg transition-colors duration-200 shadow-sm hover:shadow"
      >
        Download
      </button>
    </div>
  );
}
